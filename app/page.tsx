"use client";
import Navbar from "./components/Navbar";
import EditableText from "./components/EditableText";
import Quiz from "./components/Quiz";
import Flashcard from "./components/Flashcard";
import VennDiagram from "./components/VennDiagram";
import VideoPlayer from "./components/VideoPlayer";
import ScenarioQuiz from "./components/ScenarioQuiz";

const preTestQuestions = [
  {
    question: "What does it mean to 'construct' knowledge according to constructivist theory?",
    options: [
      "Memorise facts delivered by a teacher",
      "Actively build understanding by connecting new experiences to prior knowledge",
      "Copy information from a textbook",
      "Receive knowledge through observation alone",
    ],
    correct: 1,
    explanation: "Constructivism holds that learners are not passive recipients — they actively make meaning by linking new information to existing mental frameworks.",
  },
  {
    question: "Before today's lesson, which theorist were you most familiar with?",
    options: ["Piaget", "Vygotsky", "Both equally", "Neither"],
    correct: 0,
    explanation: "This question gauges prior exposure — there is no single correct answer, but Piaget is typically introduced earlier in most curricula.",
  },
  {
    question: "A child believes all four-legged animals are 'dogs'. When she sees a cat, she calls it a dog too. This is an example of:",
    options: ["Accommodation", "Assimilation", "Scaffolding", "Equilibration"],
    correct: 1,
    explanation: "Assimilation means fitting new information into an existing schema without changing the schema — the child is forcing 'cat' into her existing 'dog' schema.",
  },
  {
    question: "Which of the following best describes Vygotsky's Zone of Proximal Development?",
    options: [
      "Tasks a learner can do completely independently",
      "Tasks that are too difficult even with help",
      "Tasks a learner can do with guidance but not yet alone",
      "The physical space where learning occurs",
    ],
    correct: 2,
    explanation: "The ZPD is the productive gap between independent ability and potential ability with support — the ideal target zone for instruction.",
  },
  {
    question: "Which classroom practice most directly reflects social constructivism?",
    options: [
      "Silent individual reading",
      "Watching a lecture video",
      "Peer-assisted problem solving with teacher guidance",
      "Completing a multiple-choice test",
    ],
    correct: 2,
    explanation: "Social constructivism emphasises co-construction of knowledge through interaction. Peer collaboration with expert guidance is its clearest classroom expression.",
  },
];

const postTestQuestions = [
  {
    question: "Piaget's process of modifying an existing schema to incorporate new, conflicting information is called:",
    options: ["Assimilation", "Accommodation", "Scaffolding", "Internalisation"],
    correct: 1,
    explanation: "Accommodation involves restructuring or creating a new schema when existing ones cannot absorb new information — restoring equilibrium.",
  },
  {
    question: "A teacher provides sentence starters and graphic organisers to help students write an essay, then removes them over time. This illustrates:",
    options: ["Disequilibrium", "Assimilation", "Fading scaffolding", "Concrete operations"],
    correct: 2,
    explanation: "Fading is the deliberate, gradual removal of scaffolding as learner competence grows, promoting independent mastery.",
  },
  {
    question: "Which statement best captures the key difference between Piaget and Vygotsky?",
    options: [
      "Piaget focused on social interaction; Vygotsky on individual stages",
      "Piaget emphasised individual cognitive development; Vygotsky emphasised social and cultural mediation",
      "Both theorists agreed that development precedes learning",
      "Vygotsky rejected the concept of schemas entirely",
    ],
    correct: 1,
    explanation: "Piaget saw development as an individual, biologically-driven process; Vygotsky argued that social interaction and cultural tools drive cognitive development.",
  },
  {
    question: "According to Vygotsky, what is the primary role of language in learning?",
    options: [
      "A tool for memorisation only",
      "A medium for social interaction that mediates and shapes thought",
      "A sign of reaching the formal operations stage",
      "An output of learning, not a driver of it",
    ],
    correct: 1,
    explanation: "For Vygotsky, language is the most important cultural tool — it mediates thought, enables social learning, and is eventually internalised as inner speech.",
  },
  {
    question: "A constructivist teacher designs a lesson where students first predict, then experiment, then revise their ideas. Which principle does this most reflect?",
    options: [
      "Rote learning and repetition",
      "Creating disequilibrium to drive accommodation",
      "Direct instruction without prior knowledge activation",
      "Summative assessment before teaching",
    ],
    correct: 1,
    explanation: "Prediction followed by surprising results creates disequilibrium — the cognitive tension that motivates learners to accommodate and build deeper understanding.",
  },
];

