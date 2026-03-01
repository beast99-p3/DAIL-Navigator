// components/SearchBar.tsx

import { FormEvent, useState, useEffect } from 'react'

interface Props {
  defaultValue?: string
  placeholder?: string
  onSearch: (q: string) => void
  autoFocus?: boolean
  size?: 'default' | 'large'
}

export default function SearchBar({
  defaultValue = '',
  placeholder = 'Search cases…',
  onSearch,
  autoFocus = false,
  size = 'default',
}: Props) {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearch(value.trim())
  }

  const isLarge = size === 'large'

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search DAIL cases"
      className="w-full"
    >
      <label htmlFor="main-search" className="sr-only">Search cases</label>
      <div className={`relative flex items-center rounded-full border shadow-sm
        bg-white transition-all duration-200
        focus-within:ring-2 focus-within:ring-brand-400 focus-within:border-brand-400
        ${isLarge ? 'border-slate-200 shadow-brand-100/50 shadow-lg' : 'border-slate-200'}`}
      >
        {/* Search icon */}
        <span className={`absolute left-4 text-slate-400 pointer-events-none flex-shrink-0`} aria-hidden>
          <svg
            className={isLarge ? 'w-5 h-5' : 'w-4 h-4'}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
        </span>

        <input
          id="main-search"
          type="search"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`flex-1 bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400
            ${isLarge ? 'pl-12 pr-4 py-4 text-lg' : 'pl-10 pr-4 py-2.5 text-sm'}`}
          aria-label="Enter search terms"
        />

        <button
          type="submit"
          className={`shrink-0 rounded-full bg-gradient-to-r from-brand-600 to-violet-600
            text-white font-semibold mr-1.5
            hover:from-brand-700 hover:to-violet-700 hover:shadow-md hover:shadow-brand-200
            active:scale-95
            focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1
            transition-all duration-150
            ${isLarge ? 'px-7 py-3 text-base' : 'px-5 py-2 text-sm'}`}
          aria-label="Submit search"
        >
          Search
        </button>
      </div>
    </form>
  )
}
