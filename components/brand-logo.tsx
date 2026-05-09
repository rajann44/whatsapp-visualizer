export function BrandLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="brand-logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0a6c66" />
          <stop offset="100%" stopColor="#16a08c" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#brand-logo-bg)" />
      <path d="M19 22c0-4.4 3.6-8 8-8h10c4.4 0 8 3.6 8 8v8c0 4.4-3.6 8-8 8H31l-7 6v-6h-1c-2.2 0-4-1.8-4-4V22z" fill="#ffffff" fillOpacity="0.94" />
      <rect x="27" y="24" width="3" height="8" rx="1" fill="#0a6c66" />
      <rect x="32" y="21" width="3" height="11" rx="1" fill="#0a6c66" />
      <rect x="37" y="26" width="3" height="6" rx="1" fill="#0a6c66" />
    </svg>
  );
}
