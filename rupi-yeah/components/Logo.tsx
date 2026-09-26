/** The Rupi-yeah seal: a ₹ inside a double-ringed stamp, the mark an approver leaves on an entry. */
export function Seal({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="24" r="17.5" stroke="currentColor" strokeWidth="1" strokeDasharray="1.2 2.2" />
      <g stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16.5 15.5h15" />
        <path d="M16.5 20.5h15" />
        <path d="M20 15.5c4.6 0 7 2.1 7 5s-2.4 5-7 5h-2.5l10 9" />
      </g>
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`text-[1.375rem] font-bold tracking-[-0.01em] leading-none ${className}`}>
      Rupi<span className="text-[var(--haldi)]">-</span>yeah
    </span>
  );
}