const flashcards = [
  { front: "Constructivism", back: "A learning theory where learners actively build knowledge through experience rather than passively receiving information." },
  { front: "Schema", back: "A mental framework or structure that helps organize and interpret information (Piaget)." },
  { front: "Assimilation", back: "Incorporating new information into an existing schema without changing the schema." },
  { front: "Accommodation", back: "Modifying an existing schema or creating a new one to incorporate new information." },
  { front: "Zone of Proximal Development (ZPD)", back: "The gap between what a learner can do independently and what they can achieve with guidance (Vygotsky)." },
  { front: "Scaffolding", back: "Temporary support provided by a more knowledgeable other to help a learner accomplish a task within their ZPD." },
  { front: "More Knowledgeable Other (MKO)", back: "A person with greater knowledge or skill who assists a learner — a teacher, peer, or even technology." },
  { front: "Cognitive Equilibrium", back: "A state of balance between assimilation and accommodation; disrupted by new experiences (disequilibrium)." },
];

const quizQuestions = [
  {
    question: "According to Piaget, what happens when a child encounters information that does not fit an existing schema?",
    options: ["Assimilation", "Disequilibrium", "Scaffolding", "Internalization"],
    correct: 1,
    explanation: "Disequilibrium occurs when new information conflicts with existing schemas, motivating the learner to accommodate and restore balance.",
  },
  {
    question: "Which concept describes the range of tasks a learner can perform with guidance but not yet independently?",
    options: ["Schema", "Accommodation", "Zone of Proximal Development", "Cognitive load"],
    correct: 2,
    explanation: "Vygotsky's ZPD defines the sweet spot for instruction — tasks just beyond independent ability but achievable with support.",
  },
  {
    question: "A teacher gradually removes hints as a student masters a skill. This best illustrates:",
    options: ["Assimilation", "Fading scaffolding", "Disequilibrium", "Concrete operations"],
    correct: 1,
    explanation: "Fading is the gradual withdrawal of scaffolding as the learner gains competence, promoting independence.",
  },
  {
    question: "Which theorist is most associated with the social dimension of learning and the role of language?",
    options: ["Piaget", "Bruner", "Vygotsky", "Dewey"],
    correct: 2,
    explanation: "Vygotsky emphasized that language and social interaction are central to cognitive development.",
  },
];

