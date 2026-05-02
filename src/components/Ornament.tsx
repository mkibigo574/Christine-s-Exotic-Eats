type Props = { className?: string; label?: string };

export function Ornament({ className = "", label }: Props) {
  return (
    <div className={`ornament-rule ${className}`} role="presentation">
      <Flourish />
      {label ? (
        <span className="text-overline whitespace-nowrap">{label}</span>
      ) : null}
      <Flourish flip />
    </div>
  );
}

export function Flourish({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      width="44"
      height="14"
      viewBox="0 0 44 14"
      fill="none"
      aria-hidden
      className={flip ? "scale-x-[-1]" : ""}
    >
      <path
        d="M2 7C8 7 10 2 16 2C22 2 24 7 30 7C36 7 38 4 42 4"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle cx="22" cy="7" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function Mark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 14"
      width="60"
      height="14"
      aria-hidden
      className={className}
    >
      <path
        d="M2 7C10 7 14 2 22 2"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M58 7C50 7 46 12 38 12"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="30" cy="7" r="2" fill="currentColor" />
      <circle cx="30" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="0.7" />
    </svg>
  );
}
