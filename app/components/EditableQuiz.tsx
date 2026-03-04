"use client";
import { useState, useEffect } from "react";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface EditableQuizProps {
  title: string;
  questions: QuizQuestion[];
  storageKey: string;
}

export default function EditableQuiz({ title: initialTitle, questions: initialQuestions, storageKey }: EditableQuizProps) {
  const [title, setTitle] = useState(initialTitle);
  const [questions, setQuestions] = useState(initialQuestions);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`quiz:${storageKey}`);
    if (stored) {
      const data = JSON.parse(stored);
      setTitle(data.title);
      setQuestions(data.questions);
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(`quiz:${storageKey}`, JSON.stringify({ title, questions }));
  }, [title, questions, storageKey]);

  const score = answers.filter((a, i) => a === questions[i]?.correct).length;

  function handleSelect(qIdx: number, oIdx: number) {
    if (submitted) return;
    setAnswers((prev) => prev.map((a, i) => (i === qIdx ? oIdx : a)));
  }

  function handleSubmit() {
    if (answers.every((a) => a !== null)) setSubmitted(true);
  }

  function handleReset() {
    setAnswers(Array(questions.length).fill(null));
    setSubmitted(false);
  }

  function updateQuestion(index: number, field: keyof QuizQuestion, value: string | number) {
    const updated = [...questions];
    if (field === "question" || field === "explanation") {
      updated[index] = { ...updated[index], [field]: value };
    } else if (typeof value === "number") {
      updated[index] = { ...updated[index], [field]: value };
    }
    setQuestions(updated);
  }

  function updateOption(qIdx: number, oIdx: number, value: string) {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = value;
    setQuestions(updated);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
        {editingTitle ? (
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
            className="bg-white/20 text-white text-lg font-semibold rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        ) : (
          <h3
            className="text-white font-semibold text-lg cursor-pointer hover:underline"
            onClick={() => setEditingTitle(true)}
            title="Click to edit title"
          >
            {title}
          </h3>
        )}
        <p className="text-blue-100 text-sm">{questions.length} questions</p>
      </div>

      <div className="p-6 space-y-6">
        {questions.map((q, qi) => {
          const selected = answers[qi];
          const isCorrect = selected === q.correct;

          return (
            <div key={qi} className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                {editingQuestion === qi ? (
                  <input
                    autoFocus
                    type="text"
                    value={q.question}
                    onChange={(e) => updateQuestion(qi, "question", e.target.value)}
                    onBlur={() => setEditingQuestion(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingQuestion(null)}
                    className="flex-1 text-sm border border-blue-400 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                ) : (
                  <p
                    className="flex-1 font-medium text-slate-800 cursor-pointer hover:bg-slate-50 rounded px-1"
                    onClick={() => setEditingQuestion(qi)}
                    title="Click to edit question"
                  >
                    <span className="text-blue-600 font-bold mr-2">{qi + 1}.</span>
                    {q.question}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  let cls = "quiz-option w-full text-left px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ";

                  if (!submitted) {
                    cls += selected === oi
                      ? "border-blue-500 bg-blue-50 text-blue-800"
                      : "border-slate-200 text-slate-700";
                  } else {
                    if (oi === q.correct) {
                      cls += "border-emerald-500 bg-emerald-50 text-emerald-800 font-medium";
                    } else if (selected === oi && !isCorrect) {
                      cls += "border-red-400 bg-red-50 text-red-700";
                    } else {
                      cls += "border-slate-200 text-slate-500";
                    }
                  }

                  return (
                    <div key={oi} className="relative group">
                      <button className={cls} onClick={() => handleSelect(qi, oi)} disabled={submitted}>
                        <span className="font-semibold mr-2">{String.fromCharCode(65 + oi)}.</span>
                        {opt}
                      </button>
                      {editingQuestion === qi && (
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateOption(qi, oi, e.target.value)}
                          className="absolute inset-0 bg-white border border-blue-400 rounded-xl px-4 py-3 text-sm focus:outline-none"
                          placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {submitted && (
                <p className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                  {q.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-6 pb-6 flex items-center gap-4">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={answers.some((a) => a === null)}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Submit Answers
          </button>
        ) : (
          <>
            <div className="flex-1 bg-slate-50 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700">
              Score:{" "}
              <span className={score === questions.length ? "text-emerald-600" : score >= questions.length / 2 ? "text-blue-600" : "text-red-500"}>
                {score}/{questions.length}
              </span>
            </div>
            <button onClick={handleReset} className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-colors">
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
