# DAIL Navigator

**DAIL Navigator** is an open, transparency-first search interface for the [Database of AI Litigation (DAIL)](https://dail.law.gwu.edu/) — a curated collection of court cases involving artificial intelligence, maintained by researchers at The George Washington University.

As AI systems become embedded in hiring, healthcare, criminal justice, and financial services, the legal disputes they generate are growing rapidly. DAIL Navigator makes that landscape explorable: search by keyword, filter by jurisdiction, issue, cause of action, or algorithm name, and drill into full case details — all in one place, with no paywalls and no AI-generated summaries.

> **Designed for** legal researchers, policy analysts, journalists, and anyone who wants to understand how courts are grappling with AI.
> **Data source:** GWU DAIL project Excel exports — stored fields only, no enrichment.
> **Data snapshot:** February 21, 2026.

## Features

- **"Google-simple" search** across captions, descriptions, parties, keywords, and summaries
- **Faceted filtering** with live counts that update as you select filters
- **Shareable searches** — all search state lives in the URL
- **Case detail pages** with transparency panel, source dockets, and citation helper
- **No AI enrichment** — all search and filter logic operates on stored fields only
- Accessible: keyboard navigable, ARIA labels, skip-to-content, good contrast

---

## Project Structure

```
/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── database.py          # SQLite connection helper
│   ├── models.py            # Pydantic response schemas
│   ├── search.py            # Query-building helpers
│   ├── build_db.py          # One-time ingestion script (Excel → SQLite)
│   ├── routers/
│   │   ├── cases.py         # GET /api/cases  +  GET /api/case/:id
│   │   └── facets.py        # GET /api/facets
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── types/index.ts
│   │   ├── lib/
│   │   │   ├── api.ts       # Typed fetch wrappers
│   │   │   └── utils.ts     # Formatting helpers
│   │   ├── hooks/
│   │   │   └── useSearchState.ts  # URL ↔ SearchFilters sync
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   ├── FilterChips.tsx
│   │   │   ├── CaseCard.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── EmptyState.tsx
│   │   └── pages/
│   │       ├── HomePage.tsx
│   │       ├── SearchPage.tsx
│   │       ├── CaseDetailPage.tsx
│   │       └── NotFoundPage.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
└── README.md
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.11+ |
| Node.js | 18+ |
| npm | 9+ |

---

## Setup & Run

### 1 — Place the Excel exports

Copy both DAIL Excel files into a `data/` folder at the project root (or anywhere you like):

```
data/
  Case_Table_2026-Feb-21_1952.xlsx
  Docket_Table_2026-Feb-21_2003.xlsx
```

### 2 — Backend

```bash
cd backend

# Create a virtual environment
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy env vars
copy .env.example .env      # Windows
# cp .env.example .env      # macOS / Linux

# Build the SQLite database (run once; re-run to refresh)
python build_db.py \
  --cases  "../data/Case_Table_2026-Feb-21_1952.xlsx" \
  --dockets "../data/Docket_Table_2026-Feb-21_2003.xlsx" \
  --db     "dail.db"

# Start the API server
uvicorn main:app --reload --port 8000
```

API docs are available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 3 — Frontend

```bash
cd frontend

npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Environment Variables

### backend/.env

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_PATH` | `./dail.db` | Path to the SQLite database file |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cases` | Paginated, sorted, filtered case search |
| GET | `/api/case/{record_number}` | Full case detail + related dockets |
| GET | `/api/facets` | Facet values + counts under current query/filters |
| GET | `/api/health` | Health check |

### Query parameters for `/api/cases` and `/api/facets`

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Full-text search query |
| `area_of_application` | string[] | Filter by application area (repeatable) |
| `issue` | string[] | Filter by issue |
| `cause_of_action` | string[] | Filter by cause of action |
| `name_of_algorithm` | string[] | Filter by algorithm/tool |
| `jurisdiction_type` | string[] | Federal / State / etc. |
| `jurisdiction_name` | string[] | Specific jurisdiction |
| `status_disposition` | string[] | Case status |
| `class_action` | string | `yes` to filter class actions |
| `published_opinions` | string | `yes` to filter cases with published opinions |
| `sort` | string | `recent_activity` \| `last_updated` \| `newest_filed` \| `caption_asc` |
| `page` | int | Page number (default 1) |
| `per_page` | int | Results per page (default 20, max 100) |

---

## Data Notes

- **Column mapping**: `build_db.py` normalises Excel column names using fuzzy matching. Unknown columns are logged but ignored.
- **List fields** (`area_of_application_list`, `issue_list`, etc.) are stored as raw strings (semicolons or commas as delimiters) and parsed at query time.
- **FTS5**: Full-text search uses SQLite's built-in FTS5 engine over 7 text fields. No stemming or semantic ranking is applied.
- **Null safety**: Blank/`nan` cells are stored as `NULL` and handled gracefully in both API and UI.

---

## Rebuilding the Database

Re-run `build_db.py` whenever the Excel exports are updated. The script drops and recreates all tables.

```bash
python build_db.py \
  --cases  "../data/Case_Table_2026-Feb-21_1952.xlsx" \
  --dockets "../data/Docket_Table_2026-Feb-21_2003.xlsx" \
  --db     "dail.db"
```

---

## Design Principles

- **Transparency first**: no black-box enrichment; every result reflects verbatim stored fields.
- **URL-driven state**: search query, filters, sort, and page are encoded in the URL so searches are shareable and bookmarkable.
- **Accessibility**: keyboard navigation, ARIA labels, semantic HTML, skip-to-content link, sufficient colour contrast.
- **No LLM/embedding/semantic ranking**: SQLite FTS5 only.
