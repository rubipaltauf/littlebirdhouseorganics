/** Seasonal Bundle — warm flat-lay of a jar, a dropper bottle, botanicals, and dried petals. */
export function BundleImage({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 180"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="buBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f6eedd" />
          <stop offset="100%" stopColor="#e2cfa8" />
        </linearGradient>
        <radialGradient id="buGlow" cx="50%" cy="44%" r="56%">
          <stop offset="0%" stopColor="#fff8ee" stopOpacity="0.62" />
          <stop offset="100%" stopColor="#fff8ee" stopOpacity="0" />
        </radialGradient>
        {/* Mini jar */}
        <linearGradient id="buJar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#eee6d8" />
          <stop offset="38%" stopColor="#fffdf8" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#d8c8a8" />
        </linearGradient>
        <radialGradient id="buCream" cx="40%" cy="36%" r="58%">
          <stop offset="0%" stopColor="#fffdf5" />
          <stop offset="100%" stopColor="#ead8bc" />
        </radialGradient>
        <linearGradient id="buLid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d0ba94" />
          <stop offset="100%" stopColor="#9e7c58" />
        </linearGradient>
        {/* Mini bottle */}
        <linearGradient id="buBottle" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b07018" stopOpacity="0.74" />
          <stop offset="40%" stopColor="#e0a830" stopOpacity="0.54" />
          <stop offset="100%" stopColor="#985e10" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="buOil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e4a418" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#8c5400" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="buVig" cx="50%" cy="50%" r="70%">
          <stop offset="54%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(148,108,48,0.2)" />
        </radialGradient>
      </defs>

      {/* Background — linen feel */}
      <rect width="280" height="180" fill="url(#buBg)" />
      {/* Subtle linen texture */}
      {([18, 36, 54, 72, 90, 108, 126, 144, 162] as number[]).map((y) => (
        <line key={y} x1="0" y1={y} x2="280" y2={y}
          stroke="rgba(180,154,110,0.07)" strokeWidth="1" />
      ))}
      <rect width="280" height="180" fill="url(#buGlow)" />

      {/* ── Background botanical leaves ── */}
      <path d="M16 22 C22 10 40 16 36 32 C32 46 14 40 16 22Z" fill="#78a85a" opacity="0.6" />
      <path d="M25 14 L27 38" stroke="#5a8840" strokeWidth="0.9" strokeLinecap="round" opacity="0.5" />
      <path d="M252 16 C258 4 276 10 272 26 C268 40 250 34 252 16Z" fill="#68984a" opacity="0.56" />
      <path d="M261 8 L263 32" stroke="#4a7830" strokeWidth="0.9" strokeLinecap="round" opacity="0.45" />
      <path d="M244 140 C250 128 268 134 264 150 C260 164 242 158 244 140Z" fill="#78a85a" opacity="0.55" />
      <path d="M18 146 C24 134 42 140 38 156 C34 170 16 164 18 146Z" fill="#68984a" opacity="0.52" />

      {/* ── Shea nuts scattered ── */}
      <ellipse cx="38" cy="136" rx="11" ry="7.5" fill="#c0946c" opacity="0.72" transform="rotate(-24 38 136)" />
      <ellipse cx="38" cy="135" rx="7.5" ry="5" fill="#d4a87c" opacity="0.68" transform="rotate(-24 38 135)" />
      <ellipse cx="250" cy="140" rx="10" ry="7" fill="#b87c4e" opacity="0.68" transform="rotate(20 250 140)" />
      <ellipse cx="260" cy="152" rx="9" ry="6" fill="#c08858" opacity="0.62" transform="rotate(-12 260 152)" />

      {/* ── Rose petals scattered ── */}
      <path d="M54 28 C48 20 44 24 48 32 C52 38 60 34 54 28Z" fill="#d89090" opacity="0.68" />
      <path d="M42 40 C36 32 32 36 36 44 C40 50 48 46 42 40Z" fill="#e0a0a0" opacity="0.62" />
      <path d="M236 30 C230 22 226 26 230 34 C234 40 242 36 236 30Z" fill="#d89090" opacity="0.65" />
      <path d="M248 50 C242 42 238 46 242 54 C246 60 254 56 248 50Z" fill="#c88888" opacity="0.58" />
      <path d="M64 160 C58 152 54 156 58 164 C62 170 70 166 64 160Z" fill="#d89090" opacity="0.6" />
      <path d="M220 158 C214 150 210 154 214 162 C218 168 226 164 220 158Z" fill="#e0a0a0" opacity="0.55" />

      {/* ── Small chamomile flowers ── */}
      {([0, 51, 102, 153, 204, 255] as number[]).map((deg) => {
        const r = (deg * Math.PI) / 180;
        const cx = 52 + Math.cos(r) * 10;
        const cy = 152 + Math.sin(r) * 10;
        return (
          <ellipse key={`c1-${deg}`} cx={cx} cy={cy} rx="4" ry="2.2"
            fill="#faf4a8" opacity="0.78"
            transform={`rotate(${deg} ${cx} ${cy})`} />
        );
      })}
      <circle cx="52" cy="152" r="5.5" fill="#e8c018" /><circle cx="52" cy="152" r="3" fill="#f0cc28" />

      {([0, 60, 120, 180, 240, 300] as number[]).map((deg) => {
        const r = (deg * Math.PI) / 180;
        const cx = 234 + Math.cos(r) * 9;
        const cy = 36 + Math.sin(r) * 9;
        return (
          <ellipse key={`c2-${deg}`} cx={cx} cy={cy} rx="3.5" ry="2"
            fill="#faf4a8" opacity="0.72"
            transform={`rotate(${deg} ${cx} ${cy})`} />
        );
      })}
      <circle cx="234" cy="36" r="5" fill="#e8c018" /><circle cx="234" cy="36" r="3" fill="#f0cc28" />

      {/* ── Mini Jar (body butter) ── */}
      <rect x="72" y="52" width="84" height="84" rx="8" fill="url(#buJar)" />
      <ellipse cx="114" cy="136" rx="42" ry="8" fill="#c0a880" opacity="0.5" />
      {/* Glass highlight */}
      <rect x="77" y="57" width="10" height="72" rx="5" fill="rgba(255,255,255,0.5)" />
      {/* Cream top */}
      <ellipse cx="114" cy="54" rx="40" ry="11" fill="url(#buCream)" />
      <path d="M102 53 Q108 47 114 53 Q120 59 126 53" stroke="#d8c4a4" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* Lid */}
      <ellipse cx="114" cy="50" rx="44" ry="10" fill="url(#buLid)" />
      <ellipse cx="114" cy="48" rx="44" ry="8.5" fill="#c8a878" />
      <ellipse cx="100" cy="47" rx="15" ry="4" fill="rgba(255,255,255,0.26)" />
      {/* Label */}
      <rect x="79" y="76" width="70" height="30" rx="3" fill="rgba(255,255,255,0.5)" />
      <rect x="85" y="83" width="30" height="2.5" rx="1.25" fill="rgba(110,78,38,0.36)" />
      <rect x="85" y="89" width="48" height="2" rx="1" fill="rgba(110,78,38,0.22)" />
      <rect x="85" y="94" width="40" height="2" rx="1" fill="rgba(110,78,38,0.18)" />

      {/* ── Mini Bottle (body oil) ── */}
      {/* Neck */}
      <rect x="146" y="40" width="28" height="14" rx="4" fill="url(#buBottle)" />
      {/* Body */}
      <rect x="134" y="54" width="52" height="90" rx="12" fill="url(#buBottle)" />
      <rect x="134" y="54" width="52" height="90" rx="12" fill="none" stroke="rgba(150,90,10,0.24)" strokeWidth="1.2" />
      {/* Oil fill */}
      <rect x="138" y="62" width="44" height="74" rx="8" fill="url(#buOil)" />
      {/* Glass highlight */}
      <rect x="140" y="58" width="10" height="78" rx="5" fill="rgba(255,255,255,0.28)" />
      {/* Oil sheen */}
      <ellipse cx="160" cy="63" rx="18" ry="5" fill="rgba(240,200,70,0.38)" />
      {/* Dropper bulb */}
      <ellipse cx="160" cy="35" rx="12" ry="9" fill="#b07828" />
      <ellipse cx="160" cy="33" rx="8.5" ry="6.5" fill="#c89040" />
      <rect x="158" y="22" width="4" height="14" rx="2" fill="#9a6218" />
      {/* Label */}
      <rect x="140" y="90" width="40" height="28" rx="3" fill="rgba(255,255,255,0.38)" />
      <rect x="146" y="97" width="20" height="2.5" rx="1.25" fill="rgba(120,80,20,0.4)" />
      <rect x="146" y="103" width="30" height="2" rx="1" fill="rgba(120,80,20,0.24)" />
      <rect x="146" y="108" width="26" height="2" rx="1" fill="rgba(120,80,20,0.2)" />

      {/* ── Ribbon suggestion (bundle presentation) ── */}
      <path d="M72 148 Q114 142 160 148 Q186 152 186 148" fill="none"
        stroke="rgba(180,140,80,0.38)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Shadows */}
      <ellipse cx="114" cy="142" rx="46" ry="6" fill="rgba(70,44,12,0.1)" />
      <ellipse cx="160" cy="148" rx="34" ry="5.5" fill="rgba(70,44,12,0.1)" />

      {/* Vignette */}
      <rect width="280" height="180" fill="url(#buVig)" />
    </svg>
  );
}
