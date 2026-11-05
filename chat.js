/**
 * Chatbot test client for the TBS SDK (tbs-client.js).
 * Connects like the network test page, then exercises the chat API:
 * tbs.chat(text, { onDelta }) streams the reply and keeps the history in the SDK.
 * Identity/badge/fatal UI helpers live in ui.js.
 */

(function () {
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(window.location.search);

  let busy = false;

  tbs.onFatalError = (title, desc, detail) => fatal(title, desc, detail);
  tbs.onClose = () => {
    setConnBadge('closed');
    if (!busy) setChatEnabled(false, 'disconnected');
  };

  // --- Chat rendering ---

  function scrollChat() {
    const log = $('chat-log');
    log.scrollTop = log.scrollHeight;
  }

  function addMessage(role, text) {
    const empty = $('chat-empty');
    if (empty) empty.remove();

    const row = document.createElement('div');
    row.className = 'msg ' + role;

    const who = document.createElement('span');
    who.className = 'msg-who';
    who.textContent = role === 'user' ? 'You' : 'Assistant';

    const body = document.createElement('div');
    body.className = 'msg-body';
    body.textContent = text;

    row.appendChild(who);
    row.appendChild(body);
    $('chat-log').appendChild(row);
    scrollChat();
    return body;
  }

  function setChatEnabled(enabled, status) {
    $('in-message').disabled = !enabled;
    $('btn-send').disabled = !enabled;
    if (status !== undefined) $('chat-status').textContent = status;
  }

  // --- Connect / disconnect ---

  async function connect() {
    const hubUrl = $('in-hub-url').value.trim();
    const token = $('in-token').value.trim();
    const tbsUrl = $('in-tbs-url').value.trim();
    const tbsToken = $('in-tbs-token').value.trim();
    const tbsSession = $('in-tbs-session').value.trim();

    if (!tbsToken) {
      $('chat-status').textContent = 'missing tbs_token';
      return;
    }

    tbs.disconnect();
    tbs.connectPromise = null;
    tbs.identity = null;
    tbs.hubIdentity = null;
    tbs.jwt = null;
    if (hubUrl) {
      tbs.hubUrl = hubUrl.replace(/\/$/, '');
      tbs.hubToken = token || null;
    }

    $('error-screen').style.display = 'none';
    $('main').style.display = '';
    setConnBadge('connecting');
    setChatEnabled(false, 'connecting…');
    $('in-message').value = '';

    const identity = await tbs.connect({ tbs_url: tbsUrl, tbs_token: tbsToken, tbs_session: tbsSession });
    if (!identity) {
      setConnBadge('closed');
      setChatEnabled(false, 'not connected');
      return;
    }

    if (tbs.hubUrl && tbs.hubToken) await tbs.exchangeHubToken();

    showIdentity(tbs.getIdentity() || {}, tbs.getIdentity() || {});
    setConnBadge('connected');

    // The system prompt is only honoured when the tool has no AI persona.
    $('system-wrap').style.display = tbs.hasAgent() ? 'none' : '';
    setChatEnabled(true, tbs.hasAgent() ? 'ready' : 'ready (no persona)');
  }

  function disconnect() {
    tbs.disconnect();
    setConnBadge('disconnected');
    setChatEnabled(false, 'not connected');
  }

  // --- Send a turn ---

  async function send() {
    if (busy || $('in-message').disabled) return;

    const text = $('in-message').value.trim();
    if (!text) return;

    addMessage('user', text);
    $('in-message').value = '';

    const bubble = addMessage('assistant', '');
    bubble.classList.add('streaming');

    busy = true;
    $('in-message').disabled = true;
    $('btn-send').disabled = true;
    $('chat-status').textContent = 'thinking…';

    const options = {
      onDelta: (delta, full) => {
        bubble.textContent = full;
        scrollChat();
      },
    };
    const systemPrompt = $('in-system').value.trim();
    if (systemPrompt && !tbs.hasAgent()) {
      options.systemPrompt = systemPrompt;
    }

    try {
      const reply = await tbs.chat(text, options);
      bubble.textContent = reply;
    } catch (err) {
      bubble.classList.remove('streaming');
      bubble.classList.add('error');
      bubble.textContent = (err && err.message) ? err.message : String(err);
    } finally {
      bubble.classList.remove('streaming');
      busy = false;
      $('in-message').disabled = false;
      $('btn-send').disabled = false;
      $('chat-status').textContent = 'ready';
      scrollChat();
    }
  }

  function clearHistory() {
    tbs.clearHistory();
    $('chat-log').innerHTML = '<p class="chat-empty" id="chat-empty">History cleared. Type a message to start over.</p>';
  }

  // --- Prefill from URL ---

  (function prefill() {
    $('in-hub-url').value = params.get('hubUrl') || tbs.hubUrl || 'http://localhost:3000';
    $('in-tbs-url').value = params.get('tbs_url') || params.get('tbsUrl') || tbs.tbsUrl || 'http://localhost:3001';
    $('in-token').value = params.get('token') || '';
    $('in-tbs-token').value = params.get('tbs_token') || params.get('tbsToken') || '';
    $('in-tbs-session').value = params.get('tbs_session') || params.get('tbsSession') || '';
    $('hub-url').textContent = $('in-hub-url').value;
  })();

  // --- Wiring ---

  $('connect-form').addEventListener('submit', (e) => {
    e.preventDefault();
    connect();
  });
  $('btn-disconnect').addEventListener('click', disconnect);
  $('btn-clear').addEventListener('click', clearHistory);

  $('chat-form').addEventListener('submit', (e) => {
    e.preventDefault();
    send();
  });

  // Enter sends, Shift+Enter inserts a newline.
  $('in-message').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  setConnBadge('disconnected');
  setChatEnabled(false, 'not connected');

  const tbsToken = params.get('tbs_token') || params.get('tbsToken');
  if (tbsToken) connect();
})();
