/**
 * TBS Client SDK (v1.2.0)
 *
 * Plain-JavaScript client for the Tool Backend Service (TBS) platform API:
 * identity (/verify), AI chat (/chat, streaming or not), generic app data
 * (/data/*) and optional real-time rooms.
 *
 * Source of truth: templates/sdk/tbs-client.js in AI-InnoHub-front-end. Keep it in step with
 * services/tbs/src/routes.ts and templates/docs/tbs-api.md, then copy it to the template repo.
 *
 * Load it with a <script> tag. It exposes the TbsClient and TbsError classes and a ready-made
 * global instance called `tbs`.
 *
 *   tbs.onFatalError = (title, desc, detail) => showNotice(title, desc);
 *   const me = await tbs.connect();              // reads URL params, verifies once
 *   if (me) {
 *     // Chat: the SDK keeps the history and sends it in full every turn.
 *     const reply = await tbs.chat('Hello', { onDelta: (d, full) => render(full) });
 *
 *     // Or stay in control of the history yourself:
 *     const text = await tbs.complete([{ role: 'user', content: 'Hello' }], { stream: false });
 *
 *     // Tutor apps: objectives and per-student progress
 *     const objectives = await tbs.getObjectives();
 *     const progress = await tbs.getProgress();               // own completed objective ids
 *     if (tbs.isTeacher()) {
 *       const students = await tbs.listStudents();
 *       const transcript = await tbs.getStudentTranscript(students[0].conversationId);
 *     }
 *
 *     if (me.sessionId) await tbs.connectRoom();   // only when a room was given
 *   }
 *
 * URL parameters read from location.search:
 *   tbsUrl (or tbs_url)  base URL of TBS
 *   tbs_token            one-time identity token, redeemed once at /verify
 *   tbs_session          optional real-time room id
 *   hubUrl, token        optional, only for exchangeHubToken()
 *
 * The jwt is kept in memory only. Never persist it. The API key never reaches the browser.
 */

const TBS_CLIENT_VERSION = '1.2.0';

/** Server limits for POST /chat. */
const TBS_MAX_MESSAGES = 100;
const TBS_MAX_CONTENT = 32000;
const TBS_MAX_SYSTEM_PROMPT = 10000;

/** Completion markers emitted by a tutor persona. Stripped before display. */
const TBS_OBJECTIVE_MARKER = /\[\[OBJECTIVE_COMPLETE:([a-z0-9_-]+)\]\]/gi;

function tbsStripSlash(value) {
  return (value || '').replace(/\/$/, '');
}

/** Removes completion markers and the blank lines they leave behind. */
function tbsStripMarkers(text) {
  return String(text || '')
    .replace(TBS_OBJECTIVE_MARKER, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Unique objective ids named by markers in `text`, lowercased. */
function tbsExtractMarkers(text) {
  const ids = [];
  for (const m of String(text || '').matchAll(TBS_OBJECTIVE_MARKER)) {
    const id = m[1].toLowerCase();
    if (ids.indexOf(id) === -1) ids.push(id);
  }
  return ids;
}

class TbsError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'TbsError';
    this.status = status || 0;
    this.body = body || null;
  }
}

class TbsClient {
  constructor() {
    const urlParams = new URLSearchParams(window.location.search);
    this.version = TBS_CLIENT_VERSION;
    this.tbsUrl = tbsStripSlash(urlParams.get('tbsUrl') || urlParams.get('tbs_url'));
    this.tbsToken = urlParams.get('tbs_token') || urlParams.get('tbsToken') || null;
    this.roomId = urlParams.get('tbs_session') || urlParams.get('tbsSession') || null;
    this.hubUrl = tbsStripSlash(urlParams.get('hubUrl'));
    this.hubToken = urlParams.get('token') || null;

    this.identity = null;
    this.hubIdentity = null;
    this.jwt = null;
    this.history = [];
    this.ws = null;
    this.connectPromise = null;

    this.onStepChange = null;
    this.onFatalError = null;
    this.onOpen = null;
    this.onMessage = null;
    this.onParticipantJoined = null;
    this.onParticipantLeft = null;
    this.onError = null;
    this.onClose = null;
  }

  setStepStatus(step, status) {
    if (this.onStepChange) {
      this.onStepChange(step, status);
    }
  }

  triggerFatal(title, desc, detail) {
    if (this.onFatalError) {
      this.onFatalError(title, desc, detail);
    }
  }

