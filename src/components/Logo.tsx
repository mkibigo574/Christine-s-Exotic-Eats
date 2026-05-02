export function Logo({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Monogram />
      {!compact && (
        <div className="leading-tight">
          <div className="font-display text-[1.35rem] font-semibold text-[var(--color-wine-dark)] tracking-[-0.01em]">
            Christine&rsquo;s <span className="italic">Exotic Eats</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.32em] text-[var(--color-gold-deep)]">
            Enlighten your tastebuds
          </div>
        </div>
      )}
    </div>
  );
}

export function Monogram({ size = 44 }: { size?: number }) {
  const s = size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 64 64"
      aria-hidden
      className="drop-shadow-sm"
    >
      <defs>
        <radialGradient id="mg-bg" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#7a2230" />
          <stop offset="100%" stopColor="#471018" />
        </radialGradient>
        <linearGradient id="mg-gold" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#d8b774" />
          <stop offset="100%" stopColor="#8a6724" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#mg-bg)" />
      <circle
        cx="32"
        cy="32"
        r="28"
        fill="none"
        stroke="url(#mg-gold)"
        strokeWidth="1"
      />
      <circle
        cx="32"
        cy="32"
        r="24"
        fill="none"
        stroke="url(#mg-gold)"
        strokeWidth="0.6"
        strokeDasharray="1 3"
      />
      <text
        x="50%"
        y="56%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Italiana, Cormorant Garamond, Georgia, serif"
        fontSize="28"
        fill="#f7f1e6"
        letterSpacing="1"
      >
        CE
      </text>
    </svg>
  );
}
