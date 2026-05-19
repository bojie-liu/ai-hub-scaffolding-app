'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const modes = [
  {
    id: 'socialization',
    label: 'Socialization',
    from: 'Tacit',
    to: 'Tacit',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Sharing experiences through observation, imitation, and practice. Example: mentor-mentee relationships in schools.',
    example: 'A new teacher observing an experienced teacher\'s classroom management techniques.',
  },
  {
    id: 'externalization',
    label: 'Externalization',
    from: 'Tacit',
    to: 'Explicit',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'Articulating tacit knowledge into explicit concepts through dialogue and reflection.',
    example: 'A teacher writing a guide on effective lesson planning based on years of experience.',
  },
  {
    id: 'combination',
    label: 'Combination',
    from: 'Explicit',
    to: 'Explicit',
    color: 'bg-amber-500',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Systematizing and combining explicit knowledge into new explicit knowledge.',
    example: 'Combining curriculum documents, assessment data, and research findings into a school improvement plan.',
  },
  {
    id: 'internalization',
    label: 'Internalization',
    from: 'Explicit',
    to: 'Tacit',
    color: 'bg-violet-500',
    textColor: 'text-violet-700',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    description: 'Embodying explicit knowledge into tacit knowledge through practice and learning by doing.',
    example: 'A teacher applying a new pedagogical framework in their classroom until it becomes second nature.',
  },
];

export default function SeciModel() {
  const [active, setActive] = useState<string | null>(null);

  const activeMode = modes.find((m) => m.id === active);

  return (
    <div className="space-y-4">
      {/* SECI Cycle Diagram */}
      <div className="flex items-center justify-center">
        <div className="relative w-72 h-72 sm:w-80 sm:h-80">
          {/* Center circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-600 text-center">SECI<br />Model</span>
            </div>
          </div>

          {/* Top - Socialization */}
          <button
            onClick={() => setActive(active === 'socialization' ? null : 'socialization')}
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all border-2 ${
              active === 'socialization' ? 'border-blue-500 ring-4 ring-blue-200 scale-110' : 'border-blue-200 hover:scale-105'
            } bg-blue-50`}
          >
            <div className="w-3 h-3 rounded-full bg-blue-500 mb-1" />
            <span className="text-xs font-semibold text-blue-700">Socialization</span>
            <span className="text-[10px] text-blue-500">Tacit → Tacit</span>
          </button>

          {/* Right - Externalization */}
          <button
            onClick={() => setActive(active === 'externalization' ? null : 'externalization')}
            className={`absolute right-0 top-1/2 -translate-y-1/2 w-28 h-28 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all border-2 ${
              active === 'externalization' ? 'border-emerald-500 ring-4 ring-emerald-200 scale-110' : 'border-emerald-200 hover:scale-105'
            } bg-emerald-50`}
          >
            <div className="w-3 h-3 rounded-full bg-emerald-500 mb-1" />
            <span className="text-xs font-semibold text-emerald-700">Externalization</span>
            <span className="text-[10px] text-emerald-500">Tacit → Explicit</span>
          </button>

          {/* Bottom - Combination */}
          <button
            onClick={() => setActive(active === 'combination' ? null : 'combination')}
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all border-2 ${
              active === 'combination' ? 'border-amber-500 ring-4 ring-amber-200 scale-110' : 'border-amber-200 hover:scale-105'
            } bg-amber-50`}
          >
            <div className="w-3 h-3 rounded-full bg-amber-500 mb-1" />
            <span className="text-xs font-semibold text-amber-700">Combination</span>
            <span className="text-[10px] text-amber-500">Explicit → Explicit</span>
          </button>

          {/* Left - Internalization */}
          <button
            onClick={() => setActive(active === 'internalization' ? null : 'internalization')}
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-28 h-28 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all border-2 ${
              active === 'internalization' ? 'border-violet-500 ring-4 ring-violet-200 scale-110' : 'border-violet-200 hover:scale-105'
            } bg-violet-50`}
          >
            <div className="w-3 h-3 rounded-full bg-violet-500 mb-1" />
            <span className="text-xs font-semibold text-violet-700">Internalization</span>
            <span className="text-[10px] text-violet-500">Explicit → Tacit</span>
          </button>

          {/* Arrows - clockwise */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320" fill="none">
            {/* Top to Right */}
            <path d="M 200 60 Q 260 60 260 120" stroke="#94a3b8" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
            {/* Right to Bottom */}
            <path d="M 260 200 Q 260 260 200 260" stroke="#94a3b8" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
            {/* Bottom to Left */}
            <path d="M 120 260 Q 60 260 60 200" stroke="#94a3b8" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
            {/* Left to Top */}
            <path d="M 60 120 Q 60 60 120 60" stroke="#94a3b8" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
              </marker>
            </defs>
          </svg>
        </div>
      </div>

      {/* Detail card for active mode */}
      {activeMode && (
        <Card className={`${activeMode.borderColor} border-2`}>
          <CardContent className={`pt-4 ${activeMode.bgColor} rounded-lg`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${activeMode.color}`} />
              <h4 className={`font-semibold ${activeMode.textColor}`}>{activeMode.label}</h4>
              <span className="text-xs text-muted-foreground">({activeMode.from} → {activeMode.to})</span>
            </div>
            <p className="text-sm text-slate-700 mb-2">{activeMode.description}</p>
            <p className="text-sm text-slate-600">
              <span className="font-medium">School Example: </span>{activeMode.example}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick reference grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setActive(active === mode.id ? null : mode.id)}
            className={`p-2 rounded-lg text-center transition-all border ${
              active === mode.id
                ? `${mode.bgColor} ${mode.borderColor} border-2`
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${mode.color} mx-auto mb-1`} />
            <p className="text-xs font-semibold text-slate-800">{mode.label}</p>
            <p className="text-[10px] text-muted-foreground">{mode.from} → {mode.to}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