  /** Override URL parameters, e.g. connect({ tbsUrl, tbs_token, tbs_session }). */
  applyParams(params) {
    if (params.tbsUrl || params.tbs_url) {
      this.tbsUrl = tbsStripSlash(params.tbsUrl || params.tbs_url);
    }
    if (params.tbs_token || params.tbsToken) {
      this.tbsToken = params.tbs_token || params.tbsToken;
    }
    if (params.tbs_session || params.tbsSession) {
      this.roomId = params.tbs_session || params.tbsSession;
    }
  }

  /** True when the page was opened with the parameters TBS needs. */
  isAvailable() {
    return !!(this.tbsUrl && this.tbsToken);
  }

  /**
   * Verifies the tbs_token once per page load and keeps the jwt in memory.
   * Resolves with the identity (without the jwt), or null when it could not be
   * established (onFatalError has been called). Repeated calls return the same
   * result: the token is single-use, so reload the page instead of verifying again.
   */
  connect(params) {
    if (this.connectPromise) return this.connectPromise;
    if (params) this.applyParams(params);

    if (!this.isAvailable()) {
      this.triggerFatal(
        'Missing parameters',
        'This tool was opened outside AI-InnoHub, so AI features are unavailable.',
        'Required URL parameters: tbsUrl and tbs_token'
      );
      return Promise.resolve(null);
    }

    this.connectPromise = this.verify();
    return this.connectPromise;
  }

  async verify() {
    this.setStepStatus('verify', 'busy');

    const body = { token: this.tbsToken };
    if (this.roomId) body.sessionId = this.roomId;

    let res;
    try {
      res = await fetch(this.tbsUrl + '/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (err) {
      this.setStepStatus('verify', 'error');
      this.triggerFatal('Cannot reach TBS', 'Could not reach TBS at ' + this.tbsUrl + '.', err.message);
      return null;
    }

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      this.setStepStatus('verify', 'error');
      this.triggerFatal(
        'Verify failed (HTTP ' + res.status + ')',
        this.describeError('verify', res.status, json),
        json
      );
      return null;
    }

    this.jwt = json.jwt;
    delete json.jwt;
    this.identity = json;
    this.setStepStatus('verify', 'ok');
    return this.identity;
  }

