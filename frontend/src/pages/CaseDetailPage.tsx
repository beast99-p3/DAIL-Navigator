// pages/CaseDetailPage.tsx

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchCase } from '../lib/api'
import type { CaseDetail } from '../types'
import { parseListField, formatDate, isYes, citationText } from '../lib/utils'
import LoadingSpinner from '../components/LoadingSpinner'

function TagList({ label, raw }: { label: string; raw: string | null }) {
  const items = parseListField(raw)
  if (items.length === 0) return null
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">{label}</dt>
      <dd className="flex flex-wrap gap-1.5">
        {items.map(item => (
          <Link
            key={item}
            to={`/cases?${new URLSearchParams([[label === 'Area of Application' ? 'area_of_application' : label === 'Issues' ? 'issue' : label === 'Cause of Action' ? 'cause_of_action' : 'name_of_algorithm', item]])}`}
            className="inline-block bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full
              hover:bg-brand-100 hover:text-brand-800 transition-colors focus:outline-none
              focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {item}
          </Link>
        ))}
      </dd>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 p-6" aria-labelledby={`sec-${title.replace(/\s/g, '-')}`}>
      <h2 id={`sec-${title.replace(/\s/g, '-')}`} className="font-bold text-slate-800 text-base mb-3 pb-2 border-b border-slate-100">
        {title}
      </h2>
      {children}
    </section>
  )
}

function InfoBox({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</dt>
      <dd className="text-sm text-slate-800 mt-0.5">{value || '—'}</dd>
    </div>
  )
}

