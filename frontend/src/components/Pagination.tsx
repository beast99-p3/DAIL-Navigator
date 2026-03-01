// components/Pagination.tsx

interface Props {
  page: number
  perPage: number
  total: number
  onChange: (page: number) => void
}

export default function Pagination({ page, perPage, total, onChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  if (totalPages <= 1) return null

  const pages = buildRange(page, totalPages)

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 mt-10 select-none">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="px-4 py-2 text-sm font-medium rounded-full border border-slate-200 text-slate-600
          hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700
          disabled:opacity-40 disabled:cursor-not-allowed
          focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400
          transition-all duration-150"
      >
        ← Prev
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm text-slate-400">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(Number(p))}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Page ${p}`}
            className={`w-9 h-9 text-sm font-medium rounded-full border transition-all duration-150
              focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400
              ${
                p === page
                  ? 'bg-gradient-to-br from-brand-600 to-violet-600 text-white border-transparent shadow-sm shadow-brand-200'
                  : 'border-slate-200 text-slate-600 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700'
              }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="px-4 py-2 text-sm font-medium rounded-full border border-slate-200 text-slate-600
          hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700
          disabled:opacity-40 disabled:cursor-not-allowed
          focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400
          transition-all duration-150"
      >
        Next →
      </button>
    </nav>
  )
}

function buildRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const delta = 2
  const left = current - delta
  const right = current + delta + 1
  const range: number[] = []
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= left && i < right)) range.push(i)
  }
  const result: (number | '…')[] = []
  let prev: number | null = null
  for (const p of range) {
    if (prev !== null && p - prev > 1) result.push('…')
    result.push(p)
    prev = p
  }
  return result
}
