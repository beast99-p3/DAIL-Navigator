// lib/utils.ts — shared helpers

export function parseListField(raw: string | null | undefined): string[] {
  if (!raw) return []
  return raw
    .split(/[;,|]+/)
    .map(s => s.trim())
    .filter(Boolean)
}

export function formatDate(raw: string | null | undefined): string {
  if (!raw) return '—'
  // Try to parse various formats
  const d = new Date(raw)
  if (isNaN(d.getTime())) return raw
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function isYes(value: string | null | undefined): boolean {
  if (!value) return false
  return value.toLowerCase().startsWith('y') || value === '1' || value.toLowerCase() === 'true'
}

export function citationText(record_number: string, caption: string | null, url: string): string {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  return `"${caption ?? record_number}." Database of AI Litigation (DAIL), GWU. Accessed ${today}. ${url}`
}
