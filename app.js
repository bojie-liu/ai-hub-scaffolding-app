// Global state management
const AppState = {
  role: localStorage.getItem('userRole') || 'student',
  progress: JSON.parse(localStorage.getItem('lessonProgress') || '{}'),
  quizResults: JSON.parse(localStorage.getItem('quizResults') || '{}'),

  setRole(role) {
    this.role = role;
    localStorage.setItem('userRole', role);
    this.updateUI();
  },

  updateProgress(section, completed) {
    this.progress[section] = completed;
    localStorage.setItem('lessonProgress', JSON.stringify(this.progress));
    this.updateProgressBar();
  },

  saveQuizResult(quizId, score, answers) {
    this.quizResults[quizId] = { score, answers, timestamp: Date.now() };
    localStorage.setItem('quizResults', JSON.stringify(this.quizResults));
  },

  getQuizResult(quizId) {
    return this.quizResults[quizId];
  },

  updateUI() {
    const teacherElements = document.querySelectorAll('.teacher-only');
    teacherElements.forEach(el => {
      el.style.display = this.role === 'teacher' ? 'block' : 'none';
    });

    const roleToggle = document.getElementById('roleToggle');
    if (roleToggle) {
      roleToggle.textContent = `Role: ${this.role.charAt(0).toUpperCase() + this.role.slice(1)}`;
    }
  },

  updateProgressBar() {
    const progressBar = document.getElementById('progressFill');
    if (progressBar) {
      const completed = Object.values(this.progress).filter(v => v).length;
      const total = Object.keys(this.progress).length || 1;
      const percentage = (completed / total) * 100;
      progressBar.style.width = `${percentage}%`;
    }
  }
};

// Toggle user role
function toggleRole() {
  const newRole = AppState.role === 'teacher' ? 'student' : 'teacher';
  AppState.setRole(newRole);
}

// Initialize collapsible sections
function initCollapsibles() {
  const collapsibles = document.querySelectorAll('.collapsible');
  collapsibles.forEach(coll => {
    coll.addEventListener('click', function() {
      this.classList.toggle('active');
      const content = this.nextElementSibling;
      content.classList.toggle('active');
    });
  });
}

// Quiz functionality
function initQuiz(quizId) {
  const quizForm = document.getElementById(quizId);
  if (!quizForm) return;

  const existingResult = AppState.getQuizResult(quizId);
  if (existingResult && AppState.role === 'student') {
    showQuizResult(quizId, existingResult.score);
  }

  quizForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(quizForm);
    const answers = {};
    let score = 0;
    let total = 0;

    // Get all questions
    const questions = quizForm.querySelectorAll('.quiz-question');
    questions.forEach((question, index) => {
      const questionId = `q${index + 1}`;
      const selected = formData.get(questionId);
      const correctAnswer = question.dataset.correct;

      answers[questionId] = selected;
      total++;

      if (selected === correctAnswer) {
        score++;
        showFeedback(question, true);
      } else {
        showFeedback(question, false);
      }
    });

    AppState.saveQuizResult(quizId, score, answers);
    showQuizResult(quizId, score, total);
  });
}

function showFeedback(questionElement, isCorrect) {
  let feedback = questionElement.querySelector('.feedback');
  if (!feedback) {
    feedback = document.createElement('div');
    feedback.className = 'feedback';
    questionElement.appendChild(feedback);
  }

  if (isCorrect) {
    feedback.className = 'feedback correct';
    feedback.textContent = '✓ Correct!';
  } else {
    feedback.className = 'feedback incorrect';
    feedback.textContent = '✗ Incorrect. Review the material and try again.';
  }
}

function showQuizResult(quizId, score, total) {
  let resultDiv = document.getElementById(`${quizId}-result`);
  if (!resultDiv) {
    resultDiv = document.createElement('div');
    resultDiv.id = `${quizId}-result`;
    resultDiv.className = 'card';
    document.getElementById(quizId).parentElement.appendChild(resultDiv);
  }

  const percentage = total ? Math.round((score / total) * 100) : score;
  resultDiv.innerHTML = `
    <h3>Quiz Result</h3>
    <p><strong>Score: ${score}/${total || score} (${percentage}%)</strong></p>
    <p>${percentage >= 70 ? '✓ Passed! Great work!' : 'Please review the material and retake the quiz.'}</p>
  `;
}

// Mark section as complete
function markComplete(section) {
  AppState.updateProgress(section, true);
  alert(`Section "${section}" marked as complete!`);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  AppState.updateUI();
  AppState.updateProgressBar();
  initCollapsibles();

  // Initialize all quizzes on the page
  const quizzes = document.querySelectorAll('form[id^="quiz"]');
  quizzes.forEach(quiz => initQuiz(quiz.id));
});
