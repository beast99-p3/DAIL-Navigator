// components/EmptyState.tsx

interface Props {
  title?: string
  body?: string
  suggestions?: string[]
  onClear?: () => void
}

export default function EmptyState({
  title = 'No cases found',
  body = 'Try adjusting your search or filters.',
  suggestions,
  onClear,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-5" role="status">
      {/* Illustration */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-100 to-violet-100
          flex items-center justify-center shadow-inner">
          <svg
            className="w-9 h-9 text-brand-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z"
            />
          </svg>
        </div>
        <span className="absolute -top-1 -right-1 text-2xl" aria-hidden>🧐</span>
      </div>

      <div>
        <p className="font-bold text-slate-700 text-xl">{title}</p>
        <p className="text-slate-400 text-sm mt-1.5 max-w-xs">{body}</p>
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="text-sm text-slate-500 bg-slate-50 rounded-xl px-5 py-4 border border-slate-100">
          <p className="font-semibold text-slate-600 mb-2">Suggestions</p>
          <ul className="space-y-1.5 text-left">
            {suggestions.map(s => (
              <li key={s} className="flex items-start gap-2">
                <span className="text-brand-400 mt-0.5" aria-hidden>✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="ui-btn-primary px-6 py-2.5 text-sm"
        >
          Clear all filters
        </button>
      )}
    </div>
  )
}
