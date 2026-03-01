// pages/HomePage.tsx

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import { fetchStats } from '../lib/api'
import type { SiteStats } from '../types'

const EXAMPLES = [
  'facial recognition employment',
  'credit scoring discrimination',
  'predictive policing',
  'healthcare algorithm',
  'content moderation',
]

const CATEGORIES = [
  {
    label: 'Area of Application',
    param: 'area_of_application',
    items: ['Employment', 'Healthcare', 'Criminal Justice', 'Education', 'Financial Services', 'Housing'],
    color: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  {
    label: 'Issues',
    param: 'issue',
    items: ['Discrimination / Bias', 'Privacy', 'Transparency', 'Due Process', 'Consumer Protection'],
    color: 'bg-purple-50 text-purple-800 border-purple-200',
  },
  {
    label: 'Cause of Action',
    param: 'cause_of_action',
    items: ['Title VII', 'FCRA', 'FHA', 'ADA', 'Fourth Amendment', 'BIPA'],
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    label: 'Jurisdiction Type',
    param: 'jurisdiction_type',
    items: ['Federal', 'State', 'International'],
    color: 'bg-amber-50 text-amber-800 border-amber-200',
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<SiteStats | null>(null)

  useEffect(() => {
    fetchStats().then(setStats).catch(() => {/* silently skip if backend is offline */})
  }, [])

  function handleSearch(q: string) {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    navigate(`/cases?${params}`)
  }

  function handleCategory(param: string, value: string) {
    const params = new URLSearchParams()
    params.append(param, value)
    navigate(`/cases?${params}`)
  }

  function handleBrowseAll() {
    navigate('/cases')
  }

  return (
    <div>
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden py-24 px-4"
        aria-labelledby="hero-heading"
        style={{
          background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 40%, #7c3aed 70%, #5b21b6 100%)',
        }}
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -left-20 w-96 h-96 rounded-full
          bg-white/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-10 right-10 w-72 h-72 rounded-full
          bg-violet-300/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute top-10 right-1/3 w-40 h-40 rounded-full
          bg-fuchsia-400/20 blur-2xl" aria-hidden />

        <div className="relative max-w-3xl mx-auto text-center space-y-7">
          {/* Eyebrow badge */}
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white/90
            text-xs font-semibold px-3 py-1 rounded-full border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
            GWU Database of AI Litigation
          </span>

          <h1 id="hero-heading" className="text-5xl sm:text-6xl font-black tracking-tight text-white drop-shadow-sm">
            DAIL Navigator
          </h1>
          <p className="text-violet-200 text-lg max-w-xl mx-auto leading-relaxed">
            Explore AI litigation cases — curated for researchers, policymakers, and the public.
          </p>

          <div className="max-w-2xl mx-auto">
            <SearchBar
              size="large"
              placeholder="Search cases, parties, issues, algorithms…"
              onSearch={handleSearch}
              autoFocus
            />
          </div>

          {/* Example queries */}
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            <span className="text-violet-300/80 text-xs font-medium">Try:</span>
            {EXAMPLES.map(ex => (
              <button
                key={ex}
                type="button"
                onClick={() => handleSearch(ex)}
                className="text-xs text-violet-200 hover:text-white bg-white/10 hover:bg-white/20
                  px-2.5 py-1 rounded-full border border-white/20 hover:border-white/40
                  transition-all duration-150
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Stats Bar ── */}
      {stats && (
        <div className="bg-white border-b border-slate-100 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
            <dl className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
              {([
                { value: stats.total_cases.toLocaleString(), label: 'Cases', color: 'text-brand-600' },
                { value: stats.total_dockets.toLocaleString(), label: 'Dockets', color: 'text-violet-600' },
                { value: stats.jurisdictions.toLocaleString(), label: 'Jurisdictions', color: 'text-fuchsia-600' },
                { value: stats.class_actions.toLocaleString(), label: 'Class Actions', color: 'text-rose-600' },
                { value: stats.published_opinions.toLocaleString(), label: 'Pub. Opinions', color: 'text-emerald-600' },
                { value: stats.last_updated ?? '—', label: 'Updated', color: 'text-slate-500' },
              ] as { value: string; label: string; color: string }[]).map(s => (
                <div key={s.label} className="flex flex-col items-center">
                  <dd className={`text-2xl font-extrabold ${s.color} tabular-nums`}>{s.value}</dd>
                  <dt className="text-xs text-slate-400 mt-0.5 font-medium">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      {/* ── Disclaimer ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl
          px-4 py-3 text-sm text-amber-800">
          <span className="text-lg mt-0.5" aria-hidden>⚠️</span>
          <p>
            <strong>About this data:</strong> DAIL records are curated by GWU researchers. This
            interface reflects stored fields only — no AI enrichment. Verify legal details through
            primary sources. Data snapshot: <strong>February 21, 2026</strong>.
          </p>
        </div>
      </div>

      {/* ── Browse Cards ── */}
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10"
        aria-labelledby="browse-heading"
      >
        <div className="flex items-center justify-between">
          <h2 id="browse-heading" className="text-2xl font-bold text-slate-800">
            Browse by Category
          </h2>
          <button
            type="button"
            onClick={handleBrowseAll}
            className="text-sm text-brand-600 hover:underline focus:outline-none focus-visible:ring-2
              focus-visible:ring-brand-500 rounded"
          >
            Browse all cases →
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map(cat => (
            <div
              key={cat.label}
              className="ui-card p-5 flex flex-col gap-3"
              aria-labelledby={`cat-${cat.label}`}
            >
              <h3
                id={`cat-${cat.label}`}
                className="font-bold text-slate-800 text-xs uppercase tracking-widest
                  flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-gradient-to-br from-brand-500 to-violet-600" aria-hidden />
                {cat.label}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {cat.items.map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleCategory(cat.param, item)}
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium
                      hover:scale-105 active:scale-95
                      transition-all duration-150
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400
                      ${cat.color}`}
                    aria-label={`Browse ${cat.label}: ${item}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center pt-6">
          <button
            type="button"
            onClick={handleBrowseAll}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 font-bold text-white rounded-full
              bg-gradient-to-r from-brand-600 to-violet-600
              hover:from-brand-700 hover:to-violet-700
              hover:shadow-xl hover:shadow-brand-200 hover:-translate-y-0.5
              active:scale-95
              focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
              transition-all duration-200"
          >
            View All Cases
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  )
}
