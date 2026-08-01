/** Glow Balm — open tin with honey-amber balm, chamomile flowers, and honeycomb accents. */
export function GlowBalmImage({ className }: { className?: string }) {
  const chamomilePetals6 = [0, 60, 120, 180, 240, 300];
  const chamomilePetals8 = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <svg
      viewBox="0 0 280 180"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="gbBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f8e8b0" />
          <stop offset="100%" stopColor="#c88a28" />
        </linearGradient>
        <radialGradient id="gbGlow" cx="50%" cy="42%" r="54%">
          <stop offset="0%" stopColor="#fff8d8" stopOpacity="0.68" />
          <stop offset="100%" stopColor="#fff8d8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="gbBalm" cx="36%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#f8d840" />
          <stop offset="45%" stopColor="#d49018" />
          <stop offset="100%" stopColor="#9a5c00" />
        </radialGradient>
        <linearGradient id="gbTinSide" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8a868" />
          <stop offset="100%" stopColor="#906030" />
        </linearGradient>
        <radialGradient id="gbVig" cx="50%" cy="50%" r="70%">
          <stop offset="52%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(140,90,10,0.22)" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width="280" height="180" fill="url(#gbBg)" />
      <rect width="280" height="180" fill="url(#gbGlow)" />

      {/* ── Chamomile — large, left ── */}
      {chamomilePetals8.map((deg) => {
        const r = (deg * Math.PI) / 180;
        const cx = 68 + Math.cos(r) * 15;
        const cy = 58 + Math.sin(r) * 15;
        return (
          <ellipse
            key={`cL-${deg}`}
            cx={cx} cy={cy}
            rx="6" ry="3.2"
            fill="#faf4a8"
            opacity="0.9"
            transform={`rotate(${deg} ${cx} ${cy})`}
          />
        );
      })}
      <circle cx="68" cy="58" r="9" fill="#e8c018" />
      <circle cx="68" cy="58" r="6" fill="#f0cc28" />
      <circle cx="68" cy="58" r="3" fill="#f8d840" opacity="0.8" />

      {/* ── Chamomile — small, right ── */}
      {chamomilePetals6.map((deg) => {
        const r = (deg * Math.PI) / 180;
        const cx = 222 + Math.cos(r) * 11;
        const cy = 46 + Math.sin(r) * 11;
        return (
          <ellipse
            key={`cR-${deg}`}
            cx={cx} cy={cy}
            rx="4.5" ry="2.4"
            fill="#faf4a8"
            opacity="0.82"
            transform={`rotate(${deg} ${cx} ${cy})`}
          />
        );
      })}
      <circle cx="222" cy="46" r="7" fill="#e8c018" />
      <circle cx="222" cy="46" r="4.5" fill="#f0cc28" />

      {/* ── Scattered petals ── */}
      <ellipse cx="42" cy="130" rx="9" ry="3.5" fill="#faf4a8" opacity="0.7" transform="rotate(-40 42 130)" />
      <ellipse cx="52" cy="146" rx="8" ry="3" fill="#f0e898" opacity="0.65" transform="rotate(25 52 146)" />
      <ellipse cx="244" cy="120" rx="8" ry="3.2" fill="#faf4a8" opacity="0.65" transform="rotate(55 244 120)" />
      <ellipse cx="256" cy="140" rx="7" ry="3" fill="#f0e898" opacity="0.6" transform="rotate(-30 256 140)" />

      {/* ── Botanical leaves — flanking ── */}
      <path d="M34 80 C40 68 56 72 52 86 C48 98 32 94 34 80Z" fill="#7aaa5a" opacity="0.8" />
      <path d="M43 72 L44 94" stroke="#5a8a3a" strokeWidth="0.9" strokeLinecap="round" opacity="0.6" />
      <path d="M248 78 C242 66 226 70 230 84 C234 96 250 92 248 78Z" fill="#6a9a4a" opacity="0.75" />
      <path d="M239 70 L238 92" stroke="#4a7a2a" strokeWidth="0.9" strokeLinecap="round" opacity="0.55" />

      {/* ── Tin body (viewed at a slight angle) ── */}
      {/* Tin side wall */}
      <rect x="74" y="106" width="132" height="22" rx="4" fill="url(#gbTinSide)" />
      {/* Top rim */}
      <ellipse cx="140" cy="106" rx="66" ry="13" fill="#c0a060" />
      {/* Rim highlight */}
      <ellipse cx="116" cy="104" rx="26" ry="5" fill="rgba(255,255,255,0.2)" />
      {/* Bottom edge */}
      <ellipse cx="140" cy="128" rx="66" ry="10" fill="#846030" opacity="0.7" />

      {/* ── Balm surface (inside open tin) ── */}
      <ellipse cx="140" cy="106" rx="58" ry="11" fill="url(#gbBalm)" />
      {/* Balm sheen */}
      <ellipse cx="118" cy="103" rx="22" ry="6" fill="rgba(255,240,140,0.42)" />
      <ellipse cx="112" cy="101" rx="12" ry="3.5" fill="rgba(255,255,200,0.38)" />
      {/* Ripple marks */}
      <ellipse cx="140" cy="106" rx="46" ry="8" fill="none" stroke="rgba(200,140,30,0.24)" strokeWidth="1" />
      <ellipse cx="140" cy="106" rx="32" ry="5.5" fill="none" stroke="rgba(200,140,30,0.2)" strokeWidth="0.8" />

      {/* ── Honeycomb cells on tin side ── */}
      {[
        [110, 114], [122, 114], [134, 114], [146, 114], [158, 114], [170, 114],
        [116, 122], [128, 122], [140, 122], [152, 122], [164, 122],
      ].map(([hx, hy]) => (
        <polygon
          key={`${hx}-${hy}`}
          points={`${hx},${hy - 5} ${hx + 5.5},${hy - 2.5} ${hx + 5.5},${hy + 2.5} ${hx},${hy + 5} ${hx - 5.5},${hy + 2.5} ${hx - 5.5},${hy - 2.5}`}
          fill="none"
          stroke="rgba(160,110,40,0.28)"
          strokeWidth="0.7"
        />
      ))}

      {/* ── Honey drips ── */}
      <path d="M90 138 C86 130 82 128 82 135 C82 142 90 144 90 138Z"
        fill="#c4880c" opacity="0.62" />
      <path d="M198 136 C194 128 190 126 190 133 C190 140 198 142 198 136Z"
        fill="#b87c0a" opacity="0.58" />

      {/* Shea nut / seed accents */}
      <ellipse cx="58" cy="154" rx="10" ry="7" fill="#b88a50" opacity="0.7" transform="rotate(-22 58 154)" />
      <ellipse cx="58" cy="153" rx="6.5" ry="4.5" fill="#c89a60" opacity="0.65" transform="rotate(-22 58 153)" />
      <ellipse cx="228" cy="152" rx="9" ry="6.5" fill="#b07840" opacity="0.65" transform="rotate(18 228 152)" />

      {/* Product shadow */}
      <ellipse cx="140" cy="144" rx="72" ry="8" fill="rgba(80,48,8,0.12)" />

      {/* Vignette */}
      <rect width="280" height="180" fill="url(#gbVig)" />
    </svg>
  );
}
