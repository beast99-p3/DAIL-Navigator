// pages/SearchPage.tsx — faceted case search

import { useEffect, useState, useCallback } from 'react'
import { fetchCases, fetchFacets } from '../lib/api'
import { useSearchState } from '../hooks/useSearchState'
import type { FacetsResponse, SearchFilters, SearchResponse } from '../types'
import SearchBar from '../components/SearchBar'
import FilterPanel from '../components/FilterPanel'
import FilterChips from '../components/FilterChips'
import CaseCard from '../components/CaseCard'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

const SORT_OPTIONS = [
  { value: 'recent_activity', label: 'Most Recent Activity' },
  { value: 'last_updated', label: 'Most Recently Updated' },
  { value: 'newest_filed', label: 'Newest Filed' },
  { value: 'caption_asc', label: 'Caption A → Z' },
] as const

const PER_PAGE_OPTIONS = [10, 20, 50]

// Quick-preset chips applied on top of current search
const QUICK_FILTERS: { label: string; emoji: string; filter: Partial<SearchFilters> }[] = [
  { label: 'Class Actions', emoji: '⚖️', filter: { class_action: 'yes' } },
  { label: 'Published Opinions', emoji: '📄', filter: { published_opinions: 'yes' } },
  { label: 'Federal Cases', emoji: '🏛️', filter: { jurisdiction_type: ['Federal'] } },
  { label: 'Employment', emoji: '💼', filter: { area_of_application: ['Employment'] } },
  { label: 'Criminal Justice', emoji: '🔒', filter: { area_of_application: ['Criminal Justice'] } },
  { label: 'Healthcare', emoji: '🏥', filter: { area_of_application: ['Healthcare'] } },
]

