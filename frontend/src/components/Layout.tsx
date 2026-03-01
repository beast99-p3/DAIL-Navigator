// components/Layout.tsx — site chrome: nav + footer

import { Link, Outlet, useLocation } from 'react-router-dom'

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Nav ── */}
      <header
        className="bg-white/80 backdrop-blur-md border-b border-brand-100/60 sticky top-0 z-40 shadow-sm shadow-brand-100/30"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 font-extrabold text-lg tracking-tight
              focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg"
            aria-label="DAIL Navigator — home"
          >
            <span className="bg-gradient-to-br from-brand-600 to-violet-700 text-white rounded-lg
              px-2 py-1 text-xs font-black tracking-widest shadow-sm shadow-brand-300">
              DAIL
            </span>
            <span className="bg-gradient-to-r from-brand-700 to-violet-600 bg-clip-text text-transparent">
              Navigator
            </span>
          </Link>

          {/* Nav links */}
          <nav aria-label="Main navigation" className="flex items-center gap-1 text-sm font-medium">
            <Link
              to="/cases"
              className={`px-3 py-1.5 rounded-lg transition-all duration-150
                focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400
                ${
                  location.pathname === '/cases'
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
            >
              Search Cases
            </Link>
            <a
              href="https://github.com/george-washington-university-dail"
              className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800
                transition-all duration-150 text-xs focus:outline-none focus-visible:ring-2
                focus-visible:ring-brand-400"
              target="_blank"
              rel="noreferrer"
              aria-label="DAIL project on GitHub (opens in new tab)"
            >
              About
            </a>
          </nav>
        </div>
      </header>

      {/* ── Main ── */}
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="mt-20 text-xs text-slate-400" role="contentinfo">
        {/* gradient strip */}
        <div className="h-1 bg-gradient-to-r from-brand-400 via-violet-500 to-brand-600" />
        <div className="bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-br from-brand-600 to-violet-700 text-white rounded-md
                px-1.5 py-0.5 text-xs font-black tracking-widest">
                DAIL
              </span>
              <p>
                Navigator — transparency-first interface for the{' '}
                <span className="font-semibold text-slate-600">Database of AI Litigation</span>.
                {' '}Not legal advice.
              </p>
            </div>
            <p className="shrink-0 text-slate-400">Data as of Feb 21, 2026</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
