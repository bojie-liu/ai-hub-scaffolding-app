/* ==========================================================================
   Lesson manifest — THIS FILE IS GENERATED.
   Fill it with the lesson's identity, its section list and its tool pages.
   It carries structure only: nav labels, page titles, one-line blurbs.
   All prose and interactive content lives in the HTML pages themselves.
   Keep the file names in sync with the pages that actually exist.
   ========================================================================== */

window.LESSON = {
  /* Shown in the top bar and as the brand line in the footers. */
  brand: {
    name: "Lesson Plan",                 // FILL: lesson title
    sub: "Subject · Level · Duration"    // FILL: e.g. "Foundations of Education · Year 1 · 150 minutes"
  },

  /* Right-hand footer line. */
  footer: "Progress is saved in this browser only.",   // FILL

  /* localStorage namespace — pick one stable, lesson-specific key. */
  storeKey: "lesson.v1",

  /* The numbered lesson sections, in order. `index` must stay first. */
  sections: [
    { id: "index",     file: "index.html",     num: "00", icon: "⌂", title: "Overview",                       short: "Overview",   blurb: "Lesson at a glance and table of contents." },
    { id: "section-1", file: "section-1.html", num: "01", icon: "◎", title: "Intended Learning Outcomes",      short: "ILOs",       blurb: "Lesson and AI-literacy outcomes." },
    { id: "section-2", file: "section-2.html", num: "02", icon: "◱", title: "Pre-Class Preparation",           short: "Prep",       blurb: "Readings, video and diagnostic tasks." },
    { id: "section-3", file: "section-3.html", num: "03", icon: "▶", title: "Teaching & Learning Activities",  short: "Activities", blurb: "The full run sheet, block by block." },
    { id: "section-4", file: "section-4.html", num: "04", icon: "✓", title: "Assessment Methods",              short: "Assessment", blurb: "Formative, summative and feedback." },
    { id: "section-5", file: "section-5.html", num: "05", icon: "▦", title: "Constructive Alignment",          short: "Alignment",  blurb: "Outcome → activity → assessment matrix." },
    { id: "section-6", file: "section-6.html", num: "06", icon: "⚙", title: "Resources & Technology",          short: "Resources",  blurb: "Platforms, tools and materials." },
    { id: "section-7", file: "section-7.html", num: "07", icon: "☷", title: "Differentiation & Inclusivity",   short: "Access",     blurb: "Entry points, extension and accessibility." },
    { id: "section-8", file: "section-8.html", num: "08", icon: "↻", title: "Reflection & Improvement",        short: "Reflection", blurb: "Success indicators and iteration." }
  ],

  /* The three interactive / materials pages. */
  tools: [
    { id: "assessment", file: "assessment.html", num: "A", icon: "◈", title: "Practice Studio",        short: "Studio",  blurb: "Quizzes, flashcards, polls and decision logs." },
    { id: "slides",     file: "slides.html",     num: "B", icon: "▤", title: "Slide Deck",             short: "Slides",  blurb: "The presentation sequence for the session." },
    { id: "resources",  file: "resources.html",  num: "C", icon: "☰", title: "Materials & References", short: "Sources", blurb: "Printable worksheets and the reference list." }
  ]
};