export default function SearchPage() {
  const { filters, setFilters, resetFilters } = useSearchState()

  const [results, setResults] = useState<SearchResponse | null>(null)
  const [facets, setFacets] = useState<FacetsResponse | null>(null)
  const [loadingResults, setLoadingResults] = useState(false)
  const [loadingFacets, setLoadingFacets] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const load = useCallback(async () => {
    setLoadingResults(true)
    setLoadingFacets(true)
    setError(null)
    try {
      const [res, fac] = await Promise.all([
        fetchCases(filters, filters.per_page || 20),
        fetchFacets(filters),
      ])
      setResults(res)
      setFacets(fac)
    } catch {
      setError('Failed to load results. Is the backend running?')
    } finally {
      setLoadingResults(false)
      setLoadingFacets(false)
    }
  }, [JSON.stringify(filters)])  // eslint-disable-line

  useEffect(() => {
    load()
  }, [load])

  function applyQuickFilter(qf: Partial<SearchFilters>) {
    // Toggle: if already active, remove it
    const isActive = Object.entries(qf).every(([k, v]) => {
      const cur = filters[k as keyof SearchFilters]
      if (Array.isArray(v)) return Array.isArray(cur) && v.every((x: string) => (cur as string[]).includes(x))
      return cur === v
    })
    if (isActive) {
      const clear: Partial<SearchFilters> = {}
      Object.keys(qf).forEach(k => {
        const key = k as keyof SearchFilters
        if (Array.isArray(qf[key])) (clear as Record<string, unknown>)[key] = []
        else (clear as Record<string, unknown>)[key] = ''
      })
      setFilters({ ...clear, page: 1 })
    } else {
      setFilters({ ...qf, page: 1 })
    }
  }

  function isQuickActive(qf: Partial<SearchFilters>) {
    return Object.entries(qf).every(([k, v]) => {
      const cur = filters[k as keyof SearchFilters]
      if (Array.isArray(v)) return Array.isArray(cur) && v.every((x: string) => (cur as string[]).includes(x))
      return cur === v
    })
  }

  const perPage = filters.per_page || 20

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* ── Top search bar ── */}
      <div className="mb-4 space-y-3">
        <SearchBar
          defaultValue={filters.q}
          onSearch={q => setFilters({ q, page: 1 })}
          placeholder="Search cases, parties, algorithms, issues…"
        />

        {/* Quick-filter presets */}
        <div className="flex flex-wrap gap-2 items-center" role="group" aria-label="Quick filters">
          <span className="text-xs text-slate-400 font-semibold tracking-wide">Quick:</span>
          {QUICK_FILTERS.map(qf => {
            const active = isQuickActive(qf.filter)
            return (
              <button
                key={qf.label}
                type="button"
                onClick={() => applyQuickFilter(qf.filter)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border
                  font-semibold transition-all duration-150
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400
                  active:scale-95
                  ${
                    active
                      ? 'bg-gradient-to-r from-brand-600 to-violet-600 text-white border-transparent shadow-sm shadow-brand-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50'
                  }`}
              >
                <span aria-hidden>{qf.emoji}</span>
                {qf.label}
              </button>
            )
          })}
        </div>

        {/* Active chips + controls row */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <FilterChips filters={filters} onChange={setFilters} />

          <div className="flex items-center gap-3 shrink-0 ml-auto">
            {/* Mobile filter toggle */}
            <button
              type="button"
              className="sm:hidden flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200
                px-3 py-1.5 rounded-lg hover:bg-slate-50 focus:outline-none focus-visible:ring-2
                focus-visible:ring-brand-500"
              onClick={() => setFiltersOpen(o => !o)}
              aria-expanded={filtersOpen}
              aria-controls="filter-panel"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Filters
            </button>

            {/* Per page */}
            <div className="flex items-center gap-2">
              <label htmlFor="per-page-select" className="text-sm text-slate-500 whitespace-nowrap">Show:</label>
              <select
                id="per-page-select"
                value={perPage}
                onChange={e => setFilters({ per_page: Number(e.target.value), page: 1 })}
                className="text-sm border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-700
                  focus:outline-none focus:ring-2 focus:ring-brand-500"
                aria-label="Results per page"
              >
                {PER_PAGE_OPTIONS.map(n => (
                  <option key={n} value={n}>{n} per page</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-sm text-slate-500 whitespace-nowrap">Sort:</label>
              <select
                id="sort-select"
                value={filters.sort}
                onChange={e => setFilters({ sort: e.target.value as typeof filters.sort, page: 1 })}
                className="text-sm border border-slate-200 rounded px-2 py-1.5 bg-white text-slate-700
                  focus:outline-none focus:ring-2 focus:ring-brand-500"
                aria-label="Sort results"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Result count */}
        {!loadingResults && results && (
          <p className="text-sm text-slate-500" role="status" aria-live="polite">
            {results.total === 0
              ? 'No results'
              : `${results.total.toLocaleString()} case${results.total === 1 ? '' : 's'} found`}
            {filters.q ? ` for "${filters.q}"` : ''}
          </p>
        )}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2 border border-red-200" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* ── Two-column layout ── */}
      <div className="flex gap-6 items-start">
        {/* Sidebar */}
        <div
          id="filter-panel"
          className={`w-64 shrink-0 bg-white rounded-2xl border border-slate-100 p-4
            shadow-sm sticky top-20 self-start
            ${filtersOpen ? 'block' : 'hidden'} sm:block`}
        >
          <FilterPanel
            facets={facets}
            filters={filters}
            loading={loadingFacets}
            onChange={setFilters}
          />
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {loadingResults ? (
            <LoadingSpinner label="Loading cases…" size="lg" />
          ) : results?.total === 0 ? (
            <EmptyState
              title="No cases match your search"
              body="Try different keywords, or clear some filters."
              suggestions={[
                'Check spelling or try broader terms',
                'Remove one or more active filters',
                'Search by party name, issue, or algorithm',
              ]}
              onClear={resetFilters}
            />
          ) : (
            <div className="space-y-4">
              {results?.results.map(cas => (
                <CaseCard key={cas.record_number} cas={cas} highlight={filters.q} />
              ))}
              <Pagination
                page={filters.page}
                perPage={perPage}
                total={results?.total ?? 0}
                onChange={page => setFilters({ page })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

