"use client";
import { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import VennDiagram from "../components/VennDiagram";
import React from "react";

const initialSlides = [
  {
    id: 1,
    title: "Cognitive & Social Constructivism",
    subtitle: "Introduction to Educational Psychology",
    type: "cover",
  },
  {
    id: 2,
    title: "What is Constructivism?",
    type: "content",
    points: [
      "Learners actively build knowledge — not passive recipients",
      "New experiences are connected to prior knowledge",
      "Two major branches: Cognitive (Piaget) & Social (Vygotsky)",
      "Both reject the 'blank slate' view of the mind",
    ],
    icon: "🧠",
  },
  {
    id: 3,
    title: "Piaget: Cognitive Constructivism",
    type: "two-col",
    left: {
      heading: "Core Ideas",
      points: [
        "Knowledge built through individual interaction with environment",
        "Universal stages of cognitive development",
        "Schemas: mental frameworks for organizing knowledge",
      ],
    },
    right: {
      heading: "Key Processes",
      points: [
        "Assimilation — fitting new info into existing schemas",
        "Accommodation — modifying schemas for new info",
        "Equilibration — restoring cognitive balance",
        "Disequilibrium — the productive discomfort that drives learning",
      ],
    },
  },
  {
    id: 4,
    title: "Vygotsky: Social Constructivism",
    type: "two-col",
    left: {
      heading: "Core Ideas",
      points: [
        "Knowledge co-constructed through social interaction",
        "Language is the primary tool of thought",
        "Culture shapes cognitive development",
      ],
    },
    right: {
      heading: "Key Concepts",
      points: [
        "ZPD — gap between independent & guided performance",
        "Scaffolding — temporary support within the ZPD",
        "MKO — teacher, peer, or technology as guide",
        "Fading — gradual removal of support as mastery grows",
      ],
    },
  },
  {
    id: 5,
    title: "Compare & Contrast",
    type: "venn",
  },
  {
    id: 6,
    title: "Classroom Application",
    type: "content",
    points: [
      "Activate prior knowledge before new instruction",
      "Design tasks that create productive struggle (disequilibrium)",
      "Use peer collaboration and discussion (ZPD)",
      "Provide scaffolding — then gradually fade support",
      "Reflect: How does Ms. Chen's buoyancy lesson apply both theories?",
    ],
    icon: "🏫",
  },
  {
    id: 7,
    title: "Key Takeaways",
    type: "takeaways",
    items: [
      { icon: "🧩", text: "Constructivism = active knowledge building" },
      { icon: "🔄", text: "Piaget: schemas, assimilation, accommodation" },
      { icon: "🤝", text: "Vygotsky: ZPD, scaffolding, MKO" },
      { icon: "⚖️", text: "Both theories are complementary, not competing" },
      { icon: "🎯", text: "Good teaching activates, challenges, and supports" },
    ],
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Slide = any;

/** Inline-editable text node */
function Editable({
  value,
  onChange,
  className,
  as: Tag = "span",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}) {
  const ref = useRef<HTMLElement>(null);

  // Sync external value only when not focused
  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.textContent = value;
    }
  }, [value]);

  const DynamicTag = Tag as React.ElementType;

  return (
    <DynamicTag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onBlur={() => onChange(ref.current?.textContent ?? "")}
      className={`outline-none rounded px-0.5 cursor-text hover:bg-black/5 focus:bg-blue-50 focus:ring-1 focus:ring-blue-300 transition-colors ${className ?? ""}`}
    >
      {value}
    </DynamicTag>
  );
}

