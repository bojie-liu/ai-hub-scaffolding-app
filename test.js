/**
 * Network test client for the TBS SDK (tbs-client.js).
 * Drives the network test UI: verify, optional hub-token exchange, real-time
 * room, per-step status, message log, ping round-trip and message sending.
 *
 * UI helpers (setConnBadge, showIdentity, fatal) live in ui.js;
 * logging helpers (log, clearLog, updateStepStatus) live in test-utils.js.
 */

(function () {
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(window.location.search);

  let pingTimer = null;
  let fatalShown = false;

  // --- SDK callbacks (registered once) ---

  tbs.onStepChange = (step, status) => {
    updateStepStatus(step, status);
    log('info', step + ': ' + status);
  };

  tbs.onOpen = () => {
    setConnBadge('connected');
    log('info', 'WebSocket open');
  };

  tbs.onClose = (e) => {
    setConnBadge('closed');
    log('err', 'WebSocket closed (code ' + e.code + (e.reason ? ', ' + e.reason : '') + ')');
  };

  tbs.onError = (err) => {
    log('err', 'WebSocket error: ' + (err && err.message ? err.message : 'unknown'));
  };

  tbs.onParticipantJoined = (participant) => log('info', 'participant joined: ' + JSON.stringify(participant));
  tbs.onParticipantLeft = (participant) => log('info', 'participant left: ' + JSON.stringify(participant));

  tbs.onFatalError = (title, desc, detail) => {
    log('err', title + ' — ' + desc);
    if (fatalShown) return;
    fatalShown = true;
    setConnBadge('closed');
    fatal(title, desc, detail);
  };

  tbs.onMessage = (data, raw) => {
    if (pingTimer !== null) {
      $('ping-result').textContent = Math.round(performance.now() - pingTimer) + ' ms round-trip';
      pingTimer = null;
    }
    log('in', raw);
    if (data && data.type === 'pong') {
      log('info', 'received pong');
    }
  };

  // --- UI helpers ---

  function setPingResult(text) {
    $('ping-result').textContent = text;
  }

  // --- Connect / disconnect ---

  async function connect() {
    const hubUrl = $('in-hub-url').value.trim();
    const token = $('in-token').value.trim();
    const tbsUrl = $('in-tbs-url').value.trim();
    const tbsToken = $('in-tbs-token').value.trim();
    const tbsSession = $('in-tbs-session').value.trim();

    if (!tbsToken) {
      log('err', 'Missing parameters: TBS token is required');
      return;
    }

    // The verify token is single-use; reset the SDK so the newly entered
    // parameters are verified from scratch (reconnecting with an already-used
    // token will fail, as it should).
    tbs.disconnect();
    tbs.connectPromise = null;
    tbs.identity = null;
    tbs.hubIdentity = null;
    tbs.jwt = null;
    if (hubUrl) {
      tbs.hubUrl = hubUrl.replace(/\/$/, '');
      tbs.hubToken = token || null;
    }

    fatalShown = false;
    $('error-screen').style.display = 'none';
    $('main').style.display = '';
    $('identity-card').style.display = 'none';
    $('role-badge').style.display = 'none';
    for (const step of ['exchange', 'verify', 'ticket', 'ws']) {
      $('step-' + step).className = 'step';
    }

    setConnBadge('connecting');
    log('info', 'connecting to TBS ' + (tbsUrl || tbs.tbsUrl));

    const identity = await tbs.connect({ tbs_url: tbsUrl, tbs_token: tbsToken, tbs_session: tbsSession });
    if (!identity) {
      if (!fatalShown) setConnBadge('closed');
      return;
    }

    if (tbs.hubUrl && tbs.hubToken) {
      await tbs.exchangeHubToken();
    } else {
      tbs.setStepStatus('exchange', 'skip');
    }

    if (tbs.hasRoom()) {
      try {
        await tbs.connectRoom();
      } catch (err) {
        log('err', 'Room: ' + err.message);
      }
    } else {
      tbs.setStepStatus('ticket', 'skip');
      tbs.setStepStatus('ws', 'skip');
    }

    showIdentity(tbs.getIdentity() || {}, tbs.getIdentity() || {});
    setConnBadge(tbs.isConnected() ? 'connected' : 'disconnected');
    log('info', 'ready — role: ' + ((identity && identity.role) || 'unknown'));
  }

  function disconnect() {
    tbs.disconnect();
    setConnBadge('disconnected');
    setPingResult('—');
    log('info', 'disconnected');
  }

  // --- Ping ---

  function ping() {
    if (!tbs.isConnected()) {
      log('err', 'Cannot ping: WebSocket not connected');
      return;
    }
    pingTimer = performance.now();
    setPingResult('waiting…');
    try {
      log('out', tbs.sendPing());
    } catch (err) {
      log('err', err.message);
    }
  }

  // --- Send message ---

  function send() {
    if (!tbs.isConnected()) {
      log('err', 'Cannot send: WebSocket not connected');
      return;
    }

    const kind = $('send-kind').value;
    if (kind === 'ping') {
      ping();
      return;
    }

    let payload = {};
    const text = $('in-payload').value.trim();
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch (err) {
        log('err', 'Invalid payload JSON: ' + err.message);
        return;
      }
    }

    let sent;
    try {
      switch (kind) {
        case 'broadcast':
          sent = tbs.sendBroadcast(payload);
          break;
        case 'direct': {
          const to = $('in-to').value.trim();
          if (!to) {
            log('err', 'Direct message needs a recipient user ID');
            return;
          }
          sent = tbs.sendDirect(to, payload);
          break;
        }
        case 'state_sync':
          sent = tbs.sendStateSync(payload);
          break;
        case 'raw':
        default:
          sent = tbs.send(payload);
      }
    } catch (err) {
      log('err', err.message);
      return;
    }
    log('out', sent);
  }

  function syncComposer() {
    const kind = $('send-kind').value;
    $('to-wrap').style.display = kind === 'direct' ? '' : 'none';
    $('in-payload').disabled = kind === 'ping';
  }

  // --- Prefill from URL and auto-connect ---

  function prefill() {
    $('in-hub-url').value = params.get('hubUrl') || tbs.hubUrl || 'http://localhost:3000';
    $('in-tbs-url').value = params.get('tbs_url') || params.get('tbsUrl') || tbs.tbsUrl || 'http://localhost:3001';
    $('in-token').value = params.get('token') || '';
    $('in-tbs-token').value = params.get('tbs_token') || params.get('tbsToken') || '';
    $('in-tbs-session').value = params.get('tbs_session') || params.get('tbsSession') || '';

    $('hub-url').textContent = $('in-hub-url').value;
  }

  // --- Wiring ---

  $('connect-form').addEventListener('submit', (e) => {
    e.preventDefault();
    connect();
  });
  $('btn-disconnect').addEventListener('click', disconnect);
  $('btn-ping').addEventListener('click', ping);
  $('btn-send').addEventListener('click', send);
  $('btn-clear-log').addEventListener('click', clearLog);
  $('send-kind').addEventListener('change', syncComposer);

  prefill();
  syncComposer();
  setConnBadge('disconnected');

  const tbsToken = params.get('tbs_token') || params.get('tbsToken');
  if (tbsToken) {
    connect();
  } else {
    log('info', 'Enter connection parameters and press Connect (they can also be supplied via URL).');
  }
})();
