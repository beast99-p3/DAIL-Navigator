// hooks/useSearchState.ts — parse and serialise SearchFilters to/from URL query params

import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { SearchFilters, SortOption } from '../types'

const DEFAULT_FILTERS: SearchFilters = {
  q: '',
  area_of_application: [],
  issue: [],
  cause_of_action: [],
  name_of_algorithm: [],
  jurisdiction_type: [],
  jurisdiction_name: [],
  status_disposition: [],
  class_action: '',
  published_opinions: '',
  date_from: '',
  date_to: '',
  activity_from: '',
  activity_to: '',
  sort: 'recent_activity',
  page: 1,
  per_page: 20,
}

const MULTI = [
  'area_of_application', 'issue', 'cause_of_action', 'name_of_algorithm',
  'jurisdiction_type', 'jurisdiction_name', 'status_disposition',
] as const

export function useSearchState() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters: SearchFilters = {
    q: searchParams.get('q') ?? '',
    area_of_application: searchParams.getAll('area_of_application'),
    issue: searchParams.getAll('issue'),
    cause_of_action: searchParams.getAll('cause_of_action'),
    name_of_algorithm: searchParams.getAll('name_of_algorithm'),
    jurisdiction_type: searchParams.getAll('jurisdiction_type'),
    jurisdiction_name: searchParams.getAll('jurisdiction_name'),
    status_disposition: searchParams.getAll('status_disposition'),
    class_action: searchParams.get('class_action') ?? '',
    published_opinions: searchParams.get('published_opinions') ?? '',
    date_from: searchParams.get('date_from') ?? '',
    date_to: searchParams.get('date_to') ?? '',
    activity_from: searchParams.get('activity_from') ?? '',
    activity_to: searchParams.get('activity_to') ?? '',
    sort: (searchParams.get('sort') as SortOption) || 'recent_activity',
    page: parseInt(searchParams.get('page') ?? '1', 10) || 1,
    per_page: parseInt(searchParams.get('per_page') ?? '20', 10) || 20,
  }

  const setFilters = useCallback(
    (update: Partial<SearchFilters>) => {
      const next = { ...filters, ...update }
      const p = new URLSearchParams()
      if (next.q) p.set('q', next.q)
      MULTI.forEach(key => {
        next[key].forEach((v: string) => p.append(key, v))
      })
      if (next.class_action) p.set('class_action', next.class_action)
      if (next.published_opinions) p.set('published_opinions', next.published_opinions)
      if (next.date_from) p.set('date_from', next.date_from)
      if (next.date_to) p.set('date_to', next.date_to)
      if (next.activity_from) p.set('activity_from', next.activity_from)
      if (next.activity_to) p.set('activity_to', next.activity_to)
      if (next.sort !== 'recent_activity') p.set('sort', next.sort)
      if (next.page > 1) p.set('page', String(next.page))
      if (next.per_page !== 20) p.set('per_page', String(next.per_page))
      setSearchParams(p)
    },
    [filters, setSearchParams],
  )

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams())
  }, [setSearchParams])

  return { filters, setFilters, resetFilters, DEFAULT_FILTERS }
}