export default function SlidesPage() {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [current, setCurrent] = useState(0);
  const slide = slides[current];
  const total = slides.length;

  function prev() { setCurrent((c) => Math.max(0, c - 1)); }
  function next() { setCurrent((c) => Math.min(total - 1, c + 1)); }

  // Generic updater — merges a partial patch into the current slide
  function updateSlide(patch: Partial<Slide>) {
    setSlides((prev) =>
      prev.map((s, i) => (i === current ? { ...s, ...patch } : s))
    );
  }

  function updatePoint(index: number, value: string) {
    const points = [...slide.points];
    points[index] = value;
    updateSlide({ points });
  }

  function updateColPoint(side: "left" | "right", index: number, value: string) {
    const col = { ...slide[side] };
    const points = [...col.points];
    points[index] = value;
    updateSlide({ [side]: { ...col, points } });
  }

  function updateColHeading(side: "left" | "right", value: string) {
    updateSlide({ [side]: { ...slide[side], heading: value } });
  }

  function updateTakeaway(index: number, value: string) {
    const items = slide.items.map((item: { icon: string; text: string }, i: number) =>
      i === index ? { ...item, text: value } : item
    );
    updateSlide({ items });
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-slate-900 flex flex-col">
        {/* Edit hint */}
        <p className="text-center text-white/30 text-xs pt-3 select-none">
          ✏️ Click any text to edit
        </p>

        {/* Slide area */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-4xl aspect-video bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <SlideRenderer
              slide={slide}
              updateSlide={updateSlide}
              updatePoint={updatePoint}
              updateColPoint={updateColPoint}
              updateColHeading={updateColHeading}
              updateTakeaway={updateTakeaway}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 pb-8">
          <button
            onClick={prev}
            disabled={current === 0}
            className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 disabled:opacity-30 transition-colors text-lg"
            aria-label="Previous slide"
          >
            ‹
          </button>

          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-white w-6" : "bg-white/40"}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={current === total - 1}
            className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 disabled:opacity-30 transition-colors text-lg"
            aria-label="Next slide"
          >
            ›
          </button>
        </div>

        <p className="text-center text-white/40 text-xs pb-4">
          {current + 1} / {total} — use arrow keys or buttons to navigate
        </p>
      </div>
    </>
  );
}

interface RendererProps {
  slide: Slide;
  updateSlide: (patch: Partial<Slide>) => void;
  updatePoint: (i: number, v: string) => void;
  updateColPoint: (side: "left" | "right", i: number, v: string) => void;
  updateColHeading: (side: "left" | "right", v: string) => void;
  updateTakeaway: (i: number, v: string) => void;
}

function SlideRenderer({ slide, updateSlide, updatePoint, updateColPoint, updateColHeading, updateTakeaway }: RendererProps) {
  if (slide.type === "cover") {
    return (
      <div className="flex-1 bg-gradient-to-br from-blue-600 to-violet-700 flex flex-col items-center justify-center text-center p-12">
        <Editable
          value={slide.subtitle}
          onChange={(v) => updateSlide({ subtitle: v })}
          className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-4 block"
          as="span"
        />
        <Editable
          value={slide.title}
          onChange={(v) => updateSlide({ title: v })}
          className="text-5xl font-bold text-white leading-tight block"
          as="h1"
        />
        <div className="mt-8 flex gap-3">
          {["Piaget", "Vygotsky", "ZPD", "Scaffolding"].map((tag) => (
            <span key={tag} className="px-3 py-1 bg-white/20 text-white rounded-full text-sm">{tag}</span>
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === "content") {
    return (
      <div className="flex-1 flex flex-col p-10">
        <SlideTitle title={slide.title} onChange={(v) => updateSlide({ title: v })} />
        <div className="flex-1 flex items-center">
          <ul className="space-y-4 w-full">
            {slide.points.map((p: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <Editable
                  value={p}
                  onChange={(v) => updatePoint(i, v)}
                  className="text-slate-700 text-lg leading-snug"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (slide.type === "two-col") {
    return (
      <div className="flex-1 flex flex-col p-10">
        <SlideTitle title={slide.title} onChange={(v) => updateSlide({ title: v })} />
        <div className="flex-1 grid grid-cols-2 gap-6 mt-4">
          {(["left", "right"] as const).map((side, ci) => (
            <div key={ci} className={`rounded-xl p-5 ${ci === 0 ? "bg-blue-50 border border-blue-100" : "bg-violet-50 border border-violet-100"}`}>
              <Editable
                value={slide[side].heading}
                onChange={(v) => updateColHeading(side, v)}
                className={`font-bold text-sm uppercase tracking-wide mb-3 block ${ci === 0 ? "text-blue-700" : "text-violet-700"}`}
                as="h3"
              />
              <ul className="space-y-2">
                {slide[side].points.map((p: string, i: number) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${ci === 0 ? "bg-blue-400" : "bg-violet-400"}`} />
                    <Editable
                      value={p}
                      onChange={(v) => updateColPoint(side, i, v)}
                      className="text-slate-700"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === "venn") {
    return (
      <div className="flex-1 flex flex-col p-10">
        <SlideTitle title={slide.title} onChange={(v) => updateSlide({ title: v })} />
        <div className="flex-1 flex items-center justify-center">
          <VennDiagram />
        </div>
      </div>
    );
  }

  if (slide.type === "takeaways") {
    return (
      <div className="flex-1 flex flex-col p-10">
        <SlideTitle title={slide.title} onChange={(v) => updateSlide({ title: v })} />
        <div className="flex-1 grid grid-cols-2 gap-4 mt-4 content-center">
          {slide.items.map((item: { icon: string; text: string }, i: number) => (
            <div key={i} className="flex gap-3 items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <span className="text-2xl">{item.icon}</span>
              <Editable
                value={item.text}
                onChange={(v) => updateTakeaway(i, v)}
                className="text-slate-700 text-sm font-medium"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

function SlideTitle({ title, onChange }: { title: string; onChange: (v: string) => void }) {
  return (
    <div className="border-b border-slate-100 pb-4 mb-2">
      <Editable
        value={title}
        onChange={onChange}
        className="text-2xl font-bold text-slate-900 block"
        as="h2"
      />
    </div>
  );
}
