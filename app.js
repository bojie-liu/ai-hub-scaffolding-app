// State Management and localStorage
const LessonState = {
  init() {
    this.role = localStorage.getItem('userRole') || 'student';
    this.progress = JSON.parse(localStorage.getItem('lessonProgress')) || {};
    this.quizAnswers = JSON.parse(localStorage.getItem('quizAnswers')) || {};
    this.applyRole();
  },

  setRole(role) {
    this.role = role;
    localStorage.setItem('userRole', role);
    this.applyRole();
  },

  applyRole() {
    document.body.className = this.role === 'teacher' ? 'teacher-view' : 'student-view';
    this.updateRoleButton();
  },

  updateRoleButton() {
    const btn = document.querySelector('.role-toggle');
    if (btn) {
      btn.textContent = this.role === 'teacher' ? 'Switch to Student View' : 'Switch to Teacher View';
    }
  },

  toggleRole() {
    this.setRole(this.role === 'teacher' ? 'student' : 'teacher');
  },

  saveProgress(section, completed = true) {
    this.progress[section] = { completed, timestamp: new Date().toISOString() };
    localStorage.setItem('lessonProgress', JSON.stringify(this.progress));
    this.updateProgressBar();
  },

  getProgress(section) {
    return this.progress[section] || { completed: false };
  },

  updateProgressBar() {
    const sections = ['learning-outcomes', 'pre-class', 'activities', 'assessment'];
    const completed = sections.filter(s => this.progress[s]?.completed).length;
    const percentage = (completed / sections.length) * 100;

    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
      progressFill.style.width = percentage + '%';
    }
  },

  saveQuizAnswer(questionId, answer, isCorrect) {
    this.quizAnswers[questionId] = { answer, isCorrect, timestamp: new Date().toISOString() };
    localStorage.setItem('quizAnswers', JSON.stringify(this.quizAnswers));
  }
};

// Collapsible Sections
function initCollapsibles() {
  const collapsibles = document.querySelectorAll('.collapsible');
  collapsibles.forEach(collapsible => {
    collapsible.addEventListener('click', function() {
      this.classList.toggle('active');
    });
  });
}

// Quiz Functionality
function initQuiz() {
  const quizOptions = document.querySelectorAll('.quiz-option');
  quizOptions.forEach(option => {
    option.addEventListener('click', function() {
      const question = this.closest('.quiz-question');
      const questionId = question.dataset.questionId;
      const isCorrect = this.dataset.correct === 'true';

      // Remove previous selections
      question.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.remove('correct', 'incorrect');
      });

      // Mark selected answer
      this.classList.add(isCorrect ? 'correct' : 'incorrect');

      // Show feedback
      const feedback = question.querySelector('.feedback');
      if (feedback) {
        feedback.style.display = 'block';
        feedback.className = isCorrect ? 'feedback success' : 'feedback error';
      }

      // Save answer
      LessonState.saveQuizAnswer(questionId, this.textContent, isCorrect);
    });
  });
}

// Slide Navigation
let currentSlide = 0;

function showSlide(n) {
  const slides = document.querySelectorAll('.slide');
  if (n >= slides.length) currentSlide = 0;
  if (n < 0) currentSlide = slides.length - 1;
  else currentSlide = n;

  slides.forEach((slide, index) => {
    slide.classList.toggle('active', index === currentSlide);
  });
}

function nextSlide() {
  showSlide(currentSlide + 1);
}

function prevSlide() {
  showSlide(currentSlide - 1);
}

// Navigation highlighting
function highlightCurrentPage() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('nav a');
  links.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  LessonState.init();
  initCollapsibles();
  initQuiz();
  highlightCurrentPage();

  // Role toggle button
  const roleToggle = document.querySelector('.role-toggle');
  if (roleToggle) {
    roleToggle.addEventListener('click', () => LessonState.toggleRole());
  }

  // Slide navigation
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);

  if (document.querySelector('.slide')) {
    showSlide(0);
  }
});
