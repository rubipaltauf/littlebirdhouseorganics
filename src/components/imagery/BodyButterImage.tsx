/** Whipped Body Butter — glass jar with ivory cream, shea nuts, and a botanical sprig. */
export function BodyButterImage({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 180"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="bbBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#faf4e8" />
          <stop offset="100%" stopColor="#e8d0a0" />
        </linearGradient>
        <radialGradient id="bbGlow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#fff8ec" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#fff8ec" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bbJar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ede6db" />
          <stop offset="35%" stopColor="#fffdf8" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#d4c4a8" />
        </linearGradient>
        <radialGradient id="bbCream" cx="42%" cy="38%" r="58%">
          <stop offset="0%" stopColor="#fffdf5" />
          <stop offset="100%" stopColor="#ead8bc" />
        </radialGradient>
        <linearGradient id="bbLid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4be98" />
          <stop offset="100%" stopColor="#a08060" />
        </linearGradient>
        <radialGradient id="bbVig" cx="50%" cy="50%" r="72%">
          <stop offset="55%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(168,124,60,0.18)" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width="280" height="180" fill="url(#bbBg)" />
      <rect width="280" height="180" fill="url(#bbGlow)" />

      {/* ── Botanical sprig — left ── */}
      <path d="M44 42 C46 62 42 84 44 108 C46 130 42 152 45 170"
        stroke="#6a9a52" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.8" />
      <path d="M44 68 C34 60 26 66 32 78 C38 86 46 78 44 68Z" fill="#78aa5e" opacity="0.85" />
      <path d="M39 67 L41 80" stroke="#4e7a38" strokeWidth="0.9" strokeLinecap="round" opacity="0.6" />
      <path d="M44 92 C54 84 62 90 56 102 C50 110 42 102 44 92Z" fill="#68984e" opacity="0.8" />
      <path d="M49 87 L47 104" stroke="#4e7a38" strokeWidth="0.9" strokeLinecap="round" opacity="0.6" />
      <path d="M44 116 C34 108 26 114 32 126 C38 134 46 126 44 116Z" fill="#78aa5e" opacity="0.7" />

      {/* ── Shea nuts — lower left ── */}
      <ellipse cx="62" cy="148" rx="15" ry="10" fill="#c0946c" transform="rotate(-18 62 148)" />
      <ellipse cx="62" cy="146" rx="10" ry="6" fill="#d4a87c" transform="rotate(-18 62 146)" />
      <path d="M58 140 Q62 138 66 142" stroke="#a07248" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.7" />
      <ellipse cx="46" cy="158" rx="12" ry="8" fill="#b07f54" transform="rotate(14 46 158)" />
      <ellipse cx="46" cy="157" rx="8" ry="5" fill="#c88e62" transform="rotate(14 46 157)" />

      {/* ── Jar body ── */}
      <rect x="90" y="78" width="100" height="78" rx="9" fill="url(#bbJar)" />
      {/* Jar bottom edge */}
      <ellipse cx="140" cy="156" rx="50" ry="9" fill="#c8b090" opacity="0.55" />
      {/* Glass highlight — left edge */}
      <rect x="95" y="82" width="11" height="66" rx="5.5" fill="rgba(255,255,255,0.52)" />
      {/* Glass highlight — right shimmer */}
      <rect x="174" y="88" width="5" height="50" rx="2.5" fill="rgba(255,255,255,0.22)" />

      {/* Cream filling */}
      <ellipse cx="140" cy="80" rx="48" ry="15" fill="url(#bbCream)" />
      {/* Swirl lines on cream */}
      <path d="M118 78 Q129 69 140 78 Q151 87 162 78"
        stroke="#d8c4a4" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.75" />
      <path d="M110 82 Q125 71 140 80 Q155 71 170 82"
        stroke="#cbb898" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.5" />

      {/* Jar lid */}
      <ellipse cx="140" cy="74" rx="52" ry="12" fill="url(#bbLid)" />
      <ellipse cx="140" cy="72" rx="52" ry="10" fill="#c8a878" />
      {/* Lid shine */}
      <ellipse cx="122" cy="70" rx="18" ry="4.5" fill="rgba(255,255,255,0.28)" />
      {/* Lid rim groove */}
      <ellipse cx="140" cy="78" rx="52" ry="5" fill="none" stroke="rgba(140,100,60,0.2)" strokeWidth="1.2" />

      {/* Label area */}
      <rect x="97" y="100" width="86" height="36" rx="4" fill="rgba(255,255,255,0.52)" />
      <rect x="97" y="100" width="86" height="36" rx="4" fill="none" stroke="rgba(150,110,62,0.18)" strokeWidth="0.9" />
      <rect x="107" y="108" width="36" height="2.8" rx="1.4" fill="rgba(110,78,38,0.38)" />
      <rect x="107" y="114" width="56" height="2.2" rx="1.1" fill="rgba(110,78,38,0.22)" />
      <rect x="107" y="119" width="46" height="2.2" rx="1.1" fill="rgba(110,78,38,0.18)" />
      <rect x="107" y="124" width="52" height="2.2" rx="1.1" fill="rgba(110,78,38,0.15)" />

      {/* ── Small botanicals — right ── */}
      <path d="M228 60 C224 48 234 42 238 54 C242 66 230 68 228 60Z"
        fill="#6a9a52" opacity="0.78" />
      <path d="M231 48 L229 64" stroke="#4e7a38" strokeWidth="0.9" strokeLinecap="round" opacity="0.6" />
      <path d="M238 78 C228 70 220 76 226 88 C232 96 240 88 238 78Z"
        fill="#78aa5e" opacity="0.7" />
      {/* Seed / grain accents */}
      <ellipse cx="224" cy="132" rx="4" ry="2.8" fill="#c09060" opacity="0.65" transform="rotate(-30 224 132)" />
      <ellipse cx="234" cy="142" rx="3.5" ry="2.4" fill="#b08050" opacity="0.6" transform="rotate(20 234 142)" />
      <ellipse cx="218" cy="148" rx="3" ry="2" fill="#c89868" opacity="0.55" transform="rotate(-10 218 148)" />

      {/* Soft product shadow */}
      <ellipse cx="140" cy="162" rx="58" ry="8" fill="rgba(80,50,18,0.1)" />

      {/* Vignette overlay */}
      <rect width="280" height="180" fill="url(#bbVig)" />
    </svg>
  );
}
