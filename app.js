// State Management
const AppState = {
  role: localStorage.getItem('userRole') || 'student',
  progress: JSON.parse(localStorage.getItem('lessonProgress') || '{}'),
  quizAnswers: JSON.parse(localStorage.getItem('quizAnswers') || '{}')
};

// Save state to localStorage
function saveState() {
  localStorage.setItem('userRole', AppState.role);
  localStorage.setItem('lessonProgress', JSON.stringify(AppState.progress));
  localStorage.setItem('quizAnswers', JSON.stringify(AppState.quizAnswers));
}

// Role switching
function switchRole(role) {
  AppState.role = role;
  saveState();
  updateRoleDisplay();
  updateContentVisibility();
}

function updateRoleDisplay() {
  const roleElements = document.querySelectorAll('.current-role');
  roleElements.forEach(el => {
    el.textContent = AppState.role === 'teacher' ? 'Teacher' : 'Student';
  });
}

function updateContentVisibility() {
  const teacherOnly = document.querySelectorAll('.teacher-only');
  const studentOnly = document.querySelectorAll('.student-only');

  if (AppState.role === 'teacher') {
    teacherOnly.forEach(el => el.style.display = 'block');
    studentOnly.forEach(el => el.style.display = 'none');
  } else {
    teacherOnly.forEach(el => el.style.display = 'none');
    studentOnly.forEach(el => el.style.display = 'block');
  }
}

// Progress tracking
function markSectionComplete(sectionId) {
  AppState.progress[sectionId] = true;
  saveState();
  updateProgressIndicators();
}

function updateProgressIndicators() {
  Object.keys(AppState.progress).forEach(sectionId => {
    const indicator = document.querySelector(`[data-section="${sectionId}"]`);
    if (indicator && AppState.progress[sectionId]) {
      indicator.classList.add('completed');
    }
  });
}

// Quiz functionality
function checkAnswer(questionId, selectedOption, correctAnswer, feedback) {
  AppState.quizAnswers[questionId] = selectedOption;
  saveState();

  const options = document.querySelectorAll(`[data-question="${questionId}"] .quiz-option`);
  options.forEach(option => {
    option.style.pointerEvents = 'none';
    if (option.dataset.option === correctAnswer) {
      option.classList.add('correct');
    } else if (option.dataset.option === selectedOption) {
      option.classList.add('incorrect');
    }
  });

  const feedbackEl = document.getElementById(`feedback-${questionId}`);
  if (feedbackEl) {
    feedbackEl.textContent = feedback;
    feedbackEl.className = selectedOption === correctAnswer ? 'feedback success' : 'feedback error';
    feedbackEl.style.display = 'block';
  }
}

// Collapsible functionality
function toggleCollapsible(button) {
  button.classList.toggle('active');
  const content = button.nextElementSibling;
  content.classList.toggle('active');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  updateRoleDisplay();
  updateContentVisibility();
  updateProgressIndicators();

  // Set up role switcher buttons
  document.querySelectorAll('[data-role]').forEach(btn => {
    btn.addEventListener('click', () => switchRole(btn.dataset.role));
  });

  // Set up collapsible sections
  document.querySelectorAll('.collapsible').forEach(btn => {
    btn.addEventListener('click', () => toggleCollapsible(btn));
  });
});