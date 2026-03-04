"use client";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import EditableText from "./components/EditableText";
import Quiz from "./components/Quiz";
import Flashcard from "./components/Flashcard";
import VideoPlayer from "./components/VideoPlayer";
import TPACKDiagram from "./components/TPACKDiagram";
import DiscussionBoard from "./components/DiscussionBoard";
import ConceptCheck from "./components/ConceptCheck";
import EditableQuiz from "./components/EditableQuiz";
import LoginModal from "./components/LoginModal";
import UserMenu from "./components/UserMenu";

import { useAuth } from "./context/AuthContext";

// Lesson data
const preTestQuestions = [
  {
    question: "Which TPACK component would be most enhanced by using an adaptive learning platform for math instruction?",
    options: [
      "Content Knowledge only",
      "Technological Pedagogical Knowledge (TPK)",
      "Technological Content Knowledge (TCK)",
      "All TPACK components equally",
    ],
    correct: 1,
    explanation: "An adaptive learning platform primarily enhances the intersection of Technology and Pedagogy (TPK) by providing personalized learning experiences based on student performance.",
  },
  {
    question: "What is the primary benefit of integrating AI into TPACK framework?",
    options: [
      "Replacing teachers with automated systems",
      "Enhancing the connections between knowledge domains",
      "Reducing the need for content expertise",
      "Eliminating the need for pedagogical planning",
    ],
    correct: 1,
    explanation: "AI integration enhances the connections between Content, Pedagogy, and Technology knowledge domains, making them more dynamic and responsive.",
  },
  {
    question: "Which scenario best represents TPACK integration?",
    options: [
      "Using PowerPoint to display lecture notes",
      "Having students watch videos at home",
      "Using AI-powered simulation to teach complex science concepts with scaffolding",
      "Providing digital textbooks for reading",
    ],
    correct: 2,
    explanation: "TPACK integration requires the intersection of all three knowledge domains working together effectively.",
  },
  {
    question: "What ethical concern is most relevant to AI in TPACK?",
    options: [
      "The cost of AI tools",
      "Data privacy and algorithmic bias affecting student outcomes",
      "The learning curve for teachers",
      "Availability of internet access",
    ],
    correct: 1,
    explanation: "Data privacy and algorithmic bias are critical ethical concerns as AI systems process student data and make decisions that can affect learning outcomes.",
  },
  {
    question: "How can AI strengthen the connection between content and pedagogy?",
    options: [
      "By replacing the need for content expertise",
      "By analyzing student misconceptions and suggesting targeted teaching strategies",
      "By automating all assessment tasks",
      "By eliminating the need for lesson planning",
    ],
    correct: 1,
    explanation: "AI can analyze patterns in student understanding and suggest pedagogical approaches that are most effective for specific content areas.",
  },
];

const vocabularyCards = [
  { front: "TPACK", back: "Technological Pedagogical Content Knowledge - the framework describing the knowledge teachers need for effective technology integration" },
  { front: "Content Knowledge (CK)", back: "Teachers' knowledge about the subject matter to be learned or taught" },
  { front: "Pedagogical Knowledge (PK)", back: "Teachers' deep knowledge about the processes and practices or methods of teaching and learning" },
  { front: "Technological Knowledge (TK)", back: "Knowledge about standard technologies and digital tools, including AI applications" },
  { front: "Intelligent TPACK", back: "The integration of AI capabilities within the TPACK framework to enhance teaching and learning" },
  { front: "ZPD (Zone of Proximal Development)", back: "The difference between what a learner can do without help and what they can achieve with guidance" },
  { front: "Scaffolding", back: "Temporary support provided to students to help them accomplish tasks they cannot yet do independently" },
  { front: "Adaptive Learning", back: "Educational method using AI algorithms to orchestrate interaction with learners and deliver customized content" },
];

