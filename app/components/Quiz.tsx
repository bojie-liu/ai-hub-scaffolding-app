"use client";
import { useState } from "react";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizProps {
  title: string;
  questions: QuizQuestion[];
}

export default function Quiz({ title, questions }: QuizProps) {
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null)
  );
  const [submitted, setSubmitted] = useState(false);

  const score = answers.filter((a, i) => a === questions[i].correct).length;

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

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-blue-600 px-6 py-4">
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        <p className="text-blue-100 text-sm mt-0.5">{questions.length} questions</p>
      </div>

      <div className="p-6 space-y-6">
        {questions.map((q, qi) => {
          const selected = answers[qi];
          const isCorrect = selected === q.correct;
          return (
            <div key={qi}>
              <p className="font-medium text-slate-800 mb-3">
                <span className="text-blue-600 font-bold mr-2">{qi + 1}.</span>
                {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  let cls =
                    "quiz-option w-full text-left px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ";
                  if (!submitted) {
                    cls +=
                      selected === oi
                        ? "border-blue-500 bg-blue-50 text-blue-800"
                        : "border-slate-200 text-slate-700";
                  } else {
                    if (oi === q.correct)
                      cls += "border-emerald-500 bg-emerald-50 text-emerald-800 font-medium";
                    else if (selected === oi && !isCorrect)
                      cls += "border-red-400 bg-red-50 text-red-700";
                    else cls += "border-slate-200 text-slate-500";
                  }
                  return (
                    <button
                      key={oi}
                      className={cls}
                      onClick={() => handleSelect(qi, oi)}
                      disabled={submitted}
                    >
                      <span className="font-semibold mr-2">
                        {String.fromCharCode(65 + oi)}.
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <p className="mt-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                  💡 {q.explanation}
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
              <span
                className={
                  score === questions.length
                    ? "text-emerald-600"
                    : score >= questions.length / 2
                    ? "text-blue-600"
                    : "text-red-500"
                }
              >
                {score}/{questions.length}
              </span>
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
