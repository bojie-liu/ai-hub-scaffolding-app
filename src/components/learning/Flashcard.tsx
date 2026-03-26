"use client";
import { useState } from "react";

interface FlashcardProps {
  cards: { front: string; back: string }[];
}

export default function Flashcard({ cards }: FlashcardProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  function next() {
    setFlipped(false);
    setTimeout(() => setIndex((i) => (i + 1) % cards.length), 150);
  }
  function prev() {
    setFlipped(false);
    setTimeout(() => setIndex((i) => (i - 1 + cards.length) % cards.length), 150);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Card */}
      <div
        className="w-full max-w-md h-48 cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div className={`flashcard-inner w-full h-full ${flipped ? "flipped" : ""}`}>
          {/* Front */}
          <div className="flashcard-front w-full h-full bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex flex-col items-center justify-center p-6 shadow-md">
            <span className="text-blue-200 text-xs font-medium uppercase tracking-widest mb-3">Term</span>
            <p className="text-white text-xl font-semibold text-center leading-snug">
              {cards[index].front}
            </p>
            <span className="text-blue-300 text-xs mt-4">Click to reveal</span>
          </div>
          {/* Back */}
          <div className="flashcard-back w-full h-full bg-gradient-to-br from-violet-600 to-violet-700 rounded-2xl flex flex-col items-center justify-center p-6 shadow-md">
            <span className="text-violet-200 text-xs font-medium uppercase tracking-widest mb-3">Definition</span>
            <p className="text-white text-base text-center leading-relaxed">
              {cards[index].back}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={prev}
          className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Previous card"
        >
          ‹
        </button>
        <span className="text-sm text-slate-500">
          {index + 1} / {cards.length}
        </span>
        <button
          onClick={next}
          className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Next card"
        >
          ›
        </button>
      </div>
    </div>
  );
}
