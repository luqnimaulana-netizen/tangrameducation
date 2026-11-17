import React from 'react';
import { ShapeId } from '../../types/app';

interface InteractiveShapeSvgProps {
  shapeId: ShapeId;
  highlightSides?: boolean;
  highlightVertices?: boolean;
  size?: number;
  className?: string;
}

/**
 * Renders high-precision mathematical SVG illustrations of the 6 Bangun Datar from LKM,
 * with interactive highlighting for Sisi (Sides) and Titik Sudut (Vertices) following
 * Mayer's Signaling & Spatial Contiguity Principles.
 */
export const InteractiveShapeSvg: React.FC<InteractiveShapeSvgProps> = ({
  shapeId,
  highlightSides = true,
  highlightVertices = true,
  size = 200,
  className = '',
}) => {
  const strokeBase = '#1E3A8A';
  const sideHighlightColor = '#10B981'; // Emerald green for active side highlight (matches LKM Slide 5-10)
  const sideSecondaryHighlight = '#F59E0B'; // Warm amber for paired/slanted sides
  const vertexColor = '#F59E0B'; // Yellow/amber vertex dots (matches LKM Slide 5-10)
  const fillSoft = '#EFF6FF';

  const renderShape = () => {
    switch (shapeId) {
      case 'persegi': {
        // Square: (40,40) to (160,160)
        const pts = [
          { x: 40, y: 40, label: 'A' },
          { x: 160, y: 40, label: 'B' },
          { x: 160, y: 160, label: 'C' },
          { x: 40, y: 160, label: 'D' },
        ];
        return (
          <g>
            <rect
              x={40}
              y={40}
              width={120}
              height={120}
              fill={fillSoft}
              stroke={highlightSides ? sideHighlightColor : strokeBase}
              strokeWidth={highlightSides ? 6 : 4}
              rx={2}
            />
            {highlightSides && (
              <>
                {/* Equal side tick marks */}
                <line x1={100} y1={32} x2={100} y2={48} stroke={sideHighlightColor} strokeWidth={3} />
                <line x1={152} y1={100} x2={168} y2={100} stroke={sideHighlightColor} strokeWidth={3} />
                <line x1={100} y1={152} x2={100} y2={168} stroke={sideHighlightColor} strokeWidth={3} />
                <line x1={32} y1={100} x2={48} y2={100} stroke={sideHighlightColor} strokeWidth={3} />
              </>
            )}
            {highlightVertices &&
              pts.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={8}
                    fill={vertexColor}
                    stroke="#FFFFFF"
                    strokeWidth={2.5}
                    className="animate-pulse-glow"
                  />
                </g>
              ))}
          </g>
        );
      }

      case 'persegi_panjang': {
        // Rectangle: (25,55) to (175,145)
        const pts = [
          { x: 25, y: 55 },
          { x: 175, y: 55 },
          { x: 175, y: 145 },
          { x: 25, y: 145 },
        ];
        return (
          <g>
            <rect x={25} y={55} width={150} height={90} fill={fillSoft} stroke="none" />
            {/* Top & Bottom opposite sides */}
            <line
              x1={25}
              y1={55}
              x2={175}
              y2={55}
              stroke={highlightSides ? '#EF4444' : strokeBase}
              strokeWidth={highlightSides ? 6 : 4}
              strokeLinecap="round"
            />
            <line
              x1={25}
              y1={145}
              x2={175}
              y2={145}
              stroke={highlightSides ? '#EF4444' : strokeBase}
              strokeWidth={highlightSides ? 6 : 4}
              strokeLinecap="round"
            />
            {/* Left & Right opposite sides */}
            <line
              x1={25}
              y1={55}
              x2={25}
              y2={145}
              stroke={highlightSides ? sideHighlightColor : strokeBase}
              strokeWidth={highlightSides ? 6 : 4}
              strokeLinecap="round"
            />
            <line
              x1={175}
              y1={55}
              x2={175}
              y2={145}
              stroke={highlightSides ? sideHighlightColor : strokeBase}
              strokeWidth={highlightSides ? 6 : 4}
              strokeLinecap="round"
            />
            {highlightVertices &&
              pts.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={8}
                  fill={vertexColor}
                  stroke="#FFFFFF"
                  strokeWidth={2.5}
                  className="animate-pulse-glow"
                />
              ))}
          </g>
        );
      }

      case 'segitiga': {
        // Triangle: (100,32), (165,158), (35,158)
        const pts = [
          { x: 100, y: 32 },
          { x: 165, y: 158 },
          { x: 35, y: 158 },
        ];
        return (
          <g>
            <polygon
              points="100,32 165,158 35,158"
              fill={fillSoft}
              stroke={highlightSides ? sideHighlightColor : strokeBase}
              strokeWidth={highlightSides ? 6 : 4}
              strokeLinejoin="round"
            />
            {highlightVertices &&
              pts.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={8}
                  fill={vertexColor}
                  stroke="#FFFFFF"
                  strokeWidth={2.5}
                  className="animate-pulse-glow"
                />
              ))}
          </g>
        );
      }

      case 'trapesium': {
        // Isosceles Trapezoid (LKM Slide 8): (62,52), (138,52), (172,150), (28,150)
        const pts = [
          { x: 62, y: 52 },
          { x: 138, y: 52 },
          { x: 172, y: 150 },
          { x: 28, y: 150 },
        ];
        return (
          <g>
            <polygon points="62,52 138,52 172,150 28,150" fill={fillSoft} stroke="none" />
            {/* Parallel top & bottom sides */}
            <line
              x1={62}
              y1={52}
              x2={138}
              y2={52}
              stroke={highlightSides ? '#EF4444' : strokeBase}
              strokeWidth={highlightSides ? 6 : 4}
              strokeLinecap="round"
            />
            <line
              x1={28}
              y1={150}
              x2={172}
              y2={150}
              stroke={highlightSides ? '#EF4444' : strokeBase}
              strokeWidth={highlightSides ? 6 : 4}
              strokeLinecap="round"
            />
            {/* Slanted left & right sides */}
            <line
              x1={62}
              y1={52}
              x2={28}
              y2={150}
              stroke={highlightSides ? sideHighlightColor : strokeBase}
              strokeWidth={highlightSides ? 6 : 4}
              strokeLinecap="round"
            />
            <line
              x1={138}
              y1={52}
              x2={172}
              y2={150}
              stroke={highlightSides ? sideHighlightColor : strokeBase}
              strokeWidth={highlightSides ? 6 : 4}
              strokeLinecap="round"
            />
            {highlightVertices &&
              pts.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={8}
                  fill={vertexColor}
                  stroke="#FFFFFF"
                  strokeWidth={2.5}
                  className="animate-pulse-glow"
                />
              ))}
          </g>
        );
      }

      case 'jajar_genjang': {
        // Parallelogram (LKM Slide 9): (58,52), (172,52), (142,148), (28,148)
        const pts = [
          { x: 58, y: 52 },
          { x: 172, y: 52 },
          { x: 142, y: 148 },
          { x: 28, y: 148 },
        ];
        return (
          <g>
            <polygon points="58,52 172,52 142,148 28,148" fill={fillSoft} stroke="none" />
            {/* Top & Bottom parallel sides */}
            <line
              x1={58}
              y1={52}
              x2={172}
              y2={52}
              stroke={highlightSides ? sideSecondaryHighlight : strokeBase}
              strokeWidth={highlightSides ? 6 : 4}
              strokeLinecap="round"
            />
            <line
              x1={28}
              y1={148}
              x2={142}
              y2={148}
              stroke={highlightSides ? sideSecondaryHighlight : strokeBase}
              strokeWidth={highlightSides ? 6 : 4}
              strokeLinecap="round"
            />
            {/* Slanted parallel sides */}
            <line
              x1={58}
              y1={52}
              x2={28}
              y2={148}
              stroke={highlightSides ? sideHighlightColor : strokeBase}
              strokeWidth={highlightSides ? 6 : 4}
              strokeLinecap="round"
            />
            <line
              x1={172}
              y1={52}
              x2={142}
              y2={148}
              stroke={highlightSides ? sideHighlightColor : strokeBase}
              strokeWidth={highlightSides ? 6 : 4}
              strokeLinecap="round"
            />
            {highlightVertices &&
              pts.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={8}
                  fill={vertexColor}
                  stroke="#FFFFFF"
                  strokeWidth={2.5}
                  className="animate-pulse-glow"
                />
              ))}
          </g>
        );
      }

      case 'belah_ketupat': {
        // Rhombus / Diamond (LKM Slide 10): (100,28), (170,100), (100,172), (30,100)
        const pts = [
          { x: 100, y: 28 },
          { x: 170, y: 100 },
          { x: 100, y: 172 },
          { x: 30, y: 100 },
        ];
        return (
          <g>
            <polygon
              points="100,28 170,100 100,172 30,100"
              fill={fillSoft}
              stroke={highlightSides ? sideHighlightColor : strokeBase}
              strokeWidth={highlightSides ? 6 : 4}
              strokeLinejoin="round"
            />
            {highlightVertices &&
              pts.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={8}
                  fill={vertexColor}
                  stroke="#FFFFFF"
                  strokeWidth={2.5}
                  className="animate-pulse-glow"
                />
              ))}
          </g>
        );
      }
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={`select-none ${className}`}
      role="img"
      aria-label={`Visual bangun datar ${shapeId}`}
    >
      {/* Subtle coordinate background grid */}
      <defs>
        <pattern id={`grid-${shapeId}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="8" y="8" width="184" height="184" rx="16" fill={`url(#grid-${shapeId})`} />
      {renderShape()}
    </svg>
  );
};

