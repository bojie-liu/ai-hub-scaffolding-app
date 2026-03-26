export default function VennDiagram() {
  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox="0 0 520 280"
        className="w-full max-w-xl mx-auto"
        aria-label="Venn diagram comparing Cognitive and Social Constructivism"
        role="img"
      >
        {/* Left circle — Cognitive */}
        <circle cx="185" cy="140" r="120" fill="#2563eb" fillOpacity="0.15" stroke="#2563eb" strokeWidth="2" />
        {/* Right circle — Social */}
        <circle cx="335" cy="140" r="120" fill="#7c3aed" fillOpacity="0.15" stroke="#7c3aed" strokeWidth="2" />

        {/* Left label */}
        <text x="110" y="60" textAnchor="middle" className="font-bold" fill="#1d4ed8" fontSize="13" fontWeight="700">
          Cognitive
        </text>
        <text x="110" y="76" textAnchor="middle" fill="#1d4ed8" fontSize="13" fontWeight="700">
          Constructivism
        </text>

        {/* Right label */}
        <text x="410" y="60" textAnchor="middle" fill="#6d28d9" fontSize="13" fontWeight="700">
          Social
        </text>
        <text x="410" y="76" textAnchor="middle" fill="#6d28d9" fontSize="13" fontWeight="700">
          Constructivism
        </text>

        {/* Left-only items */}
        <text x="118" y="120" textAnchor="middle" fill="#1e40af" fontSize="11">Individual schemas</text>
        <text x="118" y="138" textAnchor="middle" fill="#1e40af" fontSize="11">Assimilation &amp;</text>
        <text x="118" y="153" textAnchor="middle" fill="#1e40af" fontSize="11">Accommodation</text>
        <text x="118" y="171" textAnchor="middle" fill="#1e40af" fontSize="11">Stages of development</text>
        <text x="118" y="189" textAnchor="middle" fill="#1e40af" fontSize="11">(Piaget)</text>

        {/* Overlap items */}
        <text x="260" y="125" textAnchor="middle" fill="#374151" fontSize="10.5" fontWeight="600">Active</text>
        <text x="260" y="140" textAnchor="middle" fill="#374151" fontSize="10.5" fontWeight="600">knowledge</text>
        <text x="260" y="155" textAnchor="middle" fill="#374151" fontSize="10.5" fontWeight="600">construction</text>
        <text x="260" y="172" textAnchor="middle" fill="#374151" fontSize="10" >Prior knowledge</text>
        <text x="260" y="186" textAnchor="middle" fill="#374151" fontSize="10" >matters</text>

        {/* Right-only items */}
        <text x="402" y="120" textAnchor="middle" fill="#5b21b6" fontSize="11">Social interaction</text>
        <text x="402" y="138" textAnchor="middle" fill="#5b21b6" fontSize="11">ZPD &amp; Scaffolding</text>
        <text x="402" y="156" textAnchor="middle" fill="#5b21b6" fontSize="11">More Knowledgeable</text>
        <text x="402" y="171" textAnchor="middle" fill="#5b21b6" fontSize="11">Other (MKO)</text>
        <text x="402" y="189" textAnchor="middle" fill="#5b21b6" fontSize="11">(Vygotsky)</text>
      </svg>
    </div>
  );
}
