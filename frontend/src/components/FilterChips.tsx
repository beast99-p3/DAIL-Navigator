// components/FilterChips.tsx — active filter chips bar

import type { SearchFilters } from '../types'

const MULTI_KEYS: { key: keyof SearchFilters; label: string }[] = [
  { key: 'area_of_application', label: 'App' },
  { key: 'issue', label: 'Issue' },
  { key: 'cause_of_action', label: 'CoA' },
  { key: 'name_of_algorithm', label: 'Algorithm' },
  { key: 'jurisdiction_type', label: 'Jur. Type' },
  { key: 'jurisdiction_name', label: 'Jurisdiction' },
  { key: 'status_disposition', label: 'Status' },
]

interface Props {
  filters: SearchFilters
  onChange: (update: Partial<SearchFilters>) => void
}

export default function FilterChips({ filters, onChange }: Props) {
  const chips: { label: string; onRemove: () => void }[] = []

  MULTI_KEYS.forEach(({ key, label }) => {
    const vals = filters[key] as string[]
    vals.forEach(v => {
      chips.push({
        label: `${label}: ${v}`,
        onRemove: () => onChange({ [key]: vals.filter(x => x !== v), page: 1 }),
      })
    })
  })

  if (filters.class_action) {
    chips.push({ label: 'Class Action', onRemove: () => onChange({ class_action: '', page: 1 }) })
  }
  if (filters.published_opinions) {
    chips.push({ label: 'Published Opinions', onRemove: () => onChange({ published_opinions: '', page: 1 }) })
  }
  if (filters.date_from || filters.date_to) {
    const rangeLabel = filters.date_from && filters.date_to
      ? `Filed: ${filters.date_from} – ${filters.date_to}`
      : filters.date_from
      ? `Filed after: ${filters.date_from}`
      : `Filed before: ${filters.date_to}`
    chips.push({ label: rangeLabel, onRemove: () => onChange({ date_from: '', date_to: '', page: 1 }) })
  }
  if (filters.activity_from || filters.activity_to) {
    const rangeLabel = filters.activity_from && filters.activity_to
      ? `Activity: ${filters.activity_from} – ${filters.activity_to}`
      : filters.activity_from
      ? `Activity after: ${filters.activity_from}`
      : `Activity before: ${filters.activity_to}`
    chips.push({ label: rangeLabel, onRemove: () => onChange({ activity_from: '', activity_to: '', page: 1 }) })
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5 items-center" aria-label="Active filters" role="list">
      {chips.map(chip => (
        <span
          key={chip.label}
          role="listitem"
          className="inline-flex items-center gap-1 bg-brand-600 text-white text-xs font-semibold
            pl-2.5 pr-1.5 py-1 rounded-full shadow-sm shadow-brand-300/30"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`Remove filter: ${chip.label}`}
            className="w-4 h-4 inline-flex items-center justify-center rounded-full
              bg-white/20 hover:bg-white/40 text-white leading-none
              focus:outline-none focus-visible:ring-1 focus-visible:ring-white
              transition-colors duration-100"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  )
}