export default function CoursePage() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10 space-y-16">

        {/* Hero */}
        <section className="text-center space-y-4 pt-4">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wider">
            <EditableText initialValue="Introduction to Educational Psychology" />
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
            <EditableText initialValue="Cognitive & Social Constructivism" />
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            <EditableText initialValue="How learners actively build knowledge — through individual cognition and social interaction." multiline />
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm"><EditableText initialValue="Piaget" /></span>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm"><EditableText initialValue="Vygotsky" /></span>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm"><EditableText initialValue="ZPD" /></span>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm"><EditableText initialValue="Scaffolding" /></span>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm"><EditableText initialValue="Schema" /></span>
          </div>
        </section>

        {/* 1. ILOs */}
        <section id="ilos" className="scroll-mt-20">
          <SectionHeader number="1" title="Intended Learning Outcomes" color="blue" />
          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            {[
              { icon: "🧠", text: "Define constructivism and distinguish cognitive from social constructivism." },
              { icon: "🔍", text: "Explain Piaget's key concepts: schemas, assimilation, accommodation, and equilibration." },
              { icon: "🤝", text: "Describe Vygotsky's ZPD, scaffolding, and the role of the MKO." },
              { icon: "⚖️", text: "Compare and contrast the two theories using evidence-based examples." },
              { icon: "🏫", text: "Apply constructivist principles to design classroom learning activities." },
            ].map((ilo, i) => (
              <div key={i} className="flex gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <span className="text-2xl shrink-0">{ilo.icon}</span>
                <p className="text-slate-700 text-sm leading-relaxed"><EditableText initialValue={ilo.text} multiline /></p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Pre-Class */}
        <section id="preclass" className="scroll-mt-20">
          <SectionHeader number="2" title="Pre-Class Preparation" color="amber" />
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
            <p className="text-slate-700 text-sm leading-relaxed">
              <EditableText initialValue="Before attending class, complete the following to activate prior knowledge:" multiline />
            </p>
            <ol className="space-y-3 list-none">
              {[
                { label: "Watch", desc: "\"Piaget's Stages of Development\" (Khan Academy, ~8 min)" },
                { label: "Watch", desc: "\"Vygotsky's Zone of Proximal Development\" (Sprouts, ~5 min)" },
                { label: "Reflect", desc: "Think of a time someone helped you learn something you couldn't do alone. What did they do?" },
                { label: "Read", desc: "Course textbook Chapter 7, pp. 210–228." },
              ].map((item, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-amber-400 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold text-amber-700"><EditableText initialValue={item.label} />: </span>
                    <EditableText initialValue={item.desc} multiline />
                  </p>
                </li>
              ))}
            </ol>
          </div>

          {/* Pre-reading article excerpt */}
          <div className="mt-6 bg-white border border-amber-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-amber-500 px-6 py-3 flex items-center gap-2">
              <span className="text-white text-lg">📄</span>
              <div>
                <p className="text-white font-semibold text-sm"><EditableText initialValue="Pre-Reading: Article Excerpt" /></p>
                <p className="text-amber-100 text-xs"><EditableText initialValue="Educational Psychology Review — Annotated" /></p>
              </div>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-700 leading-relaxed">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                <EditableText initialValue="Adapted from: Constructivist Learning Theory in Practice — Educational Psychology Review" />
              </p>
              <p>
                <EditableText initialValue="Constructivism, as a theory of learning, posits that knowledge is not transmitted from teacher to learner but is actively constructed by the learner through experience. This perspective stands in contrast to behaviourist models, which treat the learner as a passive recipient of information." multiline />
              </p>
              <p>
                <EditableText initialValue="Jean Piaget (1896–1980) proposed that children construct knowledge through two complementary processes: assimilation, in which new information is incorporated into existing cognitive structures (schemas), and accommodation, in which schemas are modified or replaced when new information cannot be assimilated. The tension between these processes produces disequilibrium — a state of cognitive imbalance that motivates the learner to seek resolution, driving intellectual growth." multiline />
              </p>
              <p>
                <EditableText initialValue="Lev Vygotsky (1896–1934) extended this view by emphasising the social and cultural dimensions of learning. For Vygotsky, cognitive development is fundamentally mediated by language and social interaction. His concept of the Zone of Proximal Development (ZPD) — the gap between what a learner can accomplish independently and what they can achieve with guidance — has become one of the most influential frameworks in educational practice. Instruction is most effective when it targets this zone, providing temporary scaffolding that is gradually withdrawn as competence develops." multiline />
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide"><EditableText initialValue="Annotation — Key Takeaway" /></p>
                <p className="text-slate-600 text-sm">
                  <EditableText initialValue="Both theorists agree that learning is an active process, but differ on its primary driver: Piaget locates it in the individual's interaction with the physical world; Vygotsky locates it in social interaction and cultural tools. Effective teaching draws on both." multiline />
                </p>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 pt-1">
                {[
                  { term: "Schema", def: "A mental framework for organising and interpreting knowledge." },
                  { term: "Disequilibrium", def: "Cognitive tension that arises when new information conflicts with existing schemas." },
                  { term: "Scaffolding", def: "Temporary, targeted support provided within a learner's ZPD." },
                ].map((item) => (
                  <div key={item.term} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="font-semibold text-slate-800 text-xs mb-1"><EditableText initialValue={item.term} /></p>
                    <p className="text-slate-500 text-xs leading-relaxed"><EditableText initialValue={item.def} multiline /></p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pre-reading video */}
          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-700 mb-3">🎬 Pre-Reading Video (10 min)</p>
            <VideoPlayer
              videoId="vgNODe6ABDE"
              title="Vygotsky and Piaget: Constructivist Learning Theories"
              description="TED-Ed style overview explaining the basics of both theories — watch before class."
              duration="10:14"
              allowCustomUrl
            />
          </div>
        </section>

        {/* 2b. Pre-Test */}
        <section id="pretest" className="scroll-mt-20">
          <SectionHeader number="2b" title="Pre-Test: What Do You Already Know?" color="amber" />
          <p className="mt-3 text-slate-500 text-sm"><EditableText initialValue="Complete this before the lesson. Your answers won't be graded — they help you identify gaps." multiline /></p>
          <div className="mt-4">
            <Quiz title="Pre-Test" questions={preTestQuestions} />
          </div>
        </section>

        {/* 3. Introduction */}
        <section id="introduction" className="scroll-mt-20">
          <SectionHeader number="3" title="Introduction" color="blue" />
          <div className="mt-6 space-y-6">
            <p className="text-slate-700 leading-relaxed">
              <EditableText initialValue="Constructivism holds that learners do not passively absorb knowledge — they actively construct it by connecting new experiences to what they already know. Two major branches shape how educators think about this process:" multiline />
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <TheoryCard
                color="blue"
                title="Cognitive Constructivism"
                theorist="Jean Piaget (1896–1980)"
                summary="Knowledge is built individually through interaction with the environment. Learners progress through universal developmental stages, adapting their mental schemas via assimilation and accommodation."
              />
              <TheoryCard
                color="violet"
                title="Social Constructivism"
                theorist="Lev Vygotsky (1896–1934)"
                summary="Knowledge is co-constructed through social interaction and language. Learning is most effective when it occurs within the Zone of Proximal Development with support from a More Knowledgeable Other."
              />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <h4 className="font-semibold text-slate-800 mb-2">🔑 Core Shared Premise</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Both theories reject the idea that the mind is a blank slate. Learners bring prior knowledge,
                experiences, and cultural context to every learning situation — and these shape what and how they learn.
              </p>
            </div>
          </div>
        </section>

        {/* 3b. Video */}
        <section id="video" className="scroll-mt-20">
          <SectionHeader number="3b" title="Video: Constructivism in Action" color="blue" />
          <div className="mt-4">
            <VideoPlayer
              videoId="https://www.youtube.com/watch?v=Yi8S4YkZI04"
              title="Constructivism — Piaget & Vygotsky"
              description="A concise overview of both cognitive and social constructivism, with classroom examples."
            />
          </div>
        </section>

        {/* 3c. Guiding Questions */}
        <section id="guiding" className="scroll-mt-20">
          <SectionHeader number="3c" title="Guiding Questions" color="blue" />
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-2xl p-6 space-y-3">
            <p className="text-sm text-blue-700 font-medium"><EditableText initialValue="As you watch the video and work through the activities, keep these questions in mind:" multiline /></p>
            <ol className="space-y-2 list-none">
              {[
                "How does Piaget explain the process by which a child revises a mistaken belief?",
                "What does Vygotsky mean when he says learning precedes development?",
                "In what ways are scaffolding and fading two sides of the same coin?",
                "Can you think of a learning experience where social interaction was essential — not just helpful?",
                "How might a teacher use both theories simultaneously in a single lesson?",
              ].map((q, i) => (
                <li key={i} className="flex gap-3 items-start text-sm text-slate-700">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                  <EditableText initialValue={q} multiline />
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 4. Development Activities (140 min) */}
        <section id="development" className="scroll-mt-20">
          <SectionHeader number="4" title="Development Activities (140 minutes)" color="emerald" />
          <div className="mt-6 space-y-10">

            {/* A. Interactive Lecture */}
            <div>
              <ActivityHeader letter="A" title="Interactive Lecture" duration="30 minutes" />
              <div className="mt-4 grid sm:grid-cols-2 gap-4">

                {/* Segment 1 */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Segment 1 · 15 min</p>
                  <h4 className="font-bold text-slate-800"><EditableText initialValue="Cognitive Constructivism" /></h4>
                  {/* Animated schema illustration */}
                  <div className="bg-white border border-blue-100 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2"><EditableText initialValue="Piaget's Schema Formation" /></p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium">Existing Schema</span>
                      <span className="text-slate-400">+</span>
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg font-medium">New Experience</span>
                    </div>
                    <div className="flex gap-4 pt-1">
                      <div className="flex-1 bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-center">
                        <p className="text-xs font-semibold text-emerald-700">Fits?</p>
                        <p className="text-xs text-slate-600 mt-0.5">Assimilation</p>
                      </div>
                      <div className="flex-1 bg-rose-50 border border-rose-200 rounded-lg p-2 text-center">
                        <p className="text-xs font-semibold text-rose-700">Doesn&apos;t fit?</p>
                        <p className="text-xs text-slate-600 mt-0.5">Accommodation</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 text-center pt-1">→ Equilibration restores balance</p>
                  </div>
                  {/* Concept map quiz */}
                  <div className="bg-white border border-blue-100 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2"><EditableText initialValue="Concept Map — Match the Term" /></p>
                    {[
                      { term: "Assimilation", def: "Fitting new info into an existing schema" },
                      { term: "Accommodation", def: "Modifying a schema to fit new info" },
                      { term: "Equilibration", def: "Restoring cognitive balance after disequilibrium" },
                      { term: "Schema", def: "A mental framework for organising knowledge" },
                    ].map((item) => (
                      <div key={item.term} className="flex gap-2 items-start text-xs">
                        <span className="shrink-0 font-semibold text-blue-700 w-28">{item.term}</span>
                        <span className="text-slate-500">— {item.def}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Segment 2 */}
                <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 space-y-3">
                  <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide">Segment 2 · 15 min</p>
                  <h4 className="font-bold text-slate-800"><EditableText initialValue="Social Constructivism" /></h4>
                  {/* Padlet prompt */}
                  <div className="bg-white border border-violet-100 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Padlet Prompt</p>
                    <p className="text-sm text-slate-700 italic">&ldquo;Share a metaphor for scaffolding in learning.&rdquo;</p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {[
                        { emoji: "🏗️", text: "Building scaffolding — removed when structure stands" },
                        { emoji: "🚲", text: "Training wheels — faded as balance improves" },
                        { emoji: "🗺️", text: "A map — put away once you know the route" },
                        { emoji: "🤝", text: "A hand — withdrawn as confidence grows" },
                      ].map((m, i) => (
                        <div key={i} className="bg-violet-50 border border-violet-100 rounded-lg p-2 text-xs text-slate-600 flex gap-1.5 items-start">
                          <span>{m.emoji}</span>
                          <span>{m.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Video analysis */}
                  <div className="bg-white border border-violet-100 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Video Analysis</p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Observe the peer collaboration clip below. As you watch, note:
                    </p>
                    <ul className="space-y-1">
                      {[
                        "Who is acting as the MKO?",
                        "Where is the ZPD visible?",
                        "How does the teacher scaffold without taking over?",
                      ].map((q, i) => (
                        <li key={i} className="flex gap-2 text-xs text-slate-600">
                          <span className="shrink-0 w-4 h-4 rounded-full bg-violet-200 text-violet-700 flex items-center justify-center font-bold">{i + 1}</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* B. Structured Small Group Work */}
            <div>
              <ActivityHeader letter="B" title="Structured Small Group Work" duration="40 minutes" />
              <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Analyse the two case studies below. Your group is assigned one focus — then share findings with the class.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Group A */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">Group A</span>
                      <span className="text-xs text-blue-700 font-medium"><EditableText initialValue="Cognitive Constructivism" /></span>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide"><EditableText initialValue="Case Study: Designing a History Lesson" /></p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      A teacher wants students to understand the causes of World War I. She begins with a KWL chart
                      (Know / Want to know / Learned), then has students individually examine primary sources and
                      form their own explanations before any direct instruction.
                    </p>
                    <div className="bg-white border border-blue-100 rounded-lg p-3 space-y-1">
                      <p className="text-xs font-semibold text-blue-700"><EditableText initialValue="Your task (individual exploration):" /></p>
                      <ul className="space-y-1">
                        {[
                          "Which Piagetian concepts are present?",
                          "Where might disequilibrium occur?",
                          "How does the KWL chart activate schemas?",
                        ].map((q, i) => (
                          <li key={i} className="text-xs text-slate-600 flex gap-1.5">
                            <span className="text-blue-400 shrink-0">›</span>{q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {/* Group B */}
                  <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-violet-600 text-white text-xs font-bold rounded-full">Group B</span>
                      <span className="text-xs text-violet-700 font-medium"><EditableText initialValue="Social Constructivism" /></span>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide"><EditableText initialValue="Case Study: Designing a History Lesson" /></p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      The same teacher restructures the lesson as a Socratic seminar. Students are assigned roles
                      (questioner, devil&apos;s advocate, summariser) and debate the causes collaboratively, with the
                      teacher asking probing questions to push thinking further.
                    </p>
                    <div className="bg-white border border-violet-100 rounded-lg p-3 space-y-1">
                      <p className="text-xs font-semibold text-violet-700"><EditableText initialValue="Your task (group inquiry):" /></p>
                      <ul className="space-y-1">
                        {[
                          "Where is the ZPD operating in this lesson?",
                          "Who is the MKO at different moments?",
                          "How does language mediate learning here?",
                        ].map((q, i) => (
                          <li key={i} className="text-xs text-slate-600 flex gap-1.5">
                            <span className="text-violet-400 shrink-0">›</span>{q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1"><EditableText initialValue="Output" /></p>
                  <p className="text-sm text-slate-700">
                    <EditableText initialValue="Create a concept map (digital or poster) comparing both approaches. Be ready to present to the class." />
                  </p>
                </div>
              </div>
            </div>

            {/* C. Peer Teaching */}
            <div>
              <ActivityHeader letter="C" title="Peer Teaching" duration="20 minutes" />
              <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  <EditableText initialValue="Each group teaches the class their assigned approach using the whiteboard or Miro board. The audience listens and completes the observation checklist below." />
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      role: "Presenting Group",
                      icon: "🗣️",
                      items: [
                        "Explain the core theory in your own words",
                        "Walk through your case study analysis",
                        "Show your concept map and explain the connections",
                        "Invite one question from the audience",
                      ],
                    },
                    {
                      role: "Observing Group",
                      icon: "👂",
                      items: [
                        "Note one thing you agree with",
                        "Note one thing you would add or challenge",
                        "Identify any constructivist principle they missed",
                        "Prepare a question for the presenters",
                      ],
                    },
                  ].map((col) => (
                    <div key={col.role} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                      <p className="text-sm font-semibold text-slate-800">{col.icon} {col.role}</p>
                      <ul className="space-y-1.5">
                        {col.items.map((item, i) => (
                          <li key={i} className="flex gap-2 text-xs text-slate-600">
                            <span className="shrink-0 w-4 h-4 rounded bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px]">{i + 1}</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* D. Case Study Analysis */}
            <div>
              <ActivityHeader letter="D" title="Case Study Analysis" duration="30 minutes" />
              <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <p className="text-sm font-semibold text-slate-700"><EditableText initialValue="Diagnose the failing lesson plan below — which constructivist principles were ignored?" /></p>
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 space-y-2">
                  <p className="text-xs font-semibold text-rose-700 uppercase tracking-wide"><EditableText initialValue="Failing Lesson Plan" /></p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    <EditableText initialValue="Mr. Davis teaches a 60-minute lesson on photosynthesis entirely through a PowerPoint lecture. He reads from slides, students copy notes. There is no discussion, no prior knowledge check, no group work, and no opportunity to ask questions. At the end, students complete a fill-in-the-blank worksheet independently." multiline />
                  </p>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { principle: "No schema activation", detail: "Students' prior knowledge is never surfaced or connected to new content." },
                    { principle: "No disequilibrium", detail: "Passive note-taking creates no cognitive tension to drive accommodation." },
                    { principle: "No ZPD / scaffolding", detail: "No peer interaction, no MKO support, no gradual release of responsibility." },
                  ].map((item) => (
                    <div key={item.principle} className="bg-white border border-rose-100 rounded-xl p-3 space-y-1">
                      <p className="text-xs font-semibold text-rose-600">✗ {item.principle}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.detail}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide"><EditableText initialValue="Scenario Quiz — What Would You Fix?" /></p>
                  <ScenarioQuiz />
                </div>
              </div>
            </div>

            {/* E. Digital Flashcards */}
            <div>
              <ActivityHeader letter="E" title="Digital Flashcards" duration="15 minutes" />
              <p className="mt-2 text-sm text-slate-500"><EditableText initialValue="Quizlet-style live game — test yourself on all key terms before the break." /></p>
              <div className="mt-4">
                <Flashcard cards={flashcards} />
              </div>
            </div>

            {/* F. Break */}
            <div className="flex items-center gap-4 bg-slate-100 border border-slate-200 rounded-2xl px-6 py-4">
              <span className="text-3xl">☕</span>
              <div>
                <p className="font-semibold text-slate-700"><EditableText initialValue="Break — 15 minutes" /></p>
                <p className="text-sm text-slate-500"><EditableText initialValue="Step away, recharge, and let the new schemas settle." /></p>
              </div>
            </div>

          </div>
        </section>

        {/* 5. Synthesis */}
        <section id="synthesis" className="scroll-mt-20">
          <SectionHeader number="5" title="Synthesis" color="violet" />
          <div className="mt-6 space-y-4">
            <p className="text-slate-700 leading-relaxed">
              <EditableText initialValue="Rather than competing, cognitive and social constructivism are complementary lenses. Effective teaching draws on both:" multiline />
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: "🧩", title: "Activate Prior Knowledge", desc: "Connect new content to existing schemas before introducing new concepts." },
                { icon: "🔧", title: "Create Productive Struggle", desc: "Design tasks that induce disequilibrium — just challenging enough to require accommodation." },
                { icon: "👥", title: "Leverage Social Learning", desc: "Use peer work, discussion, and expert guidance to scaffold learning within the ZPD." },
              ].map((item) => (
                <div key={item.title} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center space-y-2">
                  <span className="text-3xl">{item.icon}</span>
                  <h4 className="font-semibold text-slate-800 text-sm"><EditableText initialValue={item.title} /></h4>
                  <p className="text-slate-500 text-xs leading-relaxed"><EditableText initialValue={item.desc} /></p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Assessment */}
        <section id="assessment" className="scroll-mt-20">
          <SectionHeader number="6" title="Assessment" color="rose" />
          <div className="mt-6 space-y-8">
            <Quiz title="Check Your Understanding" questions={quizQuestions} />
          </div>
        </section>

        {/* 6b. Post-Test */}
        <section id="posttest" className="scroll-mt-20">
          <SectionHeader number="6b" title="Post-Test: How Far Have You Come?" color="rose" />
          <p className="mt-3 text-slate-500 text-sm"><EditableText initialValue="Complete this after finishing all activities. Compare your results with the pre-test to measure your growth." /></p>
          <div className="mt-4">
            <Quiz title="Post-Test" questions={postTestQuestions} />
          </div>
        </section>

        {/* 6c. One-Minute Paper */}
        <section id="oneminute" className="scroll-mt-20">
          <SectionHeader number="6c" title="One-Minute Paper" color="rose" />
          <div className="mt-4 bg-rose-50 border border-rose-200 rounded-2xl p-6 space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              <EditableText initialValue="Take 60 seconds to respond to each prompt in your notebook or learning journal. This is for your own reflection — not submitted." />
            </p>
            <div className="space-y-3">
              {[
                { prompt: "The most important thing I learned today is…", icon: "💡" },
                { prompt: "One question I still have is…", icon: "❓" },
                { prompt: "One way I could apply this in a classroom is…", icon: "🏫" },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 bg-white border border-rose-100 rounded-xl p-4">
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <p className="text-sm text-slate-700 italic"><EditableText initialValue={item.prompt} /></p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6d. Differentiation */}
        <section id="differentiation" className="scroll-mt-20">
          <SectionHeader number="6d" title="Differentiation Strategies" color="violet" />
          <div className="mt-4 grid sm:grid-cols-3 gap-4">
            {[
              {
                label: "For Struggling Learners",
                color: "bg-amber-50 border-amber-200",
                badge: "bg-amber-100 text-amber-700",
                items: [
                  "Provide a glossary of key terms with visual examples",
                  "Use worked examples before independent tasks",
                  "Pair with a peer MKO for collaborative activities",
                  "Reduce cognitive load with graphic organisers",
                ],
              },
              {
                label: "For On-Track Learners",
                color: "bg-blue-50 border-blue-200",
                badge: "bg-blue-100 text-blue-700",
                items: [
                  "Complete all core activities and the Venn diagram",
                  "Analyse the case study independently first",
                  "Attempt the scenario quiz without hints",
                  "Write a short paragraph comparing both theories",
                ],
              },
              {
                label: "For Advanced Learners",
                color: "bg-emerald-50 border-emerald-200",
                badge: "bg-emerald-100 text-emerald-700",
                items: [
                  "Critique limitations of each theory with evidence",
                  "Design a full constructivist lesson plan",
                  "Research neo-Piagetian or sociocultural extensions",
                  "Teach a concept to a peer and reflect on the process",
                ],
              },
            ].map((group) => (
              <div key={group.label} className={`border rounded-2xl p-5 space-y-3 ${group.color}`}>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${group.badge}`}>{group.label}</span>
                <ul className="space-y-2">
                  {group.items.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700">
                      <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <EditableText initialValue={item} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 6e. Reflection */}
        <section id="reflection" className="scroll-mt-20">
          <SectionHeader number="6e" title="Reflection: Connecting Theory to Practice" color="violet" />
          <div className="mt-4 space-y-4">
            <p className="text-slate-600 text-sm leading-relaxed">
              <EditableText initialValue="Reflection is itself a constructivist act — you are building new understanding by examining your own thinking. Use the prompts below for a journal entry or group discussion." />
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: "🔄", title: "Theory ↔ Experience", prompt: "Recall a learning experience from your own schooling. Which constructivist principles were present? Which were absent? How did that affect your learning?" },
                { icon: "🎯", title: "Design Challenge", prompt: "You are teaching a Year 8 class about the water cycle. Sketch a 20-minute activity that incorporates at least three constructivist principles from today's lesson." },
                { icon: "⚖️", title: "Critical Lens", prompt: "Constructivism has been criticised for being impractical in large classes or with content-heavy curricula. Do you agree? How would you respond to this critique?" },
                { icon: "🌱", title: "Personal Growth", prompt: "What is one belief about teaching or learning that this lesson has caused you to reconsider or refine? What new schema have you built?" },
              ].map((item) => (
                <div key={item.title} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.icon}</span>
                    <h4 className="font-semibold text-slate-800 text-sm"><EditableText initialValue={item.title} /></h4>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed"><EditableText initialValue={item.prompt} multiline /></p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6f. Rubric */}
        <section id="rubric" className="scroll-mt-20">
          <SectionHeader number="6f" title="Assessment Rubric" color="slate" />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-4 py-3 text-left rounded-tl-xl font-semibold">Criterion</th>
                  <th className="px-4 py-3 text-left font-semibold">Excellent (4)</th>
                  <th className="px-4 py-3 text-left font-semibold">Proficient (3)</th>
                  <th className="px-4 py-3 text-left font-semibold">Developing (2)</th>
                  <th className="px-4 py-3 text-left rounded-tr-xl font-semibold">Beginning (1)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    criterion: "Conceptual Accuracy",
                    excellent: "All key terms defined accurately with nuance",
                    proficient: "Most terms correct; minor imprecision",
                    developing: "Some terms confused or incomplete",
                    beginning: "Significant misconceptions present",
                  },
                  {
                    criterion: "Theory Comparison",
                    excellent: "Insightful comparison with specific evidence",
                    proficient: "Clear comparison with some evidence",
                    developing: "Superficial comparison; limited evidence",
                    beginning: "Theories conflated or not compared",
                  },
                  {
                    criterion: "Application to Practice",
                    excellent: "Creative, detailed, and theoretically grounded application",
                    proficient: "Relevant application with clear links to theory",
                    developing: "Application present but loosely connected",
                    beginning: "Little or no connection to theory",
                  },
                  {
                    criterion: "Critical Reflection",
                    excellent: "Evaluates strengths and limitations; shows metacognition",
                    proficient: "Some evaluation; reflection is genuine",
                    developing: "Descriptive rather than evaluative",
                    beginning: "Minimal or no reflection",
                  },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="px-4 py-3 font-medium text-slate-800 border-b border-slate-100"><EditableText initialValue={row.criterion} /></td>
                    <td className="px-4 py-3 text-emerald-700 border-b border-slate-100"><EditableText initialValue={row.excellent} /></td>
                    <td className="px-4 py-3 text-blue-700 border-b border-slate-100"><EditableText initialValue={row.proficient} /></td>
                    <td className="px-4 py-3 text-amber-700 border-b border-slate-100"><EditableText initialValue={row.developing} /></td>
                    <td className="px-4 py-3 text-red-600 border-b border-slate-100"><EditableText initialValue={row.beginning} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 7. Constructive Alignment */}
        <section id="alignment" className="scroll-mt-20">
          <SectionHeader number="7" title="Constructive Alignment" color="slate" />
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-4 py-3 text-left rounded-tl-xl font-semibold">ILO</th>
                  <th className="px-4 py-3 text-left font-semibold">Teaching &amp; Learning Activity</th>
                  <th className="px-4 py-3 text-left rounded-tr-xl font-semibold">Assessment Task</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { ilo: "Define constructivism", tla: "Lecture, flashcard activity", assess: "MCQ Quiz Q1" },
                  { ilo: "Explain Piaget's concepts", tla: "Case study analysis, Venn diagram", assess: "MCQ Quiz Q1–2" },
                  { ilo: "Describe Vygotsky's ZPD", tla: "Peer discussion, case study", assess: "MCQ Quiz Q2–3" },
                  { ilo: "Compare both theories", tla: "Venn diagram, group debate", assess: "Short-answer essay" },
                  { ilo: "Apply to classroom design", tla: "Lesson plan workshop", assess: "Lesson plan submission" },
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="px-4 py-3 text-slate-700 border-b border-slate-100"><EditableText initialValue={row.ilo} /></td>
                    <td className="px-4 py-3 text-slate-600 border-b border-slate-100"><EditableText initialValue={row.tla} /></td>
                    <td className="px-4 py-3 text-slate-600 border-b border-slate-100"><EditableText initialValue={row.assess} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 8. Resources */}
        <section id="resources" className="scroll-mt-20 pb-16">
          <SectionHeader number="8" title="Further Resources" color="teal" />
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            {[
              { type: "Book", title: "The Psychology of the Child", author: "Piaget & Inhelder (1969)", icon: "📚" },
              { type: "Book", title: "Mind in Society", author: "Vygotsky (1978)", icon: "📚" },
              { type: "Article", title: "Constructivism in Education", author: "Jonassen, D. H. (1991)", icon: "📄" },
              { type: "Video", title: "Piaget's Stages of Development", author: "Khan Academy", icon: "🎬" },
              { type: "Video", title: "Vygotsky's ZPD & Scaffolding", author: "Sprouts (YouTube)", icon: "🎬" },
              { type: "Article", title: "Scaffolding in the Classroom", author: "Wood, Bruner & Ross (1976)", icon: "📄" },
            ].map((r, i) => (
              <div key={i} className="flex gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <span className="text-2xl shrink-0">{r.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide"><EditableText initialValue={r.type} /></p>
                  <p className="font-medium text-slate-800 text-sm"><EditableText initialValue={r.title} /></p>
                  <p className="text-slate-500 text-xs"><EditableText initialValue={r.author} /></p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </>
  );
}

/* ── Helper sub-components ── */

function SectionHeader({ number, title, color }: { number: string; title: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-600",
    amber: "bg-amber-500",
    emerald: "bg-emerald-600",
    violet: "bg-violet-600",
    rose: "bg-rose-500",
    slate: "bg-slate-700",
    teal: "bg-teal-600",
  };
  return (
    <div className="flex items-center gap-3">
      <span className={`w-8 h-8 rounded-lg ${colors[color] ?? "bg-slate-600"} text-white font-bold text-sm flex items-center justify-center shrink-0`}>
        {number}
      </span>
      <h2 className="text-2xl font-bold text-slate-900"><EditableText initialValue={title} /></h2>
    </div>
  );
}

function TheoryCard({ color, title, theorist, summary }: { color: string; title: string; theorist: string; summary: string }) {
  const styles: Record<string, { border: string; badge: string; text: string }> = {
    blue: { border: "border-blue-200", badge: "bg-blue-100 text-blue-700", text: "text-blue-800" },
    violet: { border: "border-violet-200", badge: "bg-violet-100 text-violet-700", text: "text-violet-800" },
  };
  const s = styles[color] ?? styles.blue;
  return (
    <div className={`bg-white border ${s.border} rounded-2xl p-5 shadow-sm space-y-2`}>
      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${s.badge}`}><EditableText initialValue={theorist} /></span>
      <h3 className={`font-bold text-base ${s.text}`}><EditableText initialValue={title} /></h3>
      <p className="text-slate-600 text-sm leading-relaxed"><EditableText initialValue={summary} multiline /></p>
    </div>
  );
}

function ActivityHeader({ letter, title, duration }: { letter: string; title: string; duration: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
        {letter}
      </span>
      <h3 className="text-lg font-bold text-slate-800"><EditableText initialValue={title} /></h3>
      <span className="ml-auto text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full"><EditableText initialValue={duration} /></span>
    </div>
  );
}