  /** Optional: learn who the user is on the platform origin (needs hubUrl and token). */
  async exchangeHubToken() {
    if (!this.hubUrl || !this.hubToken) return null;
    this.setStepStatus('exchange', 'busy');
    try {
      const res = await fetch(this.hubUrl + '/api/iframe/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: this.hubToken }),
      });
      if (!res.ok) throw new TbsError('Exchange failed (HTTP ' + res.status + ')', res.status);
      this.hubIdentity = await res.json();
      this.setStepStatus('exchange', 'ok');
      return this.hubIdentity;
    } catch (err) {
      this.setStepStatus('exchange', 'error');
      this.triggerFatal('Exchange failed', 'AI-InnoHub did not accept the page token.', err.message);
      return null;
    }
  }

  /** Turns a TBS error response into a message that is safe to show to the user. */
  describeError(kind, status, body) {
    const message = body && typeof body.error === 'string' ? body.error : '';
    if (status === 400) {
      return kind === 'chat'
        ? 'The message could not be sent. It may be empty or too long.'
        : 'The request was rejected as invalid.';
    }
    if (status === 401) {
      return 'Your session has expired or the link was already used. Reload the page from AI-InnoHub.';
    }
    if (status === 403) {
      return kind === 'ticket'
        ? 'This page is not allowed to join that real-time room.'
        : message || 'This request is not allowed for your session.';
    }
    if (status === 404) {
      return kind === 'verify'
        ? 'The real-time room no longer exists.'
        : kind === 'data'
          ? 'That data collection is not available for this tool.'
          : 'The AI assistant for this tool is unavailable.';
    }
    if (status === 409) {
      return 'This record changed in another tab. Reload and try again.';
    }
    if (status === 410) return 'The real-time room is gone or has ended.';
    if (status === 429) return 'Too many requests. Please wait a moment and try again.';
    if (status === 501) return 'AI support is not configured on the platform.';
    if (status === 502) return 'The AI service failed to respond. Please try again.';
    return message || 'Request failed (HTTP ' + status + ').';
  }

  // ---------------------------------------------------------------- identity

  getIdentity() {
    return this.identity;
  }

  getJwt() {
    return this.jwt;
  }

  isTeacher() {
    return !!this.identity && this.identity.role === 'teacher';
  }

  /** True when the tool has a teacher-configured AI persona. */
  hasAgent() {
    return !!this.identity && !!this.identity.agentId;
  }

  hasRoom() {
    return !!this.identity && !!this.identity.sessionId;
  }

  // -------------------------------------------------------------------- chat

  getHistory() {
    return this.history.slice();
  }

  clearHistory() {
    this.history = [];
  }

  /**
   * Checks and trims a conversation to what POST /chat accepts: only user and
   * assistant roles, at most 100 messages, content 1-32000 chars, oldest first.
   */
  prepareMessages(messages) {
    const clean = [];
    for (const m of messages || []) {
      if (!m || (m.role !== 'user' && m.role !== 'assistant')) {
        throw new TbsError('Chat messages must have the role user or assistant.', 0);
      }
      const content = typeof m.content === 'string' ? m.content : '';
      if (!content.trim()) {
        throw new TbsError('Chat messages cannot be empty.', 0);
      }
      clean.push({ role: m.role, content: content.slice(0, TBS_MAX_CONTENT) });
    }

    let trimmed = clean.slice(-TBS_MAX_MESSAGES);
    while (trimmed.length > 1 && trimmed[0].role !== 'user') trimmed.shift();
    if (!trimmed.length) {
      throw new TbsError('Nothing to send.', 0);
    }
    return trimmed;
  }

  /**
   * Stateless chat call: sends exactly the messages you pass (the server keeps no
   * history, so include the whole conversation, oldest first) and resolves with
   * the full reply text. The SDK history is not touched.
   *
   * options.stream        default true
   * options.onDelta       function(delta, fullTextSoFar), called per chunk when streaming
   * options.systemPrompt  only honoured when the tool has no AI persona (hasAgent() is false)
   * options.signal        an AbortSignal to cancel the request
   *
   * Rejects with a TbsError whose message is safe to show to the user.
   */
  async complete(messages, options) {
    options = options || {};
    if (!this.jwt) {
      throw new TbsError('Not connected. Call connect() first and make sure it succeeded.', 0);
    }

    const stream = options.stream !== false;
    const body = { messages: this.prepareMessages(messages), stream: stream };
    if (!this.hasAgent() && options.systemPrompt) {
      body.agentConfig = { systemPrompt: String(options.systemPrompt).slice(0, TBS_MAX_SYSTEM_PROMPT) };
    }

    let res;
    try {
      res = await fetch(this.tbsUrl + '/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.jwt },
        body: JSON.stringify(body),
        signal: options.signal,
      });
    } catch (err) {
      if (err && err.name === 'AbortError') throw err;
      throw new TbsError('Could not reach TBS at ' + this.tbsUrl + '.', 0, err.message);
    }

    // Errors found before a stream opens are always JSON.
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new TbsError(this.describeError('chat', res.status, json), res.status, json);
    }

    if (stream) {
      return this.readStream(res, options.onDelta);
    }
    const json = await res.json();
    return json.content || '';
  }

  /**
   * One user turn with the SDK managing the history. The full history is sent
   * every turn and only committed when the reply succeeds, so a failed turn can
   * simply be retried. Same options as complete().
   */
  async chat(text, options) {
    const reply = await this.complete(this.history.concat([{ role: 'user', content: text }]), options);
    this.history.push({ role: 'user', content: text });
    this.history.push({ role: 'assistant', content: reply });
    return reply;
  }

  async readStream(res, onDelta) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let full = '';

    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;

      // A chunk can split an event, so keep the trailing partial line.
      buffer += decoder.decode(chunk.value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const raw of lines) {
        const line = raw.replace(/\r$/, '');
        if (line.indexOf('data: ') !== 0) continue;
        const payload = line.slice(6);
        if (payload === '[DONE]') return full;

        let event;
        try {
          event = JSON.parse(payload);
        } catch (e) {
          continue;
        }

        if (event.type === 'text-delta') {
          full += event.delta;
          if (onDelta) onDelta(event.delta, full);
        } else if (event.type === 'error') {
          // Upstream failures arrive inside the stream, after the HTTP 200.
          throw new TbsError(event.error || 'The AI failed to respond.', 200, event);
        }
      }
    }
    return full;
  }

  // -------------------------------------------------------------- app data

  /** Authenticated JSON request to a TBS route, with user-safe error mapping. */
  async request(path, options) {
    options = options || {};
    if (!this.jwt) {
      throw new TbsError('Not connected. Call connect() first and make sure it succeeded.', 0);
    }
    let res;
    try {
      res = await fetch(this.tbsUrl + path, {
        method: options.method || 'GET',
        headers: Object.assign(
          { 'Authorization': 'Bearer ' + this.jwt },
          options.body !== undefined ? { 'Content-Type': 'application/json' } : {}
        ),
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        signal: options.signal,
      });
    } catch (err) {
      if (err && err.name === 'AbortError') throw err;
      throw new TbsError('Could not reach TBS at ' + this.tbsUrl + '.', 0, err.message);
    }
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new TbsError(this.describeError('data', res.status, json), res.status, json);
    }
    return json;
  }

  /**
   * Every record in a collection that this caller may read. Students get only
   * their own records unless the collection's policy says otherwise.
   */
  async listRecords(collection, options) {
    options = options || {};
    const query = options.subject ? '?subject=' + encodeURIComponent(options.subject) : '';
    const json = await this.request('/data/' + encodeURIComponent(collection) + query, { signal: options.signal });
    return json.records || [];
  }

  /** Reads one keyed record, or null when it does not exist yet. */
  async getRecord(collection, recordKey, options) {
    const records = await this.listRecords(collection, options);
    return records.find((r) => r.recordKey === recordKey) || null;
  }

  /**
   * Creates or replaces a keyed record with `data`. Pass options.expectedRevision
   * to reject a stale write (the promise rejects with a TbsError, status 409).
   */
  async putRecord(collection, recordKey, data, options) {
    options = options || {};
    const body = { data: data };
    if (options.expectedRevision !== undefined) body.expectedRevision = options.expectedRevision;
    const json = await this.request(
      '/data/' + encodeURIComponent(collection) + '/' + encodeURIComponent(recordKey),
      { method: 'PUT', body: body, signal: options.signal }
    );
    return json.record;
  }

  /** Appends an event row to a collection (no record key). */
  async appendRecord(collection, data, options) {
    options = options || {};
    const json = await this.request('/data/' + encodeURIComponent(collection), {
      method: 'POST',
      body: { data: data },
      signal: options.signal,
    });
    return json.record;
  }

  /** Teacher only: every subject that has records in a collection. */
  async listSubjects(collection, options) {
    options = options || {};
    const json = await this.request('/data/' + encodeURIComponent(collection) + '/subjects', { signal: options.signal });
    return json.subjects || [];
  }

  // ----------------------------------------------------------------- backend

  /**
   * Calls a route of this app's own generated backend, e.g. tbs.invoke('POST', '/notes', { text }).
   * For GET routes pass options.query as an object. TBS checks the caller's role against the
   * route's access list; the app and identity always come from the token, never from this call.
   */
  async invoke(method, path, body, options) {
    options = options || {};
    const verb = String(method || 'GET').toUpperCase();
    let url = '/fn/' + String(path).replace(/^\/+/, '');
    if (options.query) {
      const qs = new URLSearchParams(options.query).toString();
      if (qs) url += '?' + qs;
    }
    return this.request(url, {
      method: verb,
      body: verb === 'GET' || verb === 'DELETE' ? undefined : (body === undefined ? {} : body),
      signal: options.signal,
    });
  }

  // ------------------------------------------------------------------- tutor

  /** The three learning objectives from the tutor's stored config (read-only for apps), or []. */
  async getObjectives(options) {
    // config.json in the project is the source of truth; read it fresh on every call.
    try {
      const res = await fetch('config.json', { cache: 'no-store', signal: options && options.signal });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data && data.objectives) ? data.objectives : [];
    } catch (err) {
      if (err && err.name === 'AbortError') throw err;
      return [];
    }
  }

  /** The caller's own completed objective ids, e.g. ['obj1', 'obj3']. */
  async getProgress(options) {
    const record = await this.getRecord('objective_progress', 'progress', options);
    return (record && record.data && Array.isArray(record.data.completed)) ? record.data.completed : [];
  }

  /** Teacher only: students who have chatted, with message counts and completed objectives. */
  async listStudents(options) {
    if (!this.isTeacher()) {
      throw new TbsError('Only a teacher can list students.', 403);
    }
    options = options || {};
    const json = await this.request('/tutor/students', { signal: options.signal });
    return json.students || [];
  }

  /** Teacher only: one student's conversation, with the tutor's opening message. */
  async getStudentTranscript(conversationId, options) {
    if (!this.isTeacher()) {
      throw new TbsError('Only a teacher can read student transcripts.', 403);
    }
    options = options || {};
    return this.request('/tutor/students/' + encodeURIComponent(conversationId) + '/messages', { signal: options.signal });
  }

  /** Removes completion markers from assistant text before rendering. */
  stripMarkers(text) {
    return tbsStripMarkers(text);
  }

  /** Unique objective ids named by completion markers in `text`. */
  extractMarkers(text) {
    return tbsExtractMarkers(text);
  }

  // ------------------------------------------------------- real-time (room)

  /**
   * Opens the real-time room. Only call when hasRoom() is true. Fetches a fresh
   * single-use ticket each time, so call it again to reconnect.
   */
  async connectRoom() {
    if (!this.hasRoom()) {
      throw new TbsError('This tool has no real-time room.', 0);
    }
    if (!this.jwt) {
      throw new TbsError('Not connected. Call connect() first and make sure it succeeded.', 0);
    }
    this.disconnect();

    this.setStepStatus('ticket', 'busy');
    let res;
    try {
      res = await fetch(this.tbsUrl + '/ws-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.jwt },
        body: JSON.stringify({ sessionId: this.identity.sessionId }),
      });
    } catch (err) {
      this.setStepStatus('ticket', 'error');
      throw new TbsError('Could not reach TBS at ' + this.tbsUrl + '.', 0, err.message);
    }

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      this.setStepStatus('ticket', 'error');
      throw new TbsError(this.describeError('ticket', res.status, json), res.status, json);
    }
    this.setStepStatus('ticket', 'ok');

    return this.openWebSocket(json.ticket);
  }

  openWebSocket(ticket) {
    this.setStepStatus('ws', 'busy');
    const wsUrl = this.tbsUrl.replace(/^http/, 'ws') +
      '/ws/' + encodeURIComponent(this.identity.sessionId) +
      '?ticket=' + encodeURIComponent(ticket);

    return new Promise((resolve, reject) => {
      let opened = false;
      const ws = new WebSocket(wsUrl);
      this.ws = ws;

      ws.onopen = () => {
        opened = true;
        this.setStepStatus('ws', 'ok');
        if (this.onOpen) this.onOpen();
        resolve();
      };

      ws.onmessage = (e) => {
        let data;
        try {
          data = JSON.parse(e.data);
        } catch (err) {
          data = e.data;
        }
        if (data && data.type === 'participant_joined' && this.onParticipantJoined) {
          this.onParticipantJoined(data.participant);
        }
        if (data && data.type === 'participant_left' && this.onParticipantLeft) {
          this.onParticipantLeft(data.participant);
        }
        if (this.onMessage) this.onMessage(data, e.data);
      };

      ws.onerror = (err) => {
        this.setStepStatus('ws', 'error');
        if (this.onError) this.onError(err);
        if (!opened) reject(new TbsError('Could not open the real-time connection.', 0));
      };

      // The server never announces that a room closed: a close event is the end.
      // Code 1008 means the ticket or room was refused, 1011 a server error.
      ws.onclose = (e) => {
        this.setStepStatus('ws', 'error');
        if (this.onClose) this.onClose(e);
        if (!opened) reject(new TbsError('The real-time connection was refused (code ' + e.code + ').', 0));
      };
    });
  }

  send(message) {
    if (!this.isConnected()) {
      throw new TbsError('Real-time connection is not open.', 0);
    }
    const json = JSON.stringify(message);
    this.ws.send(json);
    return json;
  }

  /** Relayed to the whole room, including you. */
  sendBroadcast(payload) {
    return this.send({ type: 'broadcast', payload: payload });
  }

  /** Relayed to one participant. Guests have no userId and cannot be addressed. */
  sendDirect(to, payload) {
    if (!to) {
      throw new TbsError('sendDirect needs a userId. Guests cannot be addressed; use sendBroadcast.', 0);
    }
    return this.send({ type: 'direct', to: to, payload: payload });
  }

  /** Teacher only: a student state_sync is silently dropped by the server. */
  sendStateSync(payload) {
    if (!this.isTeacher()) {
      throw new TbsError('Only a teacher can send state_sync.', 0);
    }
    return this.send({ type: 'state_sync', payload: payload });
  }

  sendPing() {
    return this.send({ type: 'ping' });
  }

  isConnected() {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  disconnect() {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
  }
}

const tbs = new TbsClient();
