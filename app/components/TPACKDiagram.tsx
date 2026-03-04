"use client";

export default function TPACKDiagram() {
  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox="0 0 600 400"
        className="w-full max-w-2xl mx-auto"
        aria-label="TPACK Framework Venn Diagram showing intersection of Technology, Pedagogy, and Content Knowledge"
        role="img"
      >
        {/* Content Knowledge (Top) */}
        <circle cx="300" cy="140" r="110" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="2" />
        {/* Pedagogical Knowledge (Bottom Left) */}
        <circle cx="220" cy="280" r="110" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="2" />
        {/* Technological Knowledge (Bottom Right) */}
        <circle cx="380" cy="280" r="110" fill="#f59e0b" fillOpacity="0.2" stroke="#f59e0b" strokeWidth="2" />

        {/* Labels for main circles */}
        <text x="300" y="65" textAnchor="middle" fill="#1d4ed8" fontSize="14" fontWeight="700">
          Content Knowledge (CK)
        </text>
        <text x="300" y="82" textAnchor="middle" fill="#1d4ed8" fontSize="11">
          Subject matter expertise
        </text>

        <text x="100" y="320" textAnchor="middle" fill="#059669" fontSize="14" fontWeight="700">
          Pedagogical Knowledge (PK)
        </text>
        <text x="100" y="337" textAnchor="middle" fill="#059669" fontSize="11">
          Teaching methods
        </text>

        <text x="500" y="320" textAnchor="middle" fill="#d97706" fontSize="14" fontWeight="700">
          Technological Knowledge (TK)
        </text>
        <text x="500" y="337" textAnchor="middle" fill="#d97706" fontSize="11">
          Digital tools & AI
        </text>

        {/* Intersection labels */}
        {/* PCK - Left intersection */}
        <text x="245" y="200" textAnchor="middle" fill="#047857" fontSize="10" fontWeight="600">PCK</text>
        <text x="245" y="213" textAnchor="middle" fill="#047857" fontSize="8">Content + Pedagogy</text>

        {/* TCK - Top right intersection */}
        <text x="355" y="200" textAnchor="middle" fill="#b45309" fontSize="10" fontWeight="600">TCK</text>
        <text x="355" y="213" textAnchor="middle" fill="#b45309" fontSize="8">Content + Tech</text>

        {/* TPK - Bottom intersection */}
        <text x="300" y="310" textAnchor="middle" fill="#c2410c" fontSize="10" fontWeight="600">TPK</text>
        <text x="300" y="323" textAnchor="middle" fill="#c2410c" fontSize="8">Tech + Pedagogy</text>

        {/* TPACK - Center */}
        <text x="300" y="225" textAnchor="middle" fill="#1e3a8a" fontSize="12" fontWeight="700">TPACK</text>
        <text x="300" y="240" textAnchor="middle" fill="#1e3a8a" fontSize="9">Intelligent Integration</text>
        <text x="300" y="253" textAnchor="middle" fill="#1e3a8a" fontSize="8">+ AI Enhancement</text>

        {/* AI overlay indicator */}
        <circle cx="300" cy="230" r="35" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,4" opacity="0.6" />
      </svg>
    </div>
  );
}
