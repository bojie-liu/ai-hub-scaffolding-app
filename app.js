// App.js - Place Value Lesson Plan Interactive Features
// localStorage keys
const STORAGE_KEYS = {
    role: 'placeValue_userRole',
    progress: 'placeValue_progress',
    preTest: 'placeValue_preTest',
    reflections: 'placeValue_reflections',
    exitTicket: 'placeValue_exitTicket'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeRole();
    loadProgress();
    markCurrentSectionComplete();
});

// Role Management
function initializeRole() {
    const roleSelect = document.getElementById('roleSelect');
    if (roleSelect) {
        const savedRole = localStorage.getItem(STORAGE_KEYS.role) || 'teacher';
        roleSelect.value = savedRole;
        roleSelect.addEventListener('change', function() {
            localStorage.setItem(STORAGE_KEYS.role, this.value);
            updateUIForRole(this.value);
        });
        updateUIForRole(savedRole);
    }
}

function updateUIForRole(role) {
    const teacherNotes = document.querySelectorAll('.teacher-note');
    teacherNotes.forEach(note => {
        note.style.display = role === 'teacher' ? 'block' : 'none';
    });
}

// Progress Tracking
function loadProgress() {
    const progressData = JSON.parse(localStorage.getItem(STORAGE_KEYS.progress) || '{}');
    const totalSections = 11;
    const completedSections = Object.keys(progressData).length;
    const progressPercent = Math.round((completedSections / totalSections) * 100);

    const progressPercentElem = document.getElementById('progressPercent');
    const progressFill = document.getElementById('progressFill');

    if (progressPercentElem) progressPercentElem.textContent = progressPercent + '%';
    if (progressFill) progressFill.style.width = progressPercent + '%';

    document.querySelectorAll('.nav-card').forEach(card => {
        const section = card.dataset.section;
        if (progressData[section]) {
            card.style.borderLeft = '5px solid #48bb78';
        }
    });
}

function markCurrentSectionComplete() {
    const path = window.location.pathname;
    let section = '';
    if (path.includes('outcomes')) section = 'outcomes';
    else if (path.includes('pre-class')) section = 'preclass';
    else if (path.includes('introduction')) section = 'intro';
    else if (path.includes('development')) section = 'development';
    else if (path.includes('synthesis')) section = 'synthesis';
    else if (path.includes('assessment')) section = 'assessment';
    else if (path.includes('alignment')) section = 'alignment';
    else if (path.includes('resources')) section = 'resources';
    else if (path.includes('differentiation')) section = 'differentiation';
    else if (path.includes('reflection')) section = 'reflection';
    else if (path.includes('slides')) section = 'slides';

    if (section) {
        const progressData = JSON.parse(localStorage.getItem(STORAGE_KEYS.progress) || '{}');
        progressData[section] = Date.now();
        localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progressData));
    }
}

// Toggle Reveal/Hide Content
function toggleReveal(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.toggle('hidden');
    }
}

// Pre-Test Functions
function checkPreTest() {
    checkAnswer('q1', '500', 'feedback1', (val) => val.trim() === '500');
    checkAnswer('q2', '23', 'feedback2', (val) => val.trim() === '23');
    checkAnswer('q3', '4000+0+80+9', 'feedback3', (val) => {
        const normalized = val.replace(/\s/g, '').toLowerCase();
        return normalized.includes('4000') && normalized.includes('80') && normalized.includes('9');
    });

    const q4Selected = document.querySelector('input[name="q4"]:checked');
    const feedback4 = document.getElementById('feedback4');
    if (q4Selected) {
        if (q4Selected.value === '1243') {
            feedback4.textContent = '✓ Correct! 1,243 is larger.';
            feedback4.className = 'feedback correct';
        } else {
            feedback4.textContent = '✗ Incorrect. Compare tens: 4 > 3.';
            feedback4.className = 'feedback incorrect';
        }
    }

    const q5Val = document.getElementById('q5').value;
    const feedback5 = document.getElementById('feedback5');
    if (q5Val.trim().length > 10) {
        feedback5.textContent = '✓ Good description!';
        feedback5.className = 'feedback correct';
    } else {
        feedback5.textContent = 'Please provide more detail.';
        feedback5.className = 'feedback incorrect';
    }

    savePreTestResults();
}

function checkAnswer(inputId, correctAnswer, feedbackId, validator) {
    const input = document.getElementById(inputId);
    const feedback = document.getElementById(feedbackId);
    if (input && feedback) {
        const isCorrect = validator(input.value);
        if (isCorrect) {
            feedback.textContent = '✓ Correct!';
            feedback.className = 'feedback correct';
        } else {
            feedback.textContent = '✗ Try again. Expected: ' + correctAnswer;
            feedback.className = 'feedback incorrect';
        }
    }
}

function savePreTestResults() {
    const results = {
        q1: document.getElementById('q1')?.value || '',
        q2: document.getElementById('q2')?.value || '',
        q3: document.getElementById('q3')?.value || '',
        q4: document.querySelector('input[name="q4"]:checked')?.value || '',
        q5: document.getElementById('q5')?.value || '',
        timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.preTest, JSON.stringify(results));
}

