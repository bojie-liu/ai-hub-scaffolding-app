/**
 * Tutor app: objectives panel, streaming chat with progress detection, and a
 * teacher-only dashboard with per-student progress and transcripts.
 *
 * All display text is rendered with textContent; the tutor's completion markers
 * are stripped on the accumulated reply before anything is shown.
 * Requires tbs-client.js (global `tbs`) and ui.js (setConnBadge, showIdentity, fatal).
 */

(function () {
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(window.location.search);

  let objectives = [];
  let completed = [];
  let busy = false;

  tbs.onFatalError = (title, desc, detail) => fatal(title, desc, detail);
  tbs.onClose = () => {
    setConnBadge('closed');
    if (!busy) setChatEnabled(false, 'disconnected');
  };

  // --- Objectives ---

  function renderObjectives() {
    const list = $('objective-list');
    list.replaceChildren();

    if (objectives.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'chat-empty';
      empty.textContent = 'No objectives were configured for this session.';
      list.appendChild(empty);
      $('objective-count').textContent = '';
      return;
    }

    for (const objective of objectives) {
      const done = completed.indexOf(objective.id) !== -1;
      const item = document.createElement('li');
      item.className = 'objective' + (done ? ' done' : '');
      item.dataset.objectiveId = objective.id;

      const box = document.createElement('span');
      box.className = 'objective-box';
      box.setAttribute('aria-hidden', 'true');
      box.textContent = done ? '✓' : '';

      const body = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = objective.title;
      const desc = document.createElement('p');
      desc.textContent = objective.description;
      body.appendChild(title);
      body.appendChild(desc);

      const status = document.createElement('span');
      status.className = 'sr-only';
      status.textContent = done ? 'completed' : 'not completed';

      item.appendChild(box);
      item.appendChild(body);
      item.appendChild(status);
      item.setAttribute('aria-label', (done ? 'Completed: ' : 'Not completed: ') + objective.title);
      list.appendChild(item);
    }

    $('objective-count').textContent = completed.length + ' / ' + objectives.length;
  }

  async function loadObjectives() {
    try {
      // config.json is the single source of truth; read it fresh on every page load.
      const res = await fetch('config.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('config.json ' + res.status);
      const data = (await res.json()) || {};
      objectives = (Array.isArray(data.objectives) ? data.objectives : []).map((o) => ({
        id: String(o.id),
        title: String(o.title),
        description: String(o.description || ''),
      }));
      return typeof data.openingMessage === 'string' ? data.openingMessage : '';
    } catch (err) {
      objectives = [];
      renderObjectives();
      return '';
    }
  }

  async function refreshProgress() {
    try {
      completed = await tbs.getProgress();
    } catch (err) {
      // Chat still works without progress tracking; leave the list unchanged.
      return;
    }
    renderObjectives();
  }

  // --- Chat rendering ---

  function scrollChat(logId) {
    const log = $(logId || 'chat-log');
    log.scrollTop = log.scrollHeight;
  }

  function addMessage(role, text, logId, who) {
    const log = $(logId || 'chat-log');
    const empty = log.querySelector('.chat-empty');
    if (empty && logId !== 'transcript-log') empty.remove();

    const row = document.createElement('div');
    row.className = 'msg ' + role;

    const speaker = document.createElement('span');
    speaker.className = 'msg-who';
    speaker.textContent = who || (role === 'user' ? 'You' : 'Tutor');

    const body = document.createElement('div');
    body.className = 'msg-body';
    body.textContent = text;

    row.appendChild(speaker);
    row.appendChild(body);
    log.appendChild(row);
    scrollChat(logId);
    return body;
  }

  function setChatEnabled(enabled, status) {
    $('in-message').disabled = !enabled;
    $('btn-send').disabled = !enabled;
    if (status !== undefined) $('chat-status').textContent = status;
  }

  // --- Send a turn ---

  async function send() {
    if (busy || $('in-message').disabled) return;

    const text = $('in-message').value.trim();
    if (!text) return;

    addMessage('user', text);
    $('in-message').value = '';

    const bubble = addMessage('assistant', '');
    bubble.parentElement.classList.add('streaming');

    busy = true;
    $('in-message').disabled = true;
    $('btn-send').disabled = true;
    $('chat-status').textContent = 'thinking…';

    try {
      const reply = await tbs.chat(text, {
        onDelta: (delta, full) => {
          // Strip on the accumulated text: a marker can split across chunks.
          bubble.textContent = tbs.stripMarkers(full);
          scrollChat();
        },
      });
      bubble.textContent = tbs.stripMarkers(reply);
      await refreshProgress();
    } catch (err) {
      bubble.parentElement.classList.remove('streaming');
      bubble.parentElement.classList.add('error');
      bubble.textContent = err && err.message ? err.message : String(err);
    } finally {
      bubble.parentElement.classList.remove('streaming');
      busy = false;
      $('in-message').disabled = false;
      $('btn-send').disabled = false;
      $('chat-status').textContent = 'ready';
      scrollChat();
    }
  }

  // --- Teacher dashboard ---

  function completedCount(student) {
    return Array.isArray(student.completed) ? student.completed.length : 0;
  }

  async function loadStudents() {
    const list = $('student-list');
    $('dashboard-status').textContent = 'loading…';
    try {
      const students = await tbs.listStudents();
      list.replaceChildren();
      if (students.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'chat-empty';
        empty.textContent = 'Students appear here once they start chatting.';
        list.appendChild(empty);
      }
      for (const student of students) {
        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'student-row';
        row.dataset.conversationId = student.conversationId;
        row.addEventListener('click', () => openTranscript(student));

        const name = document.createElement('span');
        name.className = 'student-name';
        name.textContent = student.username || 'Guest';

        const progress = document.createElement('span');
        progress.className = 'student-progress' + (completedCount(student) === objectives.length && objectives.length > 0 ? ' complete' : '');
        const marks = objectives.map((o) => (student.completed || []).indexOf(o.id) !== -1 ? '●' : '○').join(' ');
        progress.textContent = marks + '   ' + completedCount(student) + ' / ' + (objectives.length || '3');

        const meta = document.createElement('span');
        meta.className = 'student-meta';
        meta.textContent = student.messageCount + ' messages';

        row.appendChild(name);
        row.appendChild(progress);
        row.appendChild(meta);
        list.appendChild(row);
      }
      $('dashboard-status').textContent = students.length + ' students';
    } catch (err) {
      list.replaceChildren();
      const note = document.createElement('p');
      note.className = 'chat-empty';
      note.textContent = err && err.status === 501
        ? 'Progress tracking is unavailable for this tool right now.'
        : (err && err.message) ? err.message : 'Could not load students.';
      list.appendChild(note);
      $('dashboard-status').textContent = '';
    }
  }

  async function openTranscript(student) {
    const panel = $('transcript-panel');
    const log = $('transcript-log');
    panel.style.display = 'block';
    $('transcript-title').textContent = (student.username || 'Guest') + ' — conversation';
    log.replaceChildren();
    const loading = document.createElement('p');
    loading.className = 'chat-empty';
    loading.textContent = 'Loading…';
    log.appendChild(loading);

    try {
      const transcript = await tbs.getStudentTranscript(student.conversationId);
      log.replaceChildren();
      if (transcript.openingMessage) {
        addMessage('assistant', tbs.stripMarkers(transcript.openingMessage), 'transcript-log');
      }
      for (const turn of transcript.messages || []) {
        addMessage(
          turn.author === 'user' ? 'user' : 'assistant',
          turn.content,
          'transcript-log',
          turn.author === 'user' ? (student.username || 'Student') : 'Tutor',
        );
      }
      if (!transcript.messages || transcript.messages.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'chat-empty';
        empty.textContent = 'No messages recorded yet.';
        log.appendChild(empty);
      }
    } catch (err) {
      log.replaceChildren();
      const note = document.createElement('p');
      note.className = 'chat-empty';
      note.textContent = err && err.message ? err.message : 'Could not load the conversation.';
      log.appendChild(note);
    }
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // --- Connect ---

  async function connect() {
    setConnBadge('connecting');
    setChatEnabled(false, 'connecting…');

    const identity = await tbs.connect();
    if (!identity) {
      setConnBadge('closed');
      setChatEnabled(false, 'not connected');
      return;
    }

    showIdentity(identity, identity);
    setConnBadge('connected');
    setChatEnabled(true, 'ready');

    if (params.get('hubUrl') && params.get('token')) await tbs.exchangeHubToken();

    const openingMessage = await loadObjectives();
    renderObjectives();
    await refreshProgress();

    // The tutor's opening message is not stored as a turn; show it once at the top.
    if (openingMessage.trim()) {
      addMessage('assistant', tbs.stripMarkers(openingMessage));
    } else {
      $('chat-empty').textContent = 'Ask your tutor anything to get started.';
    }

    if (tbs.isTeacher()) {
      $('teacher-dashboard').style.display = '';
      await loadStudents();
    }
  }

  // --- Wiring ---

  $('chat-form').addEventListener('submit', (e) => {
    e.preventDefault();
    send();
  });

  $('in-message').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  $('btn-refresh').addEventListener('click', loadStudents);
  $('btn-close-transcript').addEventListener('click', () => {
    $('transcript-panel').style.display = 'none';
  });

  setConnBadge('disconnected');
  setChatEnabled(false, 'not connected');

  connect();
})();
