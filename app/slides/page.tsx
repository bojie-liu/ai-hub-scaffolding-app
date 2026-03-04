"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import EditableText from "../components/EditableText";

interface Slide {
  id: number;
  title: string;
  content: string[];
  type: "title" | "content" | "two-column" | "activity";
}

const defaultSlides: Slide[] = [
  {
    id: 1,
    type: "title",
    title: "Intelligent TPACK Framework",
    content: [
      "Teacher Capacity Building in the AI Era",
      "University Lesson Plan",
      "Click any text to edit",
    ],
  },
  {
    id: 2,
    type: "content",
    title: "Intended Learning Outcomes (ILOs)",
    content: [
      "ILO 1: Analyze how AI tools enhance TPACK components",
      "ILO 2: Design a lesson plan integrating Intelligent TPACK framework elements",
      "ILO 3: Evaluate ethical implications of AI integration using TPACK framework",
    ],
  },
  {
    id: 3,
    type: "content",
    title: "Pre-Class Preparation",
    content: [
      "Pre-Reading: Koehler & Mishra (2005) TPACK framework foundational paper",
      "Case Study: Intelligent TPACK Implementation in High School STEM Classrooms",
      "Pre-Test: AI Integration in TPACK - 5 scenario-based questions",
    ],
  },
  {
    id: 4,
    type: "two-column",
    title: "Guiding Questions",
    content: [
      "How might AI tools strengthen content-pedagogy connections in your teaching context?",
      "What ethical considerations arise when integrating AI into TPACK framework?",
    ],
  },
  {
    id: 5,
    type: "content",
    title: "TPACK Framework Overview",
    content: [
      "Content Knowledge (CK) - Subject matter expertise",
      "Pedagogical Knowledge (PK) - Teaching methods and strategies",
      "Technological Knowledge (TK) - Digital tools and AI applications",
      "TPACK - The intersection of all three knowledge domains",
    ],
  },
  {
    id: 6,
    type: "activity",
    title: "Activity 1: Interactive Lecture (15 min)",
    content: [
      "Break down TPACK framework with AI overlay",
      "TPACK 2.0 Animated Visualization",
      "Prompt: Identify a teaching strategy where AI could strengthen two TPACK components simultaneously",
    ],
  },
  {
    id: 7,
    type: "activity",
    title: "Activity 2: Small Group Design Challenge (20 min)",
    content: [
      "Groups of 4-5 design an AI-enhanced TPACK lesson plan",
      "TPACK Design Canvas Template:",
      "Content-Knowledge | Pedagogical Approach | Tech Integration | AI Application",
    ],
  },
  {
    id: 8,
    type: "activity",
    title: "Activity 3 & 4: Peer Critique & Ethical Debate (25 min)",
    content: [
      "Peer Critique Circles (15 min): 2 stars and 1 wish protocol",
      "Ethical Debate Scenario (10 min): AI grading tools vs. content specialty",
      "Structured Socratic seminar framework with role cards",
    ],
  },
  {
    id: 9,
    type: "content",
    title: "Assessment Methods",
    content: [
      "Formative: Pre-Post Test comparison, Peer critique rubric",
      "Summative: Intelligent TPACK Implementation Prospectus",
      "Rubric: TPACK Integration | AI Functionality Match | Ethical Consideration",
    ],
  },
  {
    id: 10,
    type: "title",
    title: "Thank You",
    content: [
      "Questions & Discussion",
      "Next Session: Personalized learning pathways using Intelligent TPACK",
      "Assignment Due: Intelligent TPACK Implementation Prospectus",
    ],
  },
];

export default function SlidesPage() {
  const [slides, setSlides] = useState<Slide[]>(defaultSlides);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("slides:data");
    if (stored) {
      setSlides(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("slides:data", JSON.stringify(slides));
  }, [slides]);

  const updateSlide = useCallback((slideId: number, field: "title" | "content", value: string | string[], index?: number) => {
    setSlides((prev) =>
      prev.map((slide) => {
        if (slide.id !== slideId) return slide;
        if (field === "title") {
          return { ...slide, title: value as string };
        }
        if (typeof index === "number" && Array.isArray(value)) {
          const newContent = [...slide.content];
          newContent[index] = value[index] as string;
          return { ...slide, content: newContent };
        }
        return slide;
      })
    );
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "f" || e.key === "F") toggleFullscreen();
      if (e.key === "Escape" && isFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, isFullscreen]);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  const currentSlide = slides[currentIndex];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Top bar */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-slate-300 hover:text-white text-sm flex items-center gap-2">
          <span>← Back to Lesson</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm">
            {currentIndex + 1} / {slides.length}
          </span>
          <button
            onClick={toggleFullscreen}
            className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition-colors"
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen (F)"}
          </button>
        </div>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden aspect-video flex flex-col">
          {/* Slide header */}
          <div
            className={`${
              currentSlide.type === "title" ? "bg-blue-600 py-16" : "bg-blue-600 py-8"
            } px-12`}
          >
            <EditableText
              initialValue={currentSlide.title}
              storageKey={`slide:${currentSlide.id}:title`}
              as="h1"
              className={`text-white font-bold ${
                currentSlide.type === "title" ? "text-4xl md:text-5xl text-center" : "text-3xl"
              }`}
            />
          </div>

          {/* Slide body */}
          <div className={`flex-1 p-12 ${currentSlide.type === "title" ? "flex items-center justify-center" : ""}`}>
            {currentSlide.type === "two-column" ? (
              <div className="grid grid-cols-2 gap-8">
                {currentSlide.content.map((item, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <EditableText
                      initialValue={item}
                      storageKey={`slide:${currentSlide.id}:content:${i}`}
                      as="p"
                      className="text-lg text-slate-700"
                      multiline
                    />
                  </div>
                ))}
              </div>
            ) : currentSlide.type === "activity" ? (
              <div className="space-y-4">
                {currentSlide.content.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm shrink-0">
                      {i + 1}
                    </div>
                    <EditableText
                      initialValue={item}
                      storageKey={`slide:${currentSlide.id}:content:${i}`}
                      as="p"
                      className="text-xl text-slate-700"
                      multiline
                    />
                  </div>
                ))}
              </div>
            ) : currentSlide.type === "title" ? (
              <div className="text-center space-y-6">
                {currentSlide.content.map((item, i) => (
                  <EditableText
                    key={i}
                    initialValue={item}
                    storageKey={`slide:${currentSlide.id}:content:${i}`}
                    as="p"
                    className={`text-2xl text-slate-600 ${i === 0 ? "font-semibold" : "text-slate-500"}`}
                  />
                ))}
              </div>
            ) : (
              <ul className="space-y-6">
                {currentSlide.content.map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="w-3 h-3 rounded-full bg-blue-600 mt-2.5 shrink-0" />
                    <EditableText
                      initialValue={item}
                      storageKey={`slide:${currentSlide.id}:content:${i}`}
                      as="p"
                      className="text-xl text-slate-700"
                      multiline
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-slate-800 border-t border-slate-700 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="px-6 py-2.5 bg-slate-700 text-slate-300 rounded-lg font-medium text-sm hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>

          {/* Slide indicators */}
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === currentIndex ? "bg-blue-500" : "bg-slate-600 hover:bg-slate-500"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            disabled={currentIndex === slides.length - 1}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
