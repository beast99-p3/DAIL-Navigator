// components/FilterPanel.tsx — faceted filter sidebar

import { useState, useMemo } from 'react'
import type { FacetValue, FacetsResponse, SearchFilters } from '../types'

interface Props {
  facets: FacetsResponse | null
  filters: SearchFilters
  loading: boolean
  onChange: (update: Partial<SearchFilters>) => void
}

type FacetConfigItem = {
  key: keyof FacetsResponse
  label: string
  filterKey: keyof SearchFilters
}

const FACET_CONFIG: FacetConfigItem[] = [
  { key: 'area_of_application', label: 'Area of Application', filterKey: 'area_of_application' },
  { key: 'issue', label: 'Issues', filterKey: 'issue' },
  { key: 'cause_of_action', label: 'Cause of Action', filterKey: 'cause_of_action' },
  { key: 'jurisdiction_type', label: 'Jurisdiction Type', filterKey: 'jurisdiction_type' },
  { key: 'jurisdiction_name', label: 'Jurisdiction', filterKey: 'jurisdiction_name' },
  { key: 'status_disposition', label: 'Status / Disposition', filterKey: 'status_disposition' },
  { key: 'name_of_algorithm', label: 'Algorithm / Tool', filterKey: 'name_of_algorithm' },
]

