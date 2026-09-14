/* =====================================================
   Learning Theories Lesson Plan — Shared App Logic
   PSY101 | Introduction to Learning Theories
   ===================================================== */

// ── STATE ─────────────────────────────────────────────
const STATE_KEY = 'psy101_lp_state';

function getState() {
  try {
    return JSON.parse(localStorage.getItem(STATE_KEY)) || {};
  } catch { return {}; }
}

function saveState(updates) {
  const s = { ...getState(), ...updates };
  localStorage.setItem(STATE_KEY, JSON.stringify(s));
  return s;
}

// ── ROLE ──────────────────────────────────────────────
function getRole() { return getState().role || 'student'; }

function setRole(role) {
  saveState({ role });
  document.querySelectorAll('.role-badge').forEach(b => {
    b.className = 'role-badge ' + role;
    b.textContent = role === 'teacher' ? '👩‍🏫 Teacher' : '🎓 Student';
  });
  document.querySelectorAll('[data-role]').forEach(el => {
    const allowed = el.dataset.role.split(',');
    el.style.display = allowed.includes(role) ? '' : 'none';
  });
  document.querySelectorAll('.role-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.role-content.' + role).forEach(el => el.classList.add('active'));
}

function toggleRole() {
  setRole(getRole() === 'teacher' ? 'student' : 'teacher');
}

// ── NAVIGATION ────────────────────────────────────────
// ── PROGRESS TRACKING ─────────────────────────────────
function markSectionVisited(sectionId) {
  const s = getState();
  const visited = s.visited || [];
  if (!visited.includes(sectionId)) visited.push(sectionId);
  saveState({ visited });
  updateProgressBar();
}

function updateProgressBar() {
  const s = getState();
  const visited = (s.visited || []).length;
  const total = 8; // index + 6 sections + assessment
  const pct = Math.round((visited / total) * 100);
  document.querySelectorAll('.progress-fill').forEach(el => {
    el.style.width = pct + '%';
  });
  document.querySelectorAll('.progress-label').forEach(el => {
    el.textContent = pct + '% complete';
  });
}

// ── TABS ──────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    const buttons = tabGroup.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        const parent = btn.closest('.tab-section') || document;
        parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        parent.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = parent.querySelector('#' + target);
        if (panel) panel.classList.add('active');
      });
    });
    if (buttons.length) buttons[0].click();
  });
}

// ── ACCORDION ─────────────────────────────────────────
function initAccordions() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isOpen = item.classList.contains('open');
      item.closest('.accordion')?.querySelectorAll('.accordion-item')
        .forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

// ── QUIZ ENGINE ───────────────────────────────────────
function initQuizzes() {
  document.querySelectorAll('.quiz-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let score = 0, total = 0;
      form.querySelectorAll('.quiz-question').forEach(q => {
        total++;
        const correct = q.dataset.correct;
        const selected = q.querySelector('input:checked');
        const fb = q.querySelector('.quiz-feedback');
        if (selected && selected.value === correct) {
          score++;
          if (fb) { fb.textContent = '✅ Correct! ' + (q.dataset.exp || ''); fb.className = 'quiz-feedback correct'; }
        } else {
          if (fb) { fb.textContent = '❌ ' + (selected ? 'Incorrect.' : 'No answer.') + ' Correct: ' + correct + '. ' + (q.dataset.exp || ''); fb.className = 'quiz-feedback incorrect'; }
        }
      });
      const result = form.querySelector('.quiz-result');
      if (result) {
        result.textContent = 'Score: ' + score + ' / ' + total;
        result.className = 'quiz-result ' + (score === total ? 'perfect' : score >= total/2 ? 'good' : 'retry');
        result.style.display = 'block';
      }
      const qid = form.dataset.quizId;
      if (qid) { const qs = getState().quizScores || {}; qs[qid] = { score, total, ts: Date.now() }; saveState({ quizScores: qs }); }
    });
  });
}

function initNav() {
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
  const ham = document.getElementById('navHam');
  const links = document.getElementById('navLinks');
  if (ham && links) {
    ham.addEventListener('click', () => links.classList.toggle('open'));
  }
}
