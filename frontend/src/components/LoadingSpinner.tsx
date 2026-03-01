// components/LoadingSpinner.tsx

interface Props {
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function LoadingSpinner({ label = 'Loading…', size = 'md' }: Props) {
  const dim = size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-12 w-12' : 'h-7 w-7'
  return (
    <div role="status" aria-label={label} className="flex flex-col items-center justify-center gap-3 py-16">
      <div className={`relative ${dim}`}>
        {/* Outer ring */}
        <svg className={`${dim} animate-spin`} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle className="opacity-10" cx="12" cy="12" r="10" stroke="currentColor"
            strokeWidth="3" />
          <path
            d="M12 2a10 10 0 0110 10"
            stroke="url(#spin-grad)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="spin-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span className="sr-only">{label}</span>
      <span className="text-sm font-medium text-slate-400 animate-pulse">{label}</span>
    </div>
  )
}