export default function CaseDetailPage() {
  const { recordNumber } = useParams<{ recordNumber: string }>()
  const [cas, setCas] = useState<CaseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notesOpen, setNotesOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!recordNumber) return
    setLoading(true)
    fetchCase(recordNumber)
      .then(data => {
        setCas(data)
        setLoading(false)
      })
      .catch(e => {
        if (e.message === 'not_found') setNotFound(true)
        else setError('Failed to load case. Is the backend running?')
        setLoading(false)
      })
  }, [recordNumber])

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-12"><LoadingSpinner label="Loading case…" size="lg" /></div>
  if (notFound) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <p className="text-2xl font-bold text-slate-700">Case not found</p>
      <p className="text-slate-500 mt-2">Record <code className="bg-slate-100 px-1 rounded">{recordNumber}</code> does not exist.</p>
      <Link to="/cases" className="mt-6 inline-block text-brand-600 hover:underline">← Back to search</Link>
    </div>
  )
  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <p className="text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3">{error}</p>
    </div>
  )
  if (!cas) return null

  const pageUrl = window.location.href
  const citation = citationText(cas.record_number, cas.caption, pageUrl)

  function handleCopy() {
    navigator.clipboard.writeText(citation).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Back */}
      <Link to="/cases" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline
        focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded">
        ← Back to results
      </Link>

      {/* ── Header ── */}
      <header className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-1">
              {cas.caption ?? `Case ${cas.record_number}`}
            </h1>
            <p className="text-sm text-slate-500">
              Record #{cas.record_number}
              {cas.researcher ? ` · Researcher: ${cas.researcher}` : ''}
            </p>
          </div>
          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            {isYes(cas.class_action) && (
              <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                Class Action
              </span>
            )}
            {isYes(cas.published_opinions_binary) && (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">
                Published Opinion
              </span>
            )}
          </div>
        </div>

        {/* Key meta */}
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InfoBox label="Jurisdiction Type" value={cas.jurisdiction_type} />
          <InfoBox label="Jurisdiction" value={cas.jurisdiction_name} />
          <InfoBox label="Status" value={cas.status_disposition} />
          <InfoBox label="Date Filed" value={formatDate(cas.date_filed)} />
        </dl>
      </header>

      {/* ── Narrative sections ── */}
      {cas.brief_description && (
        <Section title="Brief Description">
          <p className="text-sm text-slate-700 leading-relaxed">{cas.brief_description}</p>
        </Section>
      )}

      {cas.summary_of_significance && (
        <Section title="Summary of Significance">
          <p className="text-sm text-slate-700 leading-relaxed">{cas.summary_of_significance}</p>
        </Section>
      )}

      {cas.summary_facts_activity_to_date && (
        <Section title="Summary of Facts & Activity to Date">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {cas.summary_facts_activity_to_date}
          </p>
        </Section>
      )}

      {cas.most_recent_activity && (
        <Section title="Most Recent Activity">
          <p className="text-sm text-slate-700 leading-relaxed">{cas.most_recent_activity}</p>
        </Section>
      )}

      {/* ── Tags ── */}
      <Section title="Tags">
        <dl className="space-y-4">
          <TagList label="Area of Application" raw={cas.area_of_application_list} />
          <TagList label="Issues" raw={cas.issue_list} />
          <TagList label="Cause of Action" raw={cas.cause_of_action_list} />
          <TagList label="Algorithm / Tool" raw={cas.name_of_algorithm_list} />
          {cas.keyword && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Keywords</dt>
              <dd className="text-sm text-slate-700">{cas.keyword}</dd>
            </div>
          )}
          {cas.organizations_involved && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Organizations Involved</dt>
              <dd className="text-sm text-slate-700">{cas.organizations_involved}</dd>
            </div>
          )}
        </dl>
      </Section>

      {/* ── Transparency panel ── */}
      <section
        className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4"
        aria-labelledby="transparency-heading"
      >
        <h2 id="transparency-heading" className="font-bold text-blue-900 text-base flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Transparency &amp; Provenance
        </h2>

        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <InfoBox label="Date Filed" value={formatDate(cas.date_filed)} />
          <InfoBox label="Most Recent Activity" value={formatDate(cas.most_recent_activity_date)} />
          <InfoBox label="Last Updated" value={formatDate(cas.last_update_date)} />
          <InfoBox label="Researcher" value={cas.researcher} />
        </dl>

        {cas.progress_notes && (
          <div>
            <button
              type="button"
              onClick={() => setNotesOpen(o => !o)}
              aria-expanded={notesOpen}
              aria-controls="progress-notes"
              className="text-sm font-medium text-blue-800 hover:underline focus:outline-none
                focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              {notesOpen ? '▲ Hide' : '▼ Show'} Progress Notes
            </button>
            {notesOpen && (
              <div
                id="progress-notes"
                className="mt-2 text-sm text-blue-800 bg-white rounded border border-blue-200 p-3 whitespace-pre-line"
              >
                {cas.progress_notes}
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-blue-700 border-t border-blue-200 pt-3">
          This page reflects stored DAIL fields only — no AI enrichment applied. Verify all
          legal information via primary sources.
        </p>
      </section>

      {/* ── Dockets / Sources ── */}
      {cas.dockets.length > 0 && (
        <Section title="Primary Sources">
          <ul className="space-y-2" role="list">
            {cas.dockets.map(d => (
              <li
                key={d.docket_id}
                className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm"
              >
                {d.court && <span className="text-slate-500 text-xs">{d.court}</span>}
                {d.docket_number && (
                  <span className="font-mono text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                    {d.docket_number}
                  </span>
                )}
                {d.link ? (
                  <a
                    href={d.link}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-brand-600 hover:underline break-all focus:outline-none
                      focus-visible:ring-2 focus-visible:ring-brand-500 rounded text-xs"
                    aria-label={`Docket ${d.docket_number ?? d.docket_id} source (opens in new tab)`}
                  >
                    {d.link}
                  </a>
                ) : (
                  <span className="text-slate-400 text-xs">No link</span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ── Cite this record ── */}
      <Section title="Cite This Record">
        <pre className="text-xs bg-slate-50 border border-slate-200 rounded p-3 whitespace-pre-wrap break-words text-slate-700">
          {citation}
        </pre>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy citation to clipboard"
          className="mt-3 flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700
            bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          {copied ? (
            <><svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg> Copied!</>
          ) : (
            <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg> Copy Citation</>
          )}
        </button>
      </Section>
    </div>
  )
}
