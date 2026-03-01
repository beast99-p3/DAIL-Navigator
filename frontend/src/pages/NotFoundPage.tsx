// pages/NotFoundPage.tsx

import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center gap-4 px-4">
      <p className="text-6xl font-bold text-slate-200">404</p>
      <p className="text-xl font-semibold text-slate-700">Page not found</p>
      <p className="text-slate-500">The page you requested doesn't exist.</p>
      <Link
        to="/"
        className="mt-4 px-6 py-2.5 bg-brand-600 text-white font-semibold rounded-lg
          hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        Go to Home
      </Link>
    </div>
  )
}