// Reflection Saving
function saveReflection() {
    const reflection = document.getElementById('guidingQuestion')?.value || '';
    if (reflection.trim()) {
        localStorage.setItem('guidingQuestionReflection', reflection);
        alert('✓ Your reflection has been saved!');
    } else {
        alert('Please write a reflection before saving.');
    }
}

// Independent Practice Check
function checkIndependent() {
    const answers = {
        exp1: '2000+300+40+0',
        exp2: '5000+600+70+8',
        exp3: '1000+0+0+9',
        exp4: '8000+500+20+0',
        exp5: '3000+400+0+7'
    };

    for (let i = 1; i <= 5; i++) {
        const input = document.getElementById('exp' + i);
        const feedback = document.getElementById('expFeedback' + i);
        if (input && feedback) {
            const normalized = input.value.replace(/\s/g, '');
            const expected = answers['exp' + i].replace(/\s/g, '');

            if (normalized === expected) {
                feedback.textContent = '✓ Correct!';
                feedback.className = 'feedback correct';
            } else {
                feedback.textContent = '✗ Expected: ' + answers['exp' + i];
                feedback.className = 'feedback incorrect';
            }
        }
    }
}

// Creation Task Check
function checkCreation() {
    const createNum = document.getElementById('createNum')?.value.trim() || '';
    const feedback = document.getElementById('createFeedback');

    if (feedback) {
        if (createNum === '4070' || createNum === '4,070') {
            feedback.textContent = '✓ Correct! 4,070';
            feedback.className = 'feedback correct';
        } else {
            feedback.textContent = '✗ Try again. 7 in tens, 4 in thousands, 0 elsewhere.';
            feedback.className = 'feedback incorrect';
        }
    }
}

// Metacognitive Reflection Save
function saveMetacog() {
    const reflection = document.getElementById('metacogReflection')?.value || '';
    if (reflection.trim()) {
        localStorage.setItem('metacogReflection', reflection);
        alert('✓ Your reflection has been saved!');
    } else {
        alert('Please write your reflection first.');
    }
}

// Post-Test Functions
function checkPostTest() {
    const post1 = document.getElementById('post1')?.value.trim() || '';
    const feedback1 = document.getElementById('postFeedback1');
    if (feedback1) {
        if (post1 === '9000' || post1 === '9,000') {
            feedback1.textContent = '✓ Correct! 9,000';
            feedback1.className = 'feedback correct';
        } else {
            feedback1.textContent = '✗ Incorrect. 9 in thousands place.';
            feedback1.className = 'feedback incorrect';
        }
    }

    const post2Selected = document.querySelector('input[name="post2"]:checked');
    const feedback2 = document.getElementById('postFeedback2');
    if (feedback2) {
        if (post2Selected && post2Selected.value === '5687') {
            feedback2.textContent = '✓ Correct! 5,687 > 5,678';
            feedback2.className = 'feedback correct';
        } else {
            feedback2.textContent = '✗ Compare tens: 8 > 7';
            feedback2.className = 'feedback incorrect';
        }
    }

    const post3 = document.getElementById('post3')?.value.replace(/\s/g, '') || '';
    const feedback3 = document.getElementById('postFeedback3');
    if (feedback3) {
        if (post3.includes('7000') && post3.includes('400') && post3.includes('3')) {
            feedback3.textContent = '✓ Correct! 7000 + 400 + 0 + 3';
            feedback3.className = 'feedback correct';
        } else {
            feedback3.textContent = '✗ Expected: 7000 + 400 + 0 + 3';
            feedback3.className = 'feedback incorrect';
        }
    }
}

// Peer Teaching Save
function savePeerTeach() {
    const peerTeach = document.getElementById('peerTeach')?.value || '';
    if (peerTeach.trim()) {
        localStorage.setItem('peerTeachResponse', peerTeach);
        alert('✓ Response saved!');
    }
}

// Exit Ticket Submit
function submitExitTicket() {
    const exitTicket = document.getElementById('exitTicket')?.value || '';
    if (exitTicket.trim()) {
        localStorage.setItem(STORAGE_KEYS.exitTicket, exitTicket);
        alert('✓ Exit ticket submitted!');
    } else {
        alert('Please complete the exit ticket first.');
    }
}

