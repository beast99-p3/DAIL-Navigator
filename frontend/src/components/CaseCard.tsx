// components/CaseCard.tsx — result list item

import { Link, useNavigate } from 'react-router-dom'
import type { CaseSummary } from '../types'
import { parseListField, formatDate, isYes } from '../lib/utils'

interface Props {
  cas: CaseSummary
  highlight?: string
}

function Highlight({ text, query }: { text: string; query?: string }) {
  if (!query || !query.trim()) return <>{text}</>
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 text-slate-900 rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  )
}

export default function CaseCard({ cas, highlight }: Props) {
  const navigate = useNavigate()
  const detailUrl = `/case/${encodeURIComponent(cas.record_number)}`
  const tags = parseListField(cas.area_of_application_list).slice(0, 3)
  const issues = parseListField(cas.issue_list).slice(0, 2)

  return (
    <article
      className="ui-card p-5 cursor-pointer group"
      aria-label={`Case: ${cas.caption ?? cas.record_number}`}
      onClick={() => navigate(detailUrl)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(detailUrl) } }}
      tabIndex={0}
      role="button"
    >
      {/* Caption + View button row */}
      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 className="font-semibold text-slate-900 leading-snug flex-1 group-hover:text-brand-700 transition-colors">
          <Link
            to={detailUrl}
            className="focus:outline-none focus-visible:underline"
            onClick={e => e.stopPropagation()}
          >
            <Highlight text={cas.caption ?? `Record ${cas.record_number}`} query={highlight} />
          </Link>
        </h3>
        <Link
          to={detailUrl}
          onClick={e => e.stopPropagation()}
          aria-label={`View details for ${cas.caption ?? cas.record_number}`}
          className="ui-btn-primary shrink-0 whitespace-nowrap"
        >
          View Details
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Description */}
      {cas.brief_description && (
        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
          <Highlight text={cas.brief_description} query={highlight} />
        </p>
      )}

      {/* Tags row */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {tags.map((t: string) => (
          <span key={t} className="ui-chip">{t}</span>
        ))}
        {issues.map((t: string) => (
          <span key={t} className="ui-chip-slate">{t}</span>
        ))}
      </div>

      {/* Meta grid */}
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-xs text-slate-500">
        {cas.jurisdiction_name && (
          <>
            <dt className="sr-only">Jurisdiction</dt>
            <dd className="flex items-center gap-1 col-span-2 sm:col-span-1">
              <svg className="w-3 h-3 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-6 0H3m2 0h4" />
              </svg>
              <span className="truncate">{cas.jurisdiction_name}{cas.jurisdiction_type ? ` · ${cas.jurisdiction_type}` : ''}</span>
            </dd>
          </>
        )}
        {cas.date_filed && (
          <>
            <dt className="font-medium text-slate-500">Filed</dt>
            <dd className="text-slate-700">{formatDate(cas.date_filed)}</dd>
          </>
        )}
        {cas.most_recent_activity_date && (
          <>
            <dt className="font-medium text-slate-500">Recent activity</dt>
            <dd className="text-slate-700">{formatDate(cas.most_recent_activity_date)}</dd>
          </>
        )}
        {cas.last_update_date && (
          <>
            <dt className="font-medium text-slate-500">Last updated</dt>
            <dd className="text-slate-700">{formatDate(cas.last_update_date)}</dd>
          </>
        )}
      </dl>

      {/* Status + Badges row */}
      <div className="flex flex-wrap gap-2 mt-3 items-center">
        {cas.status_disposition && (
          <span className="ui-chip-sky">
            {cas.status_disposition}
          </span>
        )}
        {isYes(cas.class_action) && (
          <span className="ui-chip-amber">
            ⚖️ Class Action
          </span>
        )}
        {isYes(cas.published_opinions_binary) && (
          <span className="ui-chip-emerald">
            📌 Published Opinion
          </span>
        )}
      </div>
    </article>
  )
}