/**
 * Renders crisp, authentic illustrations of the 6 Real-World Objects from LKM:
 * - persegi -> Ubin keramik (lantai)
 * - persegi_panjang -> Papan tulis
 * - segitiga -> Atap rumah
 * - trapesium -> Atap rumah Joglo
 * - jajar_genjang -> Kue wajik
 * - belah_ketupat -> Ketupat Lebaran
 */
export const RealWorldObjectSvg: React.FC<{
  shapeId: ShapeId;
  size?: number;
  className?: string;
}> = ({ shapeId, size = 180, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={`select-none ${className}`}
      role="img"
      aria-label={`Contoh benda nyata untuk ${shapeId}`}
    >
      <rect x="6" y="6" width="188" height="188" rx="18" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />

      {shapeId === 'persegi' && (
        /* Ubin Keramik (Lantai) */
        <g>
          <rect x="28" y="28" width="144" height="144" rx="8" fill="#CBD5E1" />
          {/* 2x2 Ceramic tiles with highlighted top-right square tile */}
          <rect x="34" y="34" width="63" height="63" rx="3" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" />
          <rect
            x="103"
            y="34"
            width="63"
            height="63"
            rx="3"
            fill="#DBEAFE"
            stroke="#2563EB"
            strokeWidth="3.5"
          />
          <rect x="34" y="103" width="63" height="63" rx="3" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
          <rect x="103" y="103" width="63" height="63" rx="3" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" />
          {/* Subtle marble shine */}
          <line x1="112" y1="45" x2="128" y2="45" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
          <line x1="45" y1="45" x2="62" y2="45" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {shapeId === 'persegi_panjang' && (
        /* Papan Tulis (Whiteboard) */
        <g>
          {/* Outer Aluminum Frame */}
          <rect
            x="22"
            y="42"
            width="156"
            height="106"
            rx="6"
            fill="#94A3B8"
            stroke="#475569"
            strokeWidth="3"
          />
          {/* White Writing Surface */}
          <rect
            x="30"
            y="50"
            width="140"
            height="90"
            rx="2"
            fill="#FFFFFF"
            stroke="#2563EB"
            strokeWidth="2.5"
          />
          {/* Corner mounts */}
          <circle cx="26" cy="46" r="2.5" fill="#334155" />
          <circle cx="174" cy="46" r="2.5" fill="#334155" />
          <circle cx="26" cy="144" r="2.5" fill="#334155" />
          <circle cx="174" cy="144" r="2.5" fill="#334155" />
          {/* Marker & Eraser on tray */}
          <rect x="65" y="148" width="70" height="6" rx="2" fill="#64748B" />
          <rect x="115" y="122" width="28" height="6" rx="3" transform="rotate(-18 115 122)" fill="#1E293B" />
          <rect x="78" y="138" width="22" height="10" rx="2" fill="#3B82F6" />
          {/* Math writing on board */}
          <text x="45" y="82" fill="#1E3A8A" fontSize="13" fontWeight="700">
            Bangun Datar
          </text>
          <line x1="45" y1="92" x2="110" y2="92" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {shapeId === 'segitiga' && (
        /* Atap Rumah (House Roof) */
        <g>
          {/* Sky backdrop */}
          <rect x="20" y="20" width="160" height="160" rx="12" fill="#E0F2FE" />
          {/* House lower wall */}
          <rect x="48" y="112" width="104" height="58" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
          <rect x="86" y="130" width="28" height="40" rx="3" fill="#92400E" />
          {/* Highlighted Triangular Roof (Gable) */}
          <polygon
            points="100,36 168,114 32,114"
            fill="#FCA5A5"
            stroke="#16A34A"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <polygon points="100,48 152,108 48,108" fill="#B91C1C" opacity="0.85" />
          {/* Roof timber lines */}
          <line x1="100" y1="48" x2="100" y2="108" stroke="#FEE2E2" strokeWidth="2.5" />
        </g>
      )}

      {shapeId === 'trapesium' && (
        /* Atap Rumah Joglo (Trapezoid Roof) */
        <g>
          {/* Sky & Trees backdrop */}
          <rect x="20" y="20" width="160" height="160" rx="12" fill="#E0F2FE" />
          {/* Wooden pillars / base of Joglo */}
          <rect x="44" y="124" width="112" height="44" fill="#FDE68A" stroke="#92400E" strokeWidth="2" />
          <line x1="65" y1="124" x2="65" y2="168" stroke="#78350F" strokeWidth="5" />
          <line x1="100" y1="124" x2="100" y2="168" stroke="#78350F" strokeWidth="5" />
          <line x1="135" y1="124" x2="135" y2="168" stroke="#78350F" strokeWidth="5" />
          {/* Joglo Trapezoid Roof (Highlighted) */}
          <polygon
            points="66,52 134,52 172,124 28,124"
            fill="#9A3412"
            stroke="#2563EB"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          {/* Roof tile texture lines */}
          <line x1="56" y1="76" x2="144" y2="76" stroke="#FDBA74" strokeWidth="2" opacity="0.6" />
          <line x1="44" y1="100" x2="156" y2="100" stroke="#FDBA74" strokeWidth="2" opacity="0.6" />
        </g>
      )}

      {shapeId === 'jajar_genjang' && (
        /* Kue Wajik (Parallelogram Traditional Cake on Leaf Plate) */
        <g>
          {/* Plate */}
          <circle cx="100" cy="104" r="68" fill="#DCFCE7" stroke="#16A34A" strokeWidth="4" />
          <circle cx="100" cy="104" r="54" fill="#BBF7D0" stroke="#22C55E" strokeWidth="1.5" strokeDasharray="4 4" />
          {/* Parallelogram Kue Wajik pieces */}
          <polygon
            points="72,56 142,56 122,98 52,98"
            fill="#92400E"
            stroke="#F59E0B"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <polygon
            points="66,106 136,106 116,148 46,148"
            fill="#78350F"
            stroke="#F59E0B"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Palm sugar texture dots */}
          <circle cx="95" cy="75" r="2.5" fill="#FDE68A" opacity="0.7" />
          <circle cx="112" cy="82" r="2" fill="#FDE68A" opacity="0.7" />
          <circle cx="88" cy="125" r="2.5" fill="#FDE68A" opacity="0.7" />
        </g>
      )}

      {shapeId === 'belah_ketupat' && (
        /* Ketupat Lebaran (Rhombus Woven Pouch) */
        <g>
          {/* Hanging ribbons at top */}
          <path
            d="M 100 34 C 95 16, 108 16, 100 34"
            fill="none"
            stroke="#15803D"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Rhombus Ketupat Body */}
          <polygon
            points="100,34 162,96 100,158 38,96"
            fill="#ECFCCB"
            stroke="#16A34A"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          {/* Woven checkerboard pattern inside */}
          <polygon points="100,50 130,80 100,110 70,80" fill="#4D7C0F" opacity="0.75" />
          <polygon points="100,82 130,112 100,142 70,112" fill="#65A30D" opacity="0.55" />
          <line x1="69" y1="65" x2="131" y2="127" stroke="#15803D" strokeWidth="2.5" />
          <line x1="131" y1="65" x2="69" y2="127" stroke="#15803D" strokeWidth="2.5" />
          {/* Dangling leaf tails */}
          <path d="M 96 156 L 86 182" stroke="#15803D" strokeWidth="4" strokeLinecap="round" />
          <path d="M 104 156 L 114 182" stroke="#65A30D" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
};

/**
 * Friendly Teacher Character SVG (Ibu Guru Pemandu) as depicted in LKM Slide 4 & Slide 14.
 */
export const TeacherCharacterSvg: React.FC<{
  pose?: 'teaching' | 'waving';
  size?: number;
  className?: string;
}> = ({ pose = 'teaching', size = 130, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      className={`select-none ${className}`}
      role="img"
      aria-label="Ilustrasi Ibu Guru Pemandu"
    >
      {/* Background circle */}
      <circle cx="80" cy="84" r="64" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="3" />
      {/* Hijab / Hair silhouette */}
      <path d="M 48 64 C 48 34, 112 34, 112 64 L 118 110 C 118 116, 42 116, 42 110 Z" fill="#1E3A8A" />
      {/* Face */}
      <circle cx="80" cy="66" r="22" fill="#FDE68A" />
      {/* Friendly Eyes & Smile */}
      <circle cx="72" cy="63" r="2.8" fill="#0F172A" />
      <circle cx="88" cy="63" r="2.8" fill="#0F172A" />
      <path d="M 72 73 Q 80 80 88 73" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
      {/* Glasses */}
      <circle cx="72" cy="63" r="6.5" fill="none" stroke="#475569" strokeWidth="1.6" />
      <circle cx="88" cy="63" r="6.5" fill="none" stroke="#475569" strokeWidth="1.6" />
      <line x1="78.5" y1="63" x2="81.5" y2="63" stroke="#475569" strokeWidth="1.6" />
      {/* Teacher Blazer / Outfit */}
      <path d="M 44 142 C 46 106, 114 106, 116 142 Z" fill="#2563EB" />
      <polygon points="80,106 68,128 92,128" fill="#FFFFFF" />
      {pose === 'teaching' ? (
        /* Teaching pointer stick */
        <g>
          <line x1="108" y1="114" x2="144" y2="64" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
          <circle cx="144" cy="64" r="4" fill="#F59E0B" />
          <circle cx="110" cy="112" r="7" fill="#FDE68A" />
        </g>
      ) : (
        /* Waving hand */
        <g>
          <path d="M 110 118 Q 132 95 130 76" fill="none" stroke="#2563EB" strokeWidth="10" strokeLinecap="round" />
          <circle cx="130" cy="72" r="8" fill="#FDE68A" />
        </g>
      )}
    </svg>
  );
};