// Summative Assessment
function checkSummative() {
    let score = 0;
    const totalQuestions = 5;

    // Q1
    const sum1 = document.getElementById('sum1')?.value.trim() || '';
    const feedback1 = document.getElementById('sumFeedback1');
    if (feedback1) {
        if (sum1 === '7000' || sum1 === '7,000') {
            feedback1.textContent = '✓ Correct!';
            feedback1.className = 'feedback correct';
            score++;
        } else {
            feedback1.textContent = '✗ Incorrect. 7 in thousands = 7,000';
            feedback1.className = 'feedback incorrect';
        }
    }

    // Q2
    const sum2 = document.getElementById('sum2')?.value.replace(/\s/g, '') || '';
    const feedback2 = document.getElementById('sumFeedback2');
    if (feedback2) {
        if (sum2.includes('5000') && sum2.includes('40') && sum2.includes('6')) {
            feedback2.textContent = '✓ Correct!';
            feedback2.className = 'feedback correct';
            score++;
        } else {
            feedback2.textContent = '✗ Expected: 5000 + 0 + 40 + 6';
            feedback2.className = 'feedback incorrect';
        }
    }

    // Q3
    const sum3Selected = document.querySelector('input[name="sum3"]:checked');
    const feedback3 = document.getElementById('sumFeedback3');
    if (feedback3) {
        if (sum3Selected && sum3Selected.value === '<') {
            feedback3.textContent = '✓ Correct! 3,456 < 3,465';
            feedback3.className = 'feedback correct';
            score++;
        } else {
            feedback3.textContent = '✗ Compare tens: 5 < 6';
            feedback3.className = 'feedback incorrect';
        }
    }

    // Q4
    const sum4 = document.getElementById('sum4')?.value.trim() || '';
    const feedback4 = document.getElementById('sumFeedback4');
    if (feedback4) {
        if (sum4.length >= 4 && sum4.charAt(sum4.length - 4) === '9' && sum4.charAt(sum4.length - 1) === '2') {
            feedback4.textContent = '✓ Correct!';
            feedback4.className = 'feedback correct';
            score++;
        } else {
            feedback4.textContent = '✗ Check: 9 in hundreds, 2 in ones';
            feedback4.className = 'feedback incorrect';
        }
    }

    // Q5
    const sum5 = document.getElementById('sum5')?.value.trim() || '';
    const feedback5 = document.getElementById('sumFeedback5');
    if (feedback5) {
        if (sum5 === '5') {
            feedback5.textContent = '✓ Correct! 5 is in tens place';
            feedback5.className = 'feedback correct';
            score++;
        } else {
            feedback5.textContent = '✗ In 8,153, tens place has 5';
            feedback5.className = 'feedback incorrect';
        }
    }

    // Display score
    const quizScore = document.getElementById('quizScore');
    if (quizScore) {
        const percentage = Math.round((score / totalQuestions) * 100);
        quizScore.textContent = `Score: ${score}/${totalQuestions} (${percentage}%)`;
        quizScore.style.display = 'block';
        quizScore.style.padding = '15px';
        quizScore.style.marginTop = '20px';
        quizScore.style.borderRadius = '8px';
        quizScore.style.fontWeight = 'bold';
        quizScore.style.fontSize = '1.2rem';

        if (percentage >= 80) {
            quizScore.style.background = '#c6f6d5';
            quizScore.style.color = '#22543d';
        } else {
            quizScore.style.background = '#fed7d7';
            quizScore.style.color = '#742a2a';
        }
    }
}

// Reflection Save
function saveReflections() {
    const reflections = {
        q1: document.getElementById('reflect1')?.value || '',
        q2: document.getElementById('reflect2')?.value || '',
        q3: document.getElementById('reflect3')?.value || '',
        q4: document.getElementById('reflect4')?.value || '',
        timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.reflections, JSON.stringify(reflections));
    alert('✓ Reflections saved!');
}

// Slideshow Functions
let currentSlide = 1;
const totalSlides = 10;

function showSlide(n) {
    const slides = document.querySelectorAll('.slide');
    if (n > totalSlides) currentSlide = 1;
    if (n < 1) currentSlide = totalSlides;
    else currentSlide = n;

    slides.forEach(slide => slide.classList.remove('active'));
    if (slides[currentSlide - 1]) {
        slides[currentSlide - 1].classList.add('active');
    }

    const counter1 = document.getElementById('slideCounter');
    const counter2 = document.getElementById('slideCounter2');
    if (counter1) counter1.textContent = `Slide ${currentSlide} of ${totalSlides}`;
    if (counter2) counter2.textContent = `Slide ${currentSlide} of ${totalSlides}`;

    updateSlideButtons();
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

function prevSlide() {
    showSlide(currentSlide - 1);
}

function updateSlideButtons() {
    const prevBtns = [document.getElementById('prevBtn'), document.getElementById('prevBtn2')];
    const nextBtns = [document.getElementById('nextBtn'), document.getElementById('nextBtn2')];

    prevBtns.forEach(btn => {
        if (btn) btn.disabled = (currentSlide === 1);
    });

    nextBtns.forEach(btn => {
        if (btn) btn.disabled = (currentSlide === totalSlides);
    });
}

// Show Answers for Slides
function showAnswers() {
    document.getElementById('ans1')?.classList.remove('hidden');
    document.getElementById('ans2')?.classList.remove('hidden');
    document.getElementById('ans3')?.classList.remove('hidden');
}

// Initialize slides if on slides page
if (window.location.pathname.includes('slides.html')) {
    showSlide(1);
}