function FacetSection({
  label,
  values,
  selected,
  onToggle,
  loading,
}: {
  label: string
  values: FacetValue[]
  selected: string[]
  onToggle: (value: string) => void
  loading: boolean
}) {
  const [expanded, setExpanded] = useState(true)
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)

  const filtered = useMemo(
    () => values.filter(fv => search ? fv.value.toLowerCase().includes(search.toLowerCase()) : true),
    [values, search],
  )
  const visible = showAll ? filtered : filtered.slice(0, 8)
  const id = `facet-${label.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div className="border-b border-slate-100 py-3">
      <button
        type="button"
        className="w-full flex items-center justify-between text-left font-semibold text-xs
          uppercase tracking-wide text-slate-500 hover:text-brand-700
          focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-400 rounded"
        aria-expanded={expanded}
        aria-controls={id}
        onClick={() => setExpanded(e => !e)}
      >
        <span className="flex items-center gap-2">
          {label}
          {selected.length > 0 && (
            <span className="bg-gradient-to-br from-brand-500 to-violet-600 text-white text-xs
              rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-sm">
              {selected.length}
            </span>
          )}
        </span>
        <span className="text-slate-300" aria-hidden>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div id={id} className="mt-2 space-y-1">
          {values.length > 8 && (
            <input
              type="search"
              placeholder={`Filter ${label}…`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label={`Filter ${label} options`}
              className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded focus:outline-none
                focus:ring-1 focus:ring-brand-400 placeholder:text-slate-400"
            />
          )}
          {loading && <div className="text-xs text-slate-400 py-1">Updating…</div>}
          {!loading && visible.length === 0 && <div className="text-xs text-slate-400 py-1">No options</div>}
          {!loading && visible.map(fv => {
            const checked = selected.includes(fv.value)
            const checkId = `${id}-${fv.value.replace(/\s+/g, '-')}`
            return (
              <label key={fv.value} htmlFor={checkId}
                className={`flex items-center gap-2 cursor-pointer group py-0.5 px-1.5 rounded-lg
                  hover:bg-brand-50 transition-colors duration-100
                  ${checked ? 'bg-brand-50' : ''}`}
              >
                <input
                  id={checkId}
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(fv.value)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600
                    focus:ring-brand-400 focus:ring-offset-0"
                />
                <span className={`flex-1 text-xs leading-tight
                  ${
                    checked
                      ? 'font-semibold text-brand-700'
                      : 'text-slate-600 group-hover:text-brand-700'
                  }`}>
                  {fv.value}
                </span>
                <span className={`text-xs tabular-nums rounded-full px-1.5 py-0.5
                  ${
                    checked
                      ? 'bg-brand-100 text-brand-700 font-medium'
                      : 'text-slate-400'
                  }`}>
                  {fv.count}
                </span>
              </label>
            )
          })}
          {!loading && filtered.length > 8 && (
            <button
              type="button"
              onClick={() => setShowAll(s => !s)}
              className="text-xs text-brand-600 hover:underline mt-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 rounded"
            >
              {showAll ? 'Show fewer' : `Show all ${filtered.length}`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function DateRangeSection({
  label,
  fromValue,
  toValue,
  onFromChange,
  onToChange,
}: {
  label: string
  fromValue: string
  toValue: string
  onFromChange: (v: string) => void
  onToChange: (v: string) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const hasValue = !!fromValue || !!toValue
  const id = `date-${label.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div className="border-b border-slate-100 py-3">
      <button
        type="button"
        className="w-full flex items-center justify-between text-left font-semibold text-sm text-slate-700
          hover:text-brand-700 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 rounded"
        aria-expanded={expanded}
        aria-controls={id}
        onClick={() => setExpanded(e => !e)}
      >
        <span className="flex items-center gap-1.5">
          {label}
          {hasValue && (
            <span className="bg-brand-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">✓</span>
          )}
        </span>
        <span className="text-slate-400 text-xs" aria-hidden>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div id={id} className="mt-2 space-y-2">
          <div>
            <label className="text-xs text-slate-500 block mb-0.5">From</label>
            <input
              type="date"
              value={fromValue}
              onChange={e => onFromChange(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 focus:outline-none
                focus:ring-1 focus:ring-brand-400 text-slate-700"
              aria-label={`${label} from`}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-0.5">To</label>
            <input
              type="date"
              value={toValue}
              onChange={e => onToChange(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 focus:outline-none
                focus:ring-1 focus:ring-brand-400 text-slate-700"
              aria-label={`${label} to`}
            />
          </div>
          {hasValue && (
            <button
              type="button"
              onClick={() => { onFromChange(''); onToChange('') }}
              className="text-xs text-red-500 hover:underline focus:outline-none"
            >
              Clear dates
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function FilterPanel({ facets, filters, loading, onChange }: Props) {
  function toggleValue(filterKey: keyof SearchFilters, value: string) {
    const current = filters[filterKey] as string[]
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    onChange({ [filterKey]: next, page: 1 })
  }

  const hasFilters =
    filters.area_of_application.length > 0 ||
    filters.issue.length > 0 ||
    filters.cause_of_action.length > 0 ||
    filters.name_of_algorithm.length > 0 ||
    filters.jurisdiction_type.length > 0 ||
    filters.jurisdiction_name.length > 0 ||
    filters.status_disposition.length > 0 ||
    !!filters.class_action ||
    !!filters.published_opinions

  return (
    <aside aria-label="Filter results" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-xs text-slate-400 uppercase tracking-widest">
          🔍 Filters
        </h2>
        {hasFilters && (
          <button
            type="button"
            onClick={() =>
              onChange({
                area_of_application: [], issue: [], cause_of_action: [],
                name_of_algorithm: [], jurisdiction_type: [], jurisdiction_name: [],
                status_disposition: [], class_action: '', published_opinions: '', page: 1,
              })
            }
            className="text-xs font-semibold text-rose-500 hover:text-rose-700
              focus:outline-none focus-visible:ring-1 focus-visible:ring-rose-400 rounded"
            aria-label="Clear all filters"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Boolean filters */}
      <div className="border-b border-slate-100 py-3 space-y-2.5">
        <p className="font-black text-xs text-slate-400 uppercase tracking-widest mb-2">Case Type</p>
        {([
          { label: 'Class Action', key: 'class_action' as const },
          { label: 'Has Published Opinions', key: 'published_opinions' as const },
        ] as const).map(({ label, key }) => (
          <label key={key} className="flex items-center gap-2.5 cursor-pointer group py-0.5 px-1.5
            rounded-lg hover:bg-brand-50 transition-colors duration-100">
            <input
              type="checkbox"
              checked={(filters[key] as string).toLowerCase() === 'yes'}
              onChange={e => onChange({ [key]: e.target.checked ? 'yes' : '', page: 1 })}
              className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
            />
            <span className="text-xs text-slate-600 group-hover:text-brand-700 font-medium">{label}</span>
          </label>
        ))}
      </div>

      {/* Date filed range */}
      <DateRangeSection
        label="Date Filed"
        fromValue={filters.date_from}
        toValue={filters.date_to}
        onFromChange={v => onChange({ date_from: v, page: 1 })}
        onToChange={v => onChange({ date_to: v, page: 1 })}
      />

      {/* Recent activity range */}
      <DateRangeSection
        label="Recent Activity Date"
        fromValue={filters.activity_from}
        toValue={filters.activity_to}
        onFromChange={v => onChange({ activity_from: v, page: 1 })}
        onToChange={v => onChange({ activity_to: v, page: 1 })}
      />

      {/* Faceted filters */}
      {FACET_CONFIG.map(({ key, label, filterKey }) => (
        <FacetSection
          key={key}
          label={label}
          values={facets?.[key] ?? []}
          selected={filters[filterKey] as string[]}
          onToggle={v => toggleValue(filterKey, v)}
          loading={loading}
        />
      ))}
    </aside>
  )
}