const rubricCriteria = [
  { criterion: "TPACK Framework Integration", exemplary: "Seamless component integration", proficient: "Clear connections", developing: "Fragmented application" },
  { criterion: "AI Functionality Match", exemplary: "Optimal pedagogical alignment", proficient: "Appropriate use", developing: "Misaligned tools" },
  { criterion: "Ethical Consideration", exemplary: "Comprehensive, nuanced analysis", proficient: "Basic ethical awareness", developing: "Insufficient treatment" },
];

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<"ilos" | "preclass" | "activities" | "assessment" | "resources">("ilos");

  useEffect(() => {
    const user = localStorage.getItem("user:name");
    if (!user) {
      setShowLogin(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <header className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-20">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-blue-200 text-sm font-medium uppercase tracking-wide mb-2">University Course</p>
              <EditableText
                initialValue="Intelligent TPACK Framework"
                storageKey="lesson:title"
                as="h1"
                className="text-4xl sm:text-5xl font-bold mb-4"
              />
              <EditableText
                initialValue="Teacher Capacity Building in the AI Era"
                storageKey="lesson:subtitle"
                as="p"
                className="text-xl text-blue-100"
              />
            </div>
            <UserMenu onLoginClick={() => setShowLogin(true)} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-3xl font-bold">90</p>
              <p className="text-blue-200 text-sm">Minutes</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-3xl font-bold">3</p>
              <p className="text-blue-200 text-sm">Learning Outcomes</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-3xl font-bold">5</p>
              <p className="text-blue-200 text-sm">Activities</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-3xl font-bold">10</p>
              <p className="text-blue-200 text-sm">Slides</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Section 1: ILOs */}
        <section id="ilos" className="mb-12 scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">1</div>
            <EditableText
              initialValue="Intended Learning Outcomes (ILOs)"
              storageKey="section:ilos:title"
              as="h2"
              className="text-2xl font-bold text-slate-800"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <p className="text-slate-600 mb-6">By the end of this lesson, students will be able to:</p>

            <div className="space-y-4">
              {[
                { label: "ILO 1", text: "Analyze how AI tools enhance Technological Pedagogical Content Knowledge (TPACK) components" },
                { label: "ILO 2", text: "Design a lesson plan integrating Intelligent TPACK framework elements" },
                { label: "ILO 3", text: "Evaluate ethical implications of AI integration using the TPACK framework" },
              ].map((ilo, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {ilo.label}
                  </div>
                  <EditableText
                    initialValue={ilo.text}
                    storageKey={`ilo:${i + 1}`}
                    as="p"
                    className="text-slate-700 leading-relaxed pt-2"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Pre-Class Preparation */}
        <section id="preclass" className="mb-12 scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">2</div>
            <EditableText
              initialValue="Pre-Class Preparation (Flipped Learning Component)"
              storageKey="section:preclass:title"
              as="h2"
              className="text-2xl font-bold text-slate-800"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Pre-Reading */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-indigo-600 px-6 py-4">
                <h3 className="text-white font-semibold text-lg">Pre-Reading Materials</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01.293.707V19a19a />
                    </svg>
                  </div>
                  <div>
                    <EditableText
                      initialValue="Koehler & Mishra (2005) TPACK framework foundational paper"
                      storageKey="prereading:1"
                      as="p"
                      className="font-medium text-slate-800"
                    />
                    <p className="text-sm text-indigo-600 mt-1">[PDF Download]</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7.2 2.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01.293.707V19a19" />
                    </svg>
                  </div>
                  <div>
                    <EditableText
                      initialValue='Case study: "Intelligent TPACK Implementation in High School STEM Classrooms"'
                      storageKey="prereading:2"
                      as="p"
                      className="font-medium text-slate-800"
                    />
                    <p className="text-sm text-indigo-600 mt-1">[PDF Download]</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Guiding Questions */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-amber-500 px-6 py-4">
                <h3 className="text-white font-semibold text-lg">Guiding Questions</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="flex items-start gap-3">
                    <span className="text-amber-600 font-bold">1.</span>
                    <EditableText
                      initialValue="How might AI tools strengthen content-pedagogy connections in your teaching context?"
                      storageKey="guiding:1"
                      as="p"
                      className="text-slate-700"
                    />
                  </div>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="flex items-start gap-3">
                    <span className="text-amber-600 font-bold">2.</span>
                    <EditableText
                      initialValue="What ethical considerations arise when integrating AI into TPACK framework?"
                      storageKey="guiding:2"
                      as="p"
                      className="text-slate-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pre-Test Quiz */}
          <div className="mt-6">
            <EditableQuiz
              title="Pre-Test: AI Integration in TPACK"
              questions={preTestQuestions}
              storageKey="pretest:tpack"
            />
          </div>
        </section>

        {/* Section 3: Teaching & Learning Activities */}
        <section id="introduction" className="mb-12 scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">3</div>
            <EditableText
              initialValue="Teaching & Learning Activities"
              storageKey="section:activities:title"
              as="h2"
              className="text-2xl font-bold text-slate-800"
            />
          </div>

          {/* Introduction */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="bg-rose-500 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-lg">Introduction (10-12 minutes)</h3>
              </div>
              <span className="bg-rose-400/30 text-white text-xs px-3 py-1 rounded-full">12 min</span>
            </div>
            <div className="p-6 space-y-6">
              {/* Hook Activity */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="text-rose-500">Hook Activity</span>
                  <span className="text-slate-400 text-sm font-normal">(5 min)</span>
                </h4>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 mt-1">•</span>
                    <EditableText
                      initialValue="Analyze a case study excerpt showing both successful and problematic AI integration examples"
                      storageKey="intro:hook:1"
                      as="span"
                    />
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 mt-1">•</span>
                    <EditableText
                      initialValue="Poll: Which case demonstrates authentic TPACK enhancement? [Mentimeter: Multiple Choice Poll]"
                      storageKey="intro:hook:2"
                      as="span"
                    />
                  </li>
                </ul>
              </div>

              {/* Pre-Test Discussion */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="text-rose-500">Pre-Test Discussion</span>
                  <span className="text-slate-400 text-sm font-normal">(5 min)</span>
                </h4>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 mt-1">•</span>
                    <EditableText
                      initialValue="Review common misconceptions identified in pre-test responses"
                      storageKey="intro:pretest:1"
                      as="span"
                    />
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 mt-1">•</span>
                    <EditableText
                      initialValue="Visual concept map showing AI's role within TPACK components"
                      storageKey="intro:pretest:2"
                      as="span"
                    />
                  </li>
                </ul>
              </div>

              {/* TPACK Diagram */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-4">TPACK Framework Visualization</h4>
                <TPACKDiagram />
              </div>

              {/* Real-World Connection */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="text-rose-500">Real-World Connection</span>
                  <span className="text-slate-400 text-sm font-normal">(2 min)</span>
                </h4>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 mt-1">•</span>
                    <EditableText
                      initialValue="Brief video clip: K-12 classroom using AI tools with TPACK alignment"
                      storageKey="intro:realworld:1"
                      as="span"
                    />
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 mt-1">•</span>
                    <EditableText
                      initialValue='"Quick "I notice/I wonder" protocol (Padlet board for collaborative reflection)'
                      storageKey="intro:realworld:2"
                      as="span"
                    />
                  </li>
                </ul>
              </div>

              {/* Video Player */}
              <VideoPlayer
                title="TPACK in the Classroom"
                description="Example of AI-enhanced TPACK implementation"
                videoId="dQw4w9WgXcQ"
                duration="5:00"
                allowCustomUrl
              />
            </div>
          </div>
        </section>

        {/* Development Activities */}
        <section id="development" className="mb-12 scroll-mt-20">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-lg">Development Activities (63-66 minutes)</h3>
              </div>
              <span className="bg-blue-500/30 text-white text-xs px-3 py-1 rounded-full">65 min</span>
            </div>
            <div className="p-6 space-y-8">
              {/* Activity 1 */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-slate-800 mb-3">
                  <EditableText
                    initialValue="Activity 1: Interactive Lecture + Think-Pair-Share (15 min)"
                    storageKey="activity:1:title"
                    as="span"
                  />
                </h4>
                <ul className="space-y-2 text-slate-600 mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <EditableText
                      initialValue="Break down TPACK framework with AI overlay using the TPACK 2.0 Animated Visualization"
                      storageKey="activity:1:item:1"
                      as="span"
                    />
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <EditableText
                      initialValue="Prompt: Identify a teaching strategy where AI could strengthen two TPACK components simultaneously"
                      storageKey="activity:1:item:2"
                      as="span"
                    />
                  </li>
                </ul>

                {/* Discussion Board */}
                <DiscussionBoard
                  title="Think-Pair-Share Discussion"
                  prompt="Share a teaching strategy where AI could strengthen two TPACK components simultaneously"
                  storageKey="discussion:activity1"
                />
              </div>

              {/* Activity 2 */}
              <div className="border-l-4 border-emerald-500 pl-4">
                <h4 className="font-semibold text-slate-800 mb-3">
                  <EditableText
                    initialValue="Activity 2: Small Group Design Challenge (20 min)"
                    storageKey="activity:2:title"
                    as="span"
                  />
                </h4>
                <ul className="space-y-2 text-slate-600 mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    <EditableText
                      initialValue="Groups of 4-5 design an AI-enhanced TPACK lesson plan using the template below"
                      storageKey="activity:2:item:1"
                      as="span"
                    />
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    <EditableText
                      initialValue="Provide worked example for differentiation"
                      storageKey="activity:2:item:2"
                      as="span"
                    />
                  </li>
                </ul>

                {/* Design Canvas */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h5 className="font-medium text-slate-700 mb-3">TPACK Design Canvas Template</h5>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-slate-200">
                      <p className="text-xs text-slate-500 uppercase font-medium mb-2">Content-Knowledge Component</p>
                      <EditableText
                        initialValue="Enter your content focus..."
                        storageKey="canvas:content"
                        as="p"
                        className="text-sm text-slate-600"
                        multiline
                      />
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-slate-200">
                      <p className="text-xs text-slate-500 uppercase font-medium mb-2">Pedagogical Approach</p>
                      <EditableText
                        initialValue="Describe your teaching methods..."
                        storageKey="canvas:pedagogy"
                        as="p"
                        className="text-sm text-slate-600"
                        multiline
                      />
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-slate-200">
                      <p className="text-xs text-slate-500 uppercase font-medium mb-2">Tech Integration</p>
                      <EditableText
                        initialValue="List technology tools..."
                        storageKey="canvas:tech"
                        as="p"
                        className="text-sm text-slate-600"
                        multiline
                      />
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-slate-200">
                      <p className="text-xs text-slate-500 uppercase font-medium mb-2">AI Application</p>
                      <EditableText
                        initialValue="Describe AI enhancements..."
                        storageKey="canvas:ai"
                        as="p"
                        className="text-sm text-slate-600"
                        multiline
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Break */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-center">
                <p className="text-amber-700 font-medium">5-minute mid-class stretch break</p>
              </div>

              {/* Activity 3 */}
              <div className="border-l-4 border-violet-500 pl-4">
                <h4 className="font-semibold text-slate-800 mb-3">
                  <EditableText
                    initialValue="Activity 3: Peer Critique Circles (15 min)"
                    storageKey="activity:3:title"
                    as="span"
                  />
                </h4>
                <ul className="space-y-2 text-slate-600 mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-500 mt-1">•</span>
                    <EditableText
                      initialValue="Rotating station review: Leave critique notes using 2 stars and 1 wish protocol"
                      storageKey="activity:3:item:1"
                      as="span"
                    />
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-500 mt-1">•</span>
                    <EditableText
                      initialValue="Digital flashcards for key terminology reinforcement"
                      storageKey="activity:3:item:2"
                      as="span"
                    />
                  </li>
                </ul>

                {/* Flashcards */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h5 className="font-medium text-slate-700 mb-4">Intelligent TPACK Vocabulary Flashcards</h5>
                  <Flashcard cards={vocabularyCards} />
                </div>
              </div>

              {/* Activity 4 */}
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-slate-800 mb-3">
                  <EditableText
                    initialValue="Activity 4: Ethical Debate Scenario (10 min)"
                    storageKey="activity:4:title"
                    as="span"
                  />
                </h4>
                <ul className="space-y-2 text-slate-600 mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <EditableText
                      initialValue='Analyze conflicting stakeholder perspectives: "Your district mandates AI grading tools that conflict with your content specialty"'
                      storageKey="activity:4:item:1"
                      as="span"
                    />
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <EditableText
                      initialValue="Structured Socratic seminar framework with role cards"
                      storageKey="activity:4:item:2"
                      as="span"
                    />
                  </li>
                </ul>

                {/* Discussion Board */}
                <DiscussionBoard
                  title="Ethical Debate Discussion"
                  prompt="What are the ethical implications of mandated AI grading tools that conflict with content specialty?"
                  storageKey="discussion:ethics"
                />
              </div>

              {/* Activity 5 */}
              <div className="border-l-4 border-pink-500 pl-4">
                <h4 className="font-semibold text-slate-800 mb-3">
                  <EditableText
                    initialValue="Activity 5: Formative Check (5 min)"
                    storageKey="activity:5:title"
                    as="span"
                  />
                </h4>

                <ConceptCheck
                  title="One-Minute Paper"
                  prompt="How has your understanding of teacher capacity changed after today's activities?"
                  storageKey="concept:capacity"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Synthesis & Closure */}
        <section id="synthesis" className="mb-12 scroll-mt-20">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-lg">Synthesis & Closure (12-15 minutes)</h3>
              </div>
              <span className="bg-indigo-500/30 text-white text-xs px-3 py-1 rounded-full">13 min</span>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Post-Test Comparison (5 min)</h4>
                <p className="text-slate-600">
                  <EditableText
                    initialValue="Same question format as pre-test to measure learning gains"
                    storageKey="synthesis:posttest"
                    as="span"
                  />
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Reflective Discussion (5 min)</h4>
                <p className="text-slate-600 mb-4">
                  <EditableText
                    initialValue='Create a class "I can" statement wall: Post-lesson TPACK-AI capabilities'
                    storageKey="synthesis:reflective"
                    as="span"
                  />
                </p>

                <DiscussionBoard
                  title="I Can Statements"
                  prompt="What TPACK-AI capabilities can you now demonstrate?"
                  storageKey="discussion:ican"
                />
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Next Session Preview (2-3 min)</h4>
                <p className="text-slate-600">
                  <EditableText
                    initialValue="Connect to upcoming workshop on personalized learning pathways using Intelligent TPACK"
                    storageKey="synthesis:preview"
                    as="span"
                  />
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Assessment Methods */}
        <section id="assessment" className="mb-12 scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">4</div>
            <EditableText
              initialValue="Assessment Methods"
              storageKey="section:assessment:title"
              as="h2"
              className="text-2xl font-bold text-slate-800"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Formative Assessment */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-teal-600 px-6 py-4">
                <h3 className="text-white font-semibold text-lg">Formative Assessment</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm">✓</div>
                  <EditableText
                    initialValue="Pre-Post Test comparison (same question bank)"
                    storageKey="formative:1"
                    as="p"
                    className="text-slate-700"
                  />
                </div>
                <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm">✓</div>
                  <EditableText
                    initialValue="Peer critique rubric focusing on ILO alignment"
                    storageKey="formative:2"
                    as="p"
                    className="text-slate-700"
                  />
                </div>
                <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm">✓</div>
                  <EditableText
                    initialValue="One-minute paper analysis: Conceptual Understanding | Practical Application | Critical Thinking"
                    storageKey="formative:3"
                    as="p"
                    className="text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Summative Assessment */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-orange-500 px-6 py-4">
                <h3 className="text-white font-semibold text-lg">Summative Assessment</h3>
              </div>
              <div className="p-6">
                <h4 className="font-medium text-slate-800 mb-3">Assignment</h4>
                <p className="text-slate-600 mb-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <EditableText
                    initialValue='"Intelligent TPACK Implementation Prospectus" (Due next week)'
                    storageKey="summative:assignment"
                    as="span"
                  />
                </p>

                <h4 className="font-medium text-slate-800 mb-3">Rubric</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 pr-4 font-medium text-slate-700">Criteria</th>
                        <th className="text-left py-2 px-2 font-medium text-emerald-700">Exemplary (4)</th>
                        <th className="text-left py-2 px-2 font-medium text-blue-700">Proficient (3)</th>
                        <th className="text-left py-2 pl-2 font-medium text-amber-700">Developing (2)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rubricCriteria.map((item, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          <td className="py-3 pr-4 text-slate-700">
                            <EditableText
                              initialValue={item.criterion}
                              storageKey={`rubric:criteria:${i}`}
                              as="span"
                            />
                          </td>
                          <td className="py-3 px-2 text-emerald-700">
                            <EditableText
                              initialValue={item.exemplary}
                              storageKey={`rubric:exemplary:${i}`}
                              as="span"
                            />
                          </td>
                          <td className="py-3 px-2 text-blue-700">
                            <EditableText
                              initialValue={item.proficient}
                              storageKey={`rubric:proficient:${i}`}
                              as="span"
                            />
                          </td>
                          <td className="py-3 pl-2 text-amber-700">
                            <EditableText
                              initialValue={item.developing}
                              storageKey={`rubric:developing:${i}`}
                              as="span"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Constructive Alignment Matrix */}
        <section id="alignment" className="mb-12 scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold">5</div>
            <EditableText
              initialValue="Constructive Alignment Matrix"
              storageKey="section:alignment:title"
              as="h2"
              className="text-2xl font-bold text-slate-800"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-cyan-50 border-b border-cyan-100">
                    <th className="text-left px-6 py-4 font-semibold text-cyan-800">Learning Outcome</th>
                    <th className="text-left px-6 py-4 font-semibold text-cyan-800">Teaching Activity</th>
                    <th className="text-left px-6 py-4 font-semibold text-cyan-800">Assessment Method</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="px-6 py-4">
                      <EditableText
                        initialValue="ILO 1: Analyze AI tools in TPACK"
                        storageKey="matrix:ilo1:outcome"
                        as="span"
                        className="text-slate-700"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <EditableText
                        initialValue="Animated concept map analysis"
                        storageKey="matrix:ilo1:activity"
                        as="span"
                        className="text-slate-600"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <EditableText
                        initialValue="Pre/Post test scenario response"
                        storageKey="matrix:ilo1:assessment"
                        as="span"
                        className="text-slate-600"
                      />
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-6 py-4">
                      <EditableText
                        initialValue="ILO 2: Design lesson plan with TPACK"
                        storageKey="matrix:ilo2:outcome"
                        as="span"
                        className="text-slate-700"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <EditableText
                        initialValue="Lesson plan design challenge"
                        storageKey="matrix:ilo2:activity"
                        as="span"
                        className="text-slate-600"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <EditableText
                        initialValue="Design canvas with peer critique"
                        storageKey="matrix:ilo2:assessment"
                        as="span"
                        className="text-slate-600"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">
                      <EditableText
                        initialValue="ILO 3: Evaluate ethical implications"
                        storageKey="matrix:ilo3:outcome"
                        as="span"
                        className="text-slate-700"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <EditableText
                        initialValue="Ethical debate scenario"
                        storageKey="matrix:ilo3:activity"
                        as="span"
                        className="text-slate-600"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <EditableText
                        initialValue="Summative assignment rubric"
                        storageKey="matrix:ilo3:assessment"
                        as="span"
                        className="text-slate-600"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 6: Resources & Technology */}
        <section id="resources" className="mb-12 scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">6</div>
            <EditableText
              initialValue="Required Resources & Technology"
              storageKey="section:resources:title"
              as="h2"
              className="text-2xl font-bold text-slate-800"
            />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "📊", title: "TPACK 2.0 Visualization", desc: "Animated HTML5 embed" },
              { icon: "📝", title: "Padlet Boards", desc: "Collaborative work spaces" },
              { icon: "🗳️", title: "Mentimeter Polling", desc: "Formative assessments" },
              { icon: "📋", title: "TPACK Design Canvas", desc: "Google Docs template" },
              { icon: "📄", title: "Scenario Cards", desc: "PDF printouts/digital" },
              { icon: "🎯", title: "Kahoot Quiz", desc: "Vocabulary reinforcement" },
            ].map((resource, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="text-2xl mb-2">{resource.icon}</div>
                <EditableText
                  initialValue={resource.title}
                  storageKey={`resource:title:${i}`}
                  as="h4"
                  className="font-semibold text-slate-800 mb-1"
                />
                <EditableText
                  initialValue={resource.desc}
                  storageKey={`resource:desc:${i}`}
                  as="p"
                  className="text-sm text-slate-500"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Section 7: Differentiation & Inclusivity */}
        <section id="differentiation" className="mb-12 scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center font-bold">7</div>
            <EditableText
              initialValue="Differentiation & Inclusivity"
              storageKey="section:differentiation:title"
              as="h2"
              className="text-2xl font-bold text-slate-800"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Support Strategies */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-green-600 px-6 py-4">
                <h3 className="text-white font-semibold text-lg">Support Strategies</h3>
              </div>
              <div className="p-6 space-y-3">
                {[
                  "Pre-recorded TPACK component tutorial videos for visual learners",
                  "Sentence starters for reflective writing activities",
                  "Alternative formats for all materials (text-to-speech accessibility)",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <EditableText
                      initialValue={item}
                      storageKey={`support:${i}`}
                      as="p"
                      className="text-slate-600 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Extension Opportunities */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-purple-600 px-6 py-4">
                <h3 className="text-white font-semibold text-lg">Extension Opportunities</h3>
              </div>
              <div className="p-6 space-y-3">
                {[
                  "Advanced learners explore Google EDU Applied Digital Skills curriculum",
                  "Explore UNESCO AI in Education policy framework connections",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">→</span>
                    <EditableText
                      initialValue={item}
                      storageKey={`extension:${i}`}
                      as="p"
                      className="text-slate-600 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Accommodations */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-blue-600 px-6 py-4">
                <h3 className="text-white font-semibold text-lg">Accommodations</h3>
              </div>
              <div className="p-6 space-y-3">
                {[
                  "Adjustable workstations for physical accessibility",
                  "Live captioning via Otter.ai integration",
                  "Multilingual resource option toggle (Spanish/French versions)",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">♿</span>
                    <EditableText
                      initialValue={item}
                      storageKey={`accommodation:${i}`}
                      as="p"
                      className="text-slate-600 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 8: Reflection & Improvement */}
        <section id="reflection" className="mb-12 scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">8</div>
            <EditableText
              initialValue="Reflection & Improvement"
              storageKey="section:reflection:title"
              as="h2"
              className="text-2xl font-bold text-slate-800"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {/* Success Indicators */}
              <div className="p-6">
                <h4 className="font-semibold text-slate-800 mb-4">Success Indicators</h4>
                <ul className="space-y-2">
                  {[
                    "70%+ improvement rate between pre/post test scores",
                    "Quality of peer critique specificity (measured via coding rubric)",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-emerald-500 mt-0.5">●</span>
                      <EditableText initialValue={item} storageKey={`success:${i}`} as="span" />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Feedback Mechanism */}
              <div className="p-6">
                <h4 className="font-semibold text-slate-800 mb-4">Feedback Mechanism</h4>
                <ul className="space-y-2">
                  {[
                    "Post-lesson survey via Qualtrics on TPACK-AI confidence levels",
                    "Lesson plan analysis using embedded rubric scoring criteria",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-blue-500 mt-0.5">●</span>
                      <EditableText initialValue={item} storageKey={`feedback:${i}`} as="span" />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Future Modifications */}
              <div className="p-6">
                <h4 className="font-semibold text-slate-800 mb-4">Future Modifications</h4>
                <ul className="space-y-2">
                  {[
                    "Integrate VR classroom simulations for next iteration",
                    "Add policy integration component for systemic perspective",
                    "Explore generative AI tool demonstrations during class",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-amber-500 mt-0.5">●</span>
                      <EditableText initialValue={item} storageKey={`future:${i}`} as="span" />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Timing Summary */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
            <h3 className="font-semibold text-lg mb-4">Timing Summary</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-slate-300 text-sm">Introduction</p>
                <p className="text-2xl font-bold">12 min</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-slate-300 text-sm">Development</p>
                <p className="text-2xl font-bold">65 min</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-slate-300 text-sm">Closure</p>
                <p className="text-2xl font-bold">13 min</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-slate-300 text-sm">
                Total: <span className="text-white font-bold">90 minutes</span> (5 min break embedded in development activities)
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            <EditableText
              initialValue="Intelligent TPACK Framework - University Lesson Plan"
              storageKey="footer:text"
              as="span"
            />
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Click any text to edit • All changes are saved locally
          </p>
        </div>
      </footer>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
