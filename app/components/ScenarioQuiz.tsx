"use client";
import { useState } from "react";

interface Scenario {
  scenario: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const scenarios: Scenario[] = [
  {
    scenario:
      "Mr. Tan delivers a 60-minute lecture on photosynthesis with no student interaction. Students copy notes verbatim. On the test, most cannot explain why leaves turn yellow in autumn.",
    question: "Which constructivist principle was most neglected?",
    options: [
      "Using visual aids",
      "Activating prior knowledge and creating disequilibrium",
      "Assigning homework",
      "Grouping students by ability",
    ],
    correct: 1,
    explanation:
      "Constructivism requires connecting new content to existing schemas and creating productive struggle. A passive lecture prevents both — students never had to reconcile new ideas with what they already believed.",
  },
  {
    scenario:
      "A teacher assigns a group project but lets students work entirely independently with no guidance. Struggling students fall further behind while advanced students do all the work.",
    question: "What constructivist strategy is missing?",
    options: [
      "Peer assessment rubrics",
      "Scaffolding within the Zone of Proximal Development",
      "Summative testing",
      "Reducing group size",
    ],
    correct: 1,
    explanation:
      "Vygotsky's ZPD requires a More Knowledgeable Other to provide targeted support. Without scaffolding, students outside their ZPD cannot progress — collaboration alone is insufficient.",
  },
  {
    scenario:
      "Ms. Rivera introduces fractions by immediately teaching the algorithm for addition. Students can compute answers but cannot explain what a fraction represents or draw one.",
    question: "Which Piagetian principle was skipped?",
    options: [
      "Formal operations stage",
      "Building on concrete and iconic representations before abstract symbols",
      "Peer collaboration",
      "Summative assessment",
    ],
    correct: 1,
    explanation:
      "Piaget (and Bruner's related work) emphasises moving from concrete → iconic → abstract. Jumping straight to algorithms bypasses the schema-building that gives the abstraction meaning.",
  },
  {
    scenario:
      "A teacher notices a student has mastered a concept and continues providing the same level of hints and prompts as before.",
    question: "What should the teacher do according to Vygotsky?",
    options: [
      "Increase the difficulty of hints",
      "Begin fading scaffolding to promote independence",
      "Move the student to a lower group",
      "Introduce a new unrelated topic",
    ],
    correct: 1,
    explanation:
      "Scaffolding should be temporary. Once a learner can perform within their ZPD, support must be gradually withdrawn (faded) so the skill becomes fully internalised and independent.",
  },
];

export default function ScenarioQuiz() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = scenarios[current];

  function handleSelect(i: number) {
    if (revealed) return;
    setSelected(i);
  }

  function handleReveal() {
    if (selected === null) return;
    setRevealed(true);
    if (selected === q.correct) setScore((s) => s + 1);
  }

  function handleNext() {
    if (current + 1 >= scenarios.length) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setRevealed(false);
    }
  }

  function handleReset() {
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setDone(false);
  }

  if (done) {
    const pct = Math.round((score / scenarios.length) * 100);
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-rose-600 px-6 py-4">
          <h3 className="text-white font-semibold text-lg">Scenario-Based Quiz: What Would You Fix?</h3>
        </div>
        <div className="p-8 text-center space-y-4">
          <p className="text-5xl font-bold text-slate-800">{score}/{scenarios.length}</p>
          <p className={`text-lg font-medium ${pct >= 75 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-red-500"}`}>
            {pct >= 75 ? "Excellent diagnostic thinking!" : pct >= 50 ? "Good — review the explanations above." : "Revisit the theory sections and try again."}
          </p>
          <button
            onClick={handleReset}
            className="mt-2 px-6 py-2.5 bg-rose-600 text-white rounded-xl font-medium text-sm hover:bg-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-rose-600 px-6 py-4 flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold text-lg">Scenario-Based Quiz: What Would You Fix?</h3>
          <p className="text-rose-100 text-sm mt-0.5">Diagnose which constructivist principles were ignored</p>
        </div>
        <span className="text-rose-100 text-sm font-medium">{current + 1} / {scenarios.length}</span>
      </div>

      <div className="p-6 space-y-5">
        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5">
          <div
            className="bg-rose-500 h-1.5 rounded-full transition-all"
            style={{ width: `${((current + 1) / scenarios.length) * 100}%` }}
          />
        </div>

        {/* Scenario */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Classroom Scenario</p>
          <p className="text-slate-700 text-sm leading-relaxed">{q.scenario}</p>
        </div>

        {/* Question */}
        <p className="font-semibold text-slate-800">{q.question}</p>

        {/* Options */}
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            let cls = "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ";
            if (!revealed) {
              cls += selected === i
                ? "border-rose-500 bg-rose-50 text-rose-800"
                : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50";
            } else {
              if (i === q.correct) cls += "border-emerald-500 bg-emerald-50 text-emerald-800 font-medium";
              else if (selected === i) cls += "border-red-400 bg-red-50 text-red-700";
              else cls += "border-slate-200 text-slate-400";
            }
            return (
              <button key={i} className={cls} onClick={() => handleSelect(i)} disabled={revealed}>
                <span className="font-semibold mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {revealed && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 leading-relaxed">
            💡 {q.explanation}
          </div>
        )}
      </div>

      <div className="px-6 pb-6 flex gap-3">
        {!revealed ? (
          <button
            onClick={handleReveal}
            disabled={selected === null}
            className="px-6 py-2.5 bg-rose-600 text-white rounded-xl font-medium text-sm hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-slate-800 text-white rounded-xl font-medium text-sm hover:bg-slate-900 transition-colors"
          >
            {current + 1 < scenarios.length ? "Next Scenario →" : "See Results"}
          </button>
        )}
      </div>
    </div>
  );
}
