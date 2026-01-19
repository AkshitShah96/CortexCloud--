export function CortexLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="cortex-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14F1D9" />
          <stop offset="100%" stopColor="#0EA5A4" />
        </linearGradient>
      </defs>
      {/* Outer ring */}
      <circle
        cx="20"
        cy="20"
        r="18"
        stroke="url(#cortex-gradient)"
        strokeWidth="2"
        fill="none"
      />
      {/* Brain/neural network pattern */}
      <path
        d="M12 20C12 16 14 13 17 12C19 11 21 11 23 12C26 13 28 16 28 20C28 24 26 27 23 28C21 29 19 29 17 28C14 27 12 24 12 20Z"
        stroke="url(#cortex-gradient)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Center nodes */}
      <circle cx="20" cy="16" r="2" fill="url(#cortex-gradient)" />
      <circle cx="16" cy="22" r="2" fill="url(#cortex-gradient)" />
      <circle cx="24" cy="22" r="2" fill="url(#cortex-gradient)" />
      <circle cx="20" cy="20" r="1.5" fill="url(#cortex-gradient)" />
      {/* Connecting lines */}
      <line x1="20" y1="16" x2="20" y2="18.5" stroke="url(#cortex-gradient)" strokeWidth="1" />
      <line x1="16" y1="22" x2="18.5" y2="20" stroke="url(#cortex-gradient)" strokeWidth="1" />
      <line x1="24" y1="22" x2="21.5" y2="20" stroke="url(#cortex-gradient)" strokeWidth="1" />
    </svg>
  );
}
