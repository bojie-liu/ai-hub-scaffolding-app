/**
 * AI-InnoHub + TBS Connection Library
 *
 * Simple API for connecting to AI-InnoHub and TBS WebSocket sessions.
 * Import this library and call connect() with your parameters.
 */

class Connection {
  constructor() {
    const urlParams = new URLSearchParams(window.location.search);
    this.hubUrl = (urlParams.get('hubUrl') || 'http://localhost:3000').replace(/\/$/, '');
    this.identity = null;
    this.tbsJwt = null;
    this.ws = null;
    this.params = null;

    this.onStepChange = null;
    this.onMessage = null;
    this.onError = null;
    this.onOpen = null;
    this.onClose = null;
    this.onFatalError = null;
  }

  setStepStatus(step, status) {
    if (this.onStepChange) {
      this.onStepChange(step, status);
    }
  }

  async connect(params) {
    this.params = {
      token: params.token,
      tbsToken: params.tbs_token || params.tbsToken,
      tbsSession: params.tbs_session || params.tbsSession,
      tbsUrl: (params.tbs_url || params.tbsUrl || 'http://localhost:3011').replace(/\/$/, ''),
    };

    if (!this.params.token || !this.params.tbsToken || !this.params.tbsSession) {
      this.triggerFatal(
        'Missing parameters',
        'Required: token, tbs_token (or tbsToken), tbs_session (or tbsSession)',
        'Received: ' + JSON.stringify(params)
      );
      return false;
    }

    try {
      await this.exchangeToken();
      await this.verifyTbsToken();
      await this.getWsTicket();
      await this.openWebSocket();
      return true;
    } catch (err) {
      return false;
    }
  }

  async exchangeToken() {
    this.setStepStatus('exchange', 'busy');
    try {
      const res = await fetch(this.hubUrl + '/api/iframe/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: this.params.token }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        if (res.status === 0 || res.type === 'opaque') {
          this.setStepStatus('exchange', 'error');
          this.triggerFatal('CORS blocked', 'Exchange request blocked. Serve from allowed host (e.g. https://localhost:3011).', 'HTTP ' + res.status + '\n' + body);
        } else {
          this.setStepStatus('exchange', 'error');
          this.triggerFatal('Exchange failed (HTTP ' + res.status + ')', 'AI-InnoHub rejected the iframe token.', body);
        }
        throw new Error('Exchange failed');
      }

      this.identity = await res.json();
      this.setStepStatus('exchange', 'ok');
      return this.identity;
    } catch (err) {
      this.setStepStatus('exchange', 'error');
      this.triggerFatal('Exchange request failed', 'Could not reach AI-InnoHub at ' + this.hubUrl + '. Is it running?', err.message);
      throw err;
    }
  }

  async verifyTbsToken() {
    this.setStepStatus('verify', 'busy');
    try {
      const res = await fetch(this.params.tbsUrl + '/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: this.params.tbsToken,
          sessionId: this.params.tbsSession
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        this.setStepStatus('verify', 'error');
        this.triggerFatal('Verify failed (HTTP ' + res.status + ')', 'TBS rejected the token.', json);
        throw new Error('Verify failed');
      }

      this.tbsJwt = json.jwt;
      this.tbsInfo = json;
      this.setStepStatus('verify', 'ok');
      return json;
    } catch (err) {
      this.setStepStatus('verify', 'error');
      this.triggerFatal('Verify request failed', 'Could not reach TBS at ' + this.params.tbsUrl + '. Is it running?', err.message);
      throw err;
    }
  }

  async getWsTicket() {
    this.setStepStatus('ticket', 'busy');
    try {
      const res = await fetch(this.params.tbsUrl + '/ws-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.tbsJwt,
        },
        body: JSON.stringify({ sessionId: this.params.tbsSession }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        this.setStepStatus('ticket', 'error');
        this.triggerFatal('WS ticket failed (HTTP ' + res.status + ')', 'TBS refused to issue a WebSocket ticket.', json);
        throw new Error('WS ticket failed');
      }

      this.wsTicket = json.ticket;
      this.setStepStatus('ticket', 'ok');
      return json;
    } catch (err) {
      this.setStepStatus('ticket', 'error');
      this.triggerFatal('WS ticket request failed', 'Could not reach TBS at ' + this.params.tbsUrl + '.', err.message);
      throw err;
    }
  }

  async openWebSocket() {
    this.setStepStatus('ws', 'busy');

    const wsUrl = this.params.tbsUrl.replace(/^http/, 'ws') +
                  '/ws/' + this.params.tbsSession +
                  '?ticket=' + encodeURIComponent(this.wsTicket);

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.setStepStatus('ws', 'ok');
        if (this.onOpen) this.onOpen();
        resolve();
      };

      this.ws.onmessage = (e) => {
        if (this.onMessage) {
          try {
            const data = JSON.parse(e.data);
            this.onMessage(data, e.data);
          } catch {
            this.onMessage(e.data, e.data);
          }
        }
      };

      this.ws.onerror = (err) => {
        this.setStepStatus('ws', 'error');
        if (this.onError) this.onError(err);
        reject(err);
      };

      this.ws.onclose = (e) => {
        this.setStepStatus('ws', 'error');
        if (this.onClose) this.onClose(e);
      };
    });
  }

  send(message) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }
    const json = JSON.stringify(message);
    this.ws.send(json);
    return json;
  }

  sendBroadcast(payload) {
    return this.send({ type: 'broadcast', payload });
  }

  sendDirect(to, payload) {
    return this.send({ type: 'direct', to, payload });
  }

  sendStateSync(payload) {
    return this.send({ type: 'state_sync', payload });
  }

  sendPing() {
    return this.send({ type: 'ping' });
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  getIdentity() {
    return this.identity;
  }

  getTbsInfo() {
    return this.tbsInfo;
  }

  getJwt() {
    return this.tbsJwt;
  }

  triggerFatal(title, desc, detail) {
    if (this.onFatalError) {
      this.onFatalError(title, desc, detail);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

const connection = new Connection();
