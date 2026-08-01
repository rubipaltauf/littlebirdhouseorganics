/** Botanical Body Oil — tall amber glass dropper bottle with herb sprigs and golden oil. */
export function BodyOilImage({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 180"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="boBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f8ecca" />
          <stop offset="100%" stopColor="#ddb840" />
        </linearGradient>
        <radialGradient id="boGlow" cx="48%" cy="42%" r="52%">
          <stop offset="0%" stopColor="#fff9e0" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#fff9e0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="boGlass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b87818" stopOpacity="0.72" />
          <stop offset="28%" stopColor="#e8b030" stopOpacity="0.52" />
          <stop offset="65%" stopColor="#f0c850" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#a06010" stopOpacity="0.78" />
        </linearGradient>
        <linearGradient id="boOil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8a820" stopOpacity="0.82" />
          <stop offset="60%" stopColor="#c08018" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#905800" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="boVig" cx="50%" cy="50%" r="70%">
          <stop offset="52%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(150,100,10,0.2)" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width="280" height="180" fill="url(#boBg)" />
      <rect width="280" height="180" fill="url(#boGlow)" />

      {/* ── Herb sprig — left (lavender / rosemary style) ── */}
      <path d="M72 10 C70 32 74 54 72 78 C70 102 68 128 70 162"
        stroke="#5a8840" strokeWidth="1.7" strokeLinecap="round" fill="none" opacity="0.82" />
      {/* Pairs of small leaves up the stem */}
      {([28, 44, 60, 76, 92, 110] as number[]).map((y) => (
        <g key={y}>
          <path
            d={`M72 ${y} C62 ${y - 8} 54 ${y - 2} 60 ${y + 10} C66 ${y + 16} 74 ${y + 8} 72 ${y}Z`}
            fill="#72a85a" opacity="0.78"
          />
          <path
            d={`M72 ${y} C82 ${y - 8} 90 ${y - 2} 84 ${y + 10} C78 ${y + 16} 70 ${y + 8} 72 ${y}Z`}
            fill="#62984a" opacity="0.72"
          />
        </g>
      ))}

      {/* ── Dropper bottle ── */}
      {/* Bottle neck */}
      <rect x="122" y="52" width="36" height="16" rx="5" fill="url(#boGlass)" />
      <rect x="122" y="52" width="36" height="16" rx="5" fill="none" stroke="rgba(160,100,10,0.3)" strokeWidth="1" />
      {/* Bottle body */}
      <rect x="108" y="68" width="64" height="96" rx="14" fill="url(#boGlass)" />
      <rect x="108" y="68" width="64" height="96" rx="14" fill="none" stroke="rgba(150,90,10,0.28)" strokeWidth="1.4" />
      {/* Oil fill inside */}
      <rect x="112" y="76" width="56" height="80" rx="10" fill="url(#boOil)" />
      {/* Oil surface shimmer */}
      <ellipse cx="140" cy="77" rx="26" ry="6" fill="rgba(240,210,80,0.4)" />
      {/* Glass highlight — left */}
      <rect x="114" y="72" width="12" height="82" rx="6" fill="rgba(255,255,255,0.32)" />
      {/* Glass shimmer — right edge */}
      <rect x="162" y="80" width="5" height="60" rx="2.5" fill="rgba(255,255,255,0.16)" />

      {/* Dropper bulb */}
      <ellipse cx="140" cy="46" rx="14" ry="10" fill="#b07828" />
      <ellipse cx="140" cy="44" rx="10" ry="7" fill="#c89040" />
      <ellipse cx="135" cy="42" rx="4.5" ry="3" fill="rgba(255,255,255,0.28)" />
      {/* Dropper tip / pipette */}
      <rect x="138" y="26" width="4" height="18" rx="2" fill="#9a6218" />
      <ellipse cx="140" cy="26" rx="2.5" ry="1.8" fill="#7a4c0e" />

      {/* Golden oil droplet from tip */}
      <path d="M144 52 C140 44 136 42 136 48 C136 56 144 58 144 52Z"
        fill="rgba(230,180,40,0.72)" />

      {/* Label */}
      <rect x="114" y="102" width="52" height="34" rx="4" fill="rgba(255,255,255,0.4)" />
      <rect x="114" y="102" width="52" height="34" rx="4" fill="none" stroke="rgba(160,100,20,0.2)" strokeWidth="0.8" />
      <rect x="120" y="110" width="24" height="2.6" rx="1.3" fill="rgba(120,80,20,0.4)" />
      <rect x="120" y="116" width="38" height="2" rx="1" fill="rgba(120,80,20,0.24)" />
      <rect x="120" y="121" width="32" height="2" rx="1" fill="rgba(120,80,20,0.2)" />
      <rect x="120" y="126" width="36" height="2" rx="1" fill="rgba(120,80,20,0.16)" />

      {/* ── Herb sprig — right ── */}
      <path d="M210 8 C212 30 208 54 210 80 C212 104 214 132 212 165"
        stroke="#5a8840" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.75" />
      {([26, 44, 62, 80, 98, 118] as number[]).map((y) => (
        <g key={y}>
          <path
            d={`M210 ${y} C200 ${y - 8} 192 ${y - 2} 198 ${y + 10} C204 ${y + 16} 212 ${y + 8} 210 ${y}Z`}
            fill="#72a85a" opacity="0.72"
          />
          <path
            d={`M210 ${y} C220 ${y - 8} 228 ${y - 2} 222 ${y + 10} C216 ${y + 16} 208 ${y + 8} 210 ${y}Z`}
            fill="#62984a" opacity="0.66"
          />
        </g>
      ))}

      {/* ── Scattered accents ── */}
      {/* Small flower — lower left */}
      <circle cx="86" cy="150" r="7" fill="#f0d830" opacity="0.82" />
      {([0, 51, 102, 153, 204, 255] as number[]).map((deg) => {
        const r = (deg * Math.PI) / 180;
        return (
          <ellipse
            key={deg}
            cx={86 + Math.cos(r) * 12}
            cy={150 + Math.sin(r) * 12}
            rx="4.5"
            ry="2.8"
            fill="#f8f0a0"
            opacity="0.78"
            transform={`rotate(${deg} ${86 + Math.cos(r) * 12} ${150 + Math.sin(r) * 12})`}
          />
        );
      })}
      <circle cx="86" cy="150" r="5" fill="#e8c020" />
      {/* Small oil drops */}
      <path d="M234 138 C230 130 226 128 226 135 C226 142 234 144 234 138Z"
        fill="rgba(200,150,20,0.55)" />
      <path d="M248 150 C244 142 240 140 240 147 C240 154 248 156 248 150Z"
        fill="rgba(190,140,15,0.5)" />
      {/* Seed/grain */}
      <ellipse cx="94" cy="130" rx="3.5" ry="2.4" fill="#c09050" opacity="0.65" transform="rotate(-25 94 130)" />

      {/* Product shadow */}
      <ellipse cx="140" cy="166" rx="40" ry="7" fill="rgba(80,50,10,0.12)" />

      {/* Vignette */}
      <rect width="280" height="180" fill="url(#boVig)" />
    </svg>
  );
}
