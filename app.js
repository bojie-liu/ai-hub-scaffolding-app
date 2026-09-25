/* ============================================================
   LEARNING THEORIES — Shared Application Logic
   ============================================================ */

/* ────────────────────────────────────────
   1. Role Management
──────────────────────────────────────── */
const ROLE_KEY = 'lt_role';

function getRole() {
  return localStorage.getItem(ROLE_KEY) || 'student';
}

function setRole(role) {
  localStorage.setItem(ROLE_KEY, role);
  applyRole(role);
}

function applyRole(role) {
  document.body.classList.remove('role-teacher', 'role-student');
  document.body.classList.add('role-' + role);

  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.role === role);
  });

  const banner = document.getElementById('role-banner');
  if (banner) {
    banner.className = 'role-banner ' + role;
    banner.textContent = role === 'teacher'
      ? '🎓 Teacher View — additional notes and guidance are visible'
      : '📚 Student View — focus on activities and learning tasks';
  }
}

function initRoleToggle() {
  const role = getRole();
  applyRole(role);
  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', () => setRole(btn.dataset.role));
  });
}

/* ────────────────────────────────────────
   2. Progress Tracking
──────────────────────────────────────── */
const PROGRESS_KEY = 'lt_progress';

function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
  } catch { return {}; }
}

function markVisited(page) {
  const p = getProgress();
  p[page] = { visited: true, ts: Date.now() };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}

function getCompletedCount() {
  return Object.values(getProgress()).filter(v => v.visited).length;
}

function updateProgressDisplay() {
  const bar = document.getElementById('progress-bar');
  const label = document.getElementById('progress-label');
  if (!bar) return;
  const total = 10; // total trackable pages
  const done = getCompletedCount();
  const pct = Math.round((done / total) * 100);
  bar.style.width = pct + '%';
  if (label) label.textContent = `${done} / ${total} sections visited (${pct}%)`;
}

/* ────────────────────────────────────────
   3. Navigation — active link highlight
──────────────────────────────────────── */
function highlightActiveNav() {
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav .nav-links a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    a.classList.toggle('active', href === current);
  });
}

/* ────────────────────────────────────────
   4. Accordion
──────────────────────────────────────── */
function initAccordions() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const body = header.nextElementSibling;
      const open = body.classList.contains('open');
      body.classList.toggle('open', !open);
      header.classList.toggle('open', !open);
    });
  });
}

/* ────────────────────────────────────────
   5. Simple Quiz Engine
──────────────────────────────────────── */
function initQuizzes() {
  document.querySelectorAll('.quiz-block').forEach(quiz => {
    const options = quiz.querySelectorAll('.quiz-option');
    const feedback = quiz.querySelector('.quiz-feedback');
    const correct = quiz.dataset.correct;
    let answered = false;

    options.forEach(opt => {
      opt.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        options.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');

        const isCorrect = opt.dataset.value === correct;
        opt.classList.add(isCorrect ? 'correct' : 'incorrect');
        if (!isCorrect) {
          options.forEach(o => {
            if (o.dataset.value === correct) o.classList.add('correct');
          });
        }
        if (feedback) {
          feedback.style.display = 'block';
          feedback.className = 'quiz-feedback ' + (isCorrect ? 'correct' : 'incorrect');
          feedback.textContent = isCorrect
            ? (quiz.dataset.feedbackCorrect || '✓ Correct!')
            : (quiz.dataset.feedbackIncorrect || '✗ Not quite — review the highlighted answer.');
        }
        saveQuizResult(quiz.id, opt.dataset.value, isCorrect);
      });
    });
  });
}

/* ────────────────────────────────────────
   6. Quiz Results Persistence
──────────────────────────────────────── */
const QUIZ_KEY = 'lt_quiz_results';

function saveQuizResult(quizId, answer, correct) {
  if (!quizId) return;
  try {
    const results = JSON.parse(localStorage.getItem(QUIZ_KEY)) || {};
    results[quizId] = { answer, correct, ts: Date.now() };
    localStorage.setItem(QUIZ_KEY, JSON.stringify(results));
  } catch {}
}

function getQuizResults() {
  try { return JSON.parse(localStorage.getItem(QUIZ_KEY)) || {}; } catch { return {}; }
}

/* ────────────────────────────────────────
   7. Exit Ticket / Textarea Persistence
──────────────────────────────────────── */
function initExitTickets() {
  document.querySelectorAll('[data-persist]').forEach(el => {
    const key = 'lt_et_' + el.dataset.persist;
    const saved = localStorage.getItem(key);
    if (saved) el.value = saved;
    el.addEventListener('input', () => localStorage.setItem(key, el.value));
  });
  document.querySelectorAll('.save-ticket-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.textContent = '✓ Saved';
      btn.disabled = true;
      setTimeout(() => { btn.textContent = 'Save Response'; btn.disabled = false; }, 2000);
    });
  });
}

/* ────────────────────────────────────────
   8. Smooth scroll for anchor links
──────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ────────────────────────────────────────
   9. Timer widget
──────────────────────────────────────── */
function initTimers() {
  document.querySelectorAll('.activity-timer').forEach(widget => {
    const mins = parseInt(widget.dataset.minutes || '5');
    let remaining = mins * 60;
    let interval = null;
    const display = widget.querySelector('.timer-display');
    const startBtn = widget.querySelector('.timer-start');
    const resetBtn = widget.querySelector('.timer-reset');

    function render() {
      const m = String(Math.floor(remaining / 60)).padStart(2, '0');
      const s = String(remaining % 60).padStart(2, '0');
      if (display) display.textContent = `${m}:${s}`;
    }
    render();

    if (startBtn) startBtn.addEventListener('click', () => {
      if (interval) { clearInterval(interval); interval = null; startBtn.textContent = '▶ Start'; return; }
      startBtn.textContent = '⏸ Pause';
      interval = setInterval(() => {
        remaining--;
        render();
        if (remaining <= 0) {
          clearInterval(interval); interval = null;
          startBtn.textContent = '▶ Start';
          if (display) display.textContent = 'Time\'s up!';
        }
      }, 1000);
    });
    if (resetBtn) resetBtn.addEventListener('click', () => {
      clearInterval(interval); interval = null;
      remaining = mins * 60; render();
      if (startBtn) startBtn.textContent = '▶ Start';
    });
  });
}

/* ────────────────────────────────────────
   10. Bootstrap on DOM ready
──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initRoleToggle();
  highlightActiveNav();
  initAccordions();
  initQuizzes();
  initExitTickets();
  initSmoothScroll();
  initTimers();
  updateProgressDisplay();

  // Mark this page as visited
  const page = location.pathname.split('/').pop() || 'index.html';
  markVisited(page);
  updateProgressDisplay();
});
