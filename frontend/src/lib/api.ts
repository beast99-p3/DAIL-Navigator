// lib/api.ts — typed API client

import type { CaseDetail, FacetsResponse, SearchFilters, SearchResponse, SiteStats } from '../types'

const BASE = '/api'

function filtersToParams(filters: Partial<SearchFilters>): URLSearchParams {
  const p = new URLSearchParams()
  if (filters.q) p.set('q', filters.q)
  ;(['area_of_application', 'issue', 'cause_of_action', 'name_of_algorithm',
     'jurisdiction_type', 'jurisdiction_name', 'status_disposition'] as const).forEach(key => {
    const vals = (filters[key] as string[] | undefined) ?? []
    vals.forEach(v => p.append(key, v))
  })
  if (filters.class_action) p.set('class_action', filters.class_action)
  if (filters.published_opinions) p.set('published_opinions', filters.published_opinions)
  if (filters.date_from) p.set('date_from', filters.date_from)
  if (filters.date_to) p.set('date_to', filters.date_to)
  if (filters.activity_from) p.set('activity_from', filters.activity_from)
  if (filters.activity_to) p.set('activity_to', filters.activity_to)
  if (filters.sort) p.set('sort', filters.sort)
  if (filters.page) p.set('page', String(filters.page))
  return p
}

export async function fetchCases(
  filters: Partial<SearchFilters>,
  perPage = 20,
): Promise<SearchResponse> {
  const params = filtersToParams(filters)
  params.set('per_page', String(perPage))
  const res = await fetch(`${BASE}/cases?${params}`)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export async function fetchFacets(filters: Partial<SearchFilters>): Promise<FacetsResponse> {
  const params = filtersToParams(filters)
  const res = await fetch(`${BASE}/facets?${params}`)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export async function fetchCase(recordNumber: string): Promise<CaseDetail> {
  const res = await fetch(`${BASE}/case/${encodeURIComponent(recordNumber)}`)
  if (res.status === 404) throw new Error('not_found')
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export async function fetchStats(): Promise<SiteStats> {
  const res = await fetch(`${BASE}/stats`)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}
