// types/index.ts — shared TypeScript interfaces mirroring the API models

export interface DocketLink {
  docket_id: number
  court: string | null
  docket_number: string | null
  link: string | null
}

export interface CaseSummary {
  record_number: string
  caption: string | null
  brief_description: string | null
  jurisdiction_type: string | null
  jurisdiction_name: string | null
  status_disposition: string | null
  date_filed: string | null
  most_recent_activity_date: string | null
  last_update_date: string | null
  class_action: string | null
  published_opinions_binary: string | null
  area_of_application_list: string | null
  issue_list: string | null
  cause_of_action_list: string | null
}

export interface CaseDetail {
  record_number: string
  caption: string | null
  brief_description: string | null
  organizations_involved: string | null
  keyword: string | null
  summary_of_significance: string | null
  summary_facts_activity_to_date: string | null
  most_recent_activity: string | null
  area_of_application_list: string | null
  issue_list: string | null
  cause_of_action_list: string | null
  name_of_algorithm_list: string | null
  jurisdiction_type: string | null
  jurisdiction_name: string | null
  status_disposition: string | null
  class_action: string | null
  published_opinions_binary: string | null
  date_filed: string | null
  most_recent_activity_date: string | null
  last_update_date: string | null
  researcher: string | null
  progress_notes: string | null
  dockets: DocketLink[]
}

export interface SearchResponse {
  total: number
  page: number
  per_page: number
  results: CaseSummary[]
}

export interface FacetValue {
  value: string
  count: number
}

export interface FacetsResponse {
  area_of_application: FacetValue[]
  issue: FacetValue[]
  cause_of_action: FacetValue[]
  jurisdiction_type: FacetValue[]
  jurisdiction_name: FacetValue[]
  status_disposition: FacetValue[]
  name_of_algorithm: FacetValue[]
}

export type SortOption = 'recent_activity' | 'last_updated' | 'newest_filed' | 'caption_asc'

export interface SearchFilters {
  q: string
  area_of_application: string[]
  issue: string[]
  cause_of_action: string[]
  name_of_algorithm: string[]
  jurisdiction_type: string[]
  jurisdiction_name: string[]
  status_disposition: string[]
  class_action: string
  published_opinions: string
  date_from: string   // YYYY-MM-DD filed date range start
  date_to: string     // YYYY-MM-DD filed date range end
  activity_from: string // most_recent_activity_date range start
  activity_to: string   // most_recent_activity_date range end
  sort: SortOption
  page: number
  per_page: number
}

export interface SiteStats {
  total_cases: number
  total_dockets: number
  jurisdictions: number
  last_updated: string | null
  class_actions: number
  published_opinions: number
}
