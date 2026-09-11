# Scaffolding Reading Comprehension - Interactive Lesson Plan Website

## Overview
This interactive HTML website presents a comprehensive 120-minute university-level lesson plan on scaffolding reading comprehension for BEd (English Language) students. The lesson applies Vygotsky's Zone of Proximal Development pedagogy through think-aloud modelling and guided group annotation.

## Files Created

### Core Files
- **index.html** - Home page with navigation, overview, lesson timeline, and progress tracking
- **styles.css** - Shared CSS styles with responsive design, teacher/student view differentiation
- **app.js** - JavaScript for state management, localStorage, role toggling, collapsibles, quiz functionality, slide navigation

### Section Pages
1. **learning-outcomes.html** - 5 intended learning outcomes aligned with Bloom's Taxonomy
2. **pre-class-preparation.html** - Required readings, video, diagnostic quiz with interactive questions
3. **teaching-activities.html** - Detailed 120-minute lesson plan broken into phases with Mentimeter/Padlet integration instructions
4. **assessment-methods.html** - Formative and summative assessment with observation checklist and rubric
5. **alignment-matrix.html** - Constructive alignment matrix linking ILOs, activities, and assessments
6. **resources-technology.html** - Digital tools setup (Moodle, Mentimeter, Padlet, Google Slides), physical materials, academic references
7. **differentiation.html** - ZPD-aligned differentiation strategies, role cards with sentence starters, accessibility measures
8. **reflection.html** - Success indicators, feedback collection methods, modification strategies
9. **slides.html** - 10-slide presentation summary with keyboard navigation

## Key Features

### Teacher/Student Role Differentiation
- Toggle button switches between teacher and student views
- Teacher-only content includes: preparation checklists, observation notes, setup instructions
- Role preference persists via localStorage

### Interactive Elements
- **Collapsible sections** for external tool instructions
- **Interactive quiz** with instant feedback (5 questions on ZPD and scaffolding)
- **Progress tracking** - localStorage-based progress bar
- **Slide presentation** - Full 10-slide deck with keyboard navigation

### External Tool Integration
Step-by-step instructions for:
- **Mentimeter** - Misconception polls and real-time feedback
- **Padlet** - Group annotation gallery
- **Moodle** - Pre-class quiz and exit tickets
- **Google Slides** - Think-aloud modelling display

### Pedagogical Alignment
- **Vygotsky's ZPD** embedded throughout
- **Gradual release structure**: I do → We do → You do
- **Mixed-ability grouping** for peer scaffolding
- **Universal Design for Learning (UDL)** principles
- **Biggs' Constructive Alignment** model

### Responsive Design
- Mobile-first approach
- Card-based UI with consistent spacing
- Accessible color contrast
- Print-friendly styles

## Technical Details
- Pure HTML/CSS/JavaScript (no frameworks)
- localStorage for state persistence
- Vanilla JavaScript for interactivity
- Semantic HTML structure
- WCAG accessibility considerations

## Usage
1. Open `index.html` in any modern web browser
2. Use the navigation bar to explore sections
3. Toggle between Teacher/Student view as needed
4. Navigate slides with arrow keys or buttons
5. Progress is automatically saved in localStorage

## File Sizes
- Total: ~112 KB
- Largest: slides.html (13 KB)
- Average section: 6-9 KB
- Shared resources: styles.css (6.8 KB), app.js (4.5 KB)

All files include complete DOCTYPE, head with meta tags, navigation, and proper closing tags.
