"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const sections = [
  { id: "ilos", label: "Outcomes" },
  { id: "preclass", label: "Pre-Class" },
  { id: "introduction", label: "Introduction" },
  { id: "development", label: "Activities" },
  { id: "synthesis", label: "Synthesis" },
  { id: "assessment", label: "Assessment" },
  { id: "alignment", label: "Alignment" },
  { id: "resources", label: "Resources" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isSlides = pathname === "/slides";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo / Title */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">EP</span>
          <span className="font-semibold text-slate-800 text-sm hidden sm:block">Educational Psychology</span>
        </Link>

        {/* Desktop section links — only on main page */}
        {!isSlides && (
          <div className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="px-3 py-1.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors whitespace-nowrap"
              >
                {s.label}
              </a>
            ))}
          </div>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {isSlides ? (
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              ← Course Page
            </Link>
          ) : (
            <Link
              href="/slides"
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📊 Slides
            </Link>
          )}
          {/* Mobile menu toggle */}
          {!isSlides && (
            <button
              className="lg:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {!isSlides && menuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-2 flex flex-col gap-1">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              {s.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
