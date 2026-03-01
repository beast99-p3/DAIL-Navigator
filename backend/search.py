"""search.py — shared query-building helpers."""

from __future__ import annotations
import re
import sqlite3
from typing import Optional
from database import get_conn


# ---------------------------------------------------------------------------
# List-field helpers
# ---------------------------------------------------------------------------

def parse_list_field(raw: Optional[str]) -> list[str]:
    """Split a semicolon/comma-separated list field into clean tokens."""
    if not raw:
        return []
    tokens = re.split(r"[;,|]+", raw)
    return [t.strip() for t in tokens if t.strip()]


# ---------------------------------------------------------------------------
# Core query builder
# ---------------------------------------------------------------------------

SORT_MAP = {
    "recent_activity": "most_recent_activity_date DESC NULLS LAST",
    "last_updated": "last_update_date DESC NULLS LAST",
    "newest_filed": "date_filed DESC NULLS LAST",
    "caption_asc": "caption ASC NULLS LAST",
}

_LIST_FIELDS = {
    "area_of_application": "area_of_application_list",
    "issue": "issue_list",
    "cause_of_action": "cause_of_action_list",
    "name_of_algorithm": "name_of_algorithm_list",
}


def build_where(
    q: str,
    area_of_application: list[str],
    issue: list[str],
    cause_of_action: list[str],
    name_of_algorithm: list[str],
    jurisdiction_type: list[str],
    jurisdiction_name: list[str],
    status_disposition: list[str],
    class_action: Optional[str],
    published_opinions: Optional[str],
    date_from: Optional[str],
    date_to: Optional[str],
    activity_from: Optional[str],
    activity_to: Optional[str],
    params: list,
) -> str:
    """Return a WHERE clause fragment (without the leading WHERE keyword)."""
    clauses: list[str] = []

    # Full-text search
    if q and q.strip():
        clauses.append(
            "record_number IN (SELECT record_number FROM cases_fts WHERE cases_fts MATCH ?)"
        )
        cleaned = re.sub(r'[^\w\s]', ' ', q.strip())
        fts_query = " ".join(f'"{w}"*' for w in cleaned.split() if w)
        if not fts_query:
            fts_query = "*"
        params.append(fts_query)

    # List-field filters
    list_lookup: dict[str, list[str]] = {
        "area_of_application": area_of_application,
        "issue": issue,
        "cause_of_action": cause_of_action,
        "name_of_algorithm": name_of_algorithm,
    }
    for param_name, col in _LIST_FIELDS.items():
        values = list_lookup[param_name]
        if values:
            sub: list[str] = []
            for v in values:
                lv = v.lower()
                # Use substring LIKE so we handle any delimiter (comma, semicolon, pipe, etc.)
                sub.append(f"LOWER({col}) LIKE ?")
                params.append(f"%{lv}%")
            clauses.append("(" + " AND ".join(sub) + ")")

    def _multi(col: str, values: list[str]) -> None:
        if values:
            placeholders = ",".join("?" * len(values))
            clauses.append(f"LOWER({col}) IN ({placeholders})")
            params.extend([v.lower() for v in values])

    _multi("jurisdiction_type", jurisdiction_type)
    _multi("jurisdiction_name", jurisdiction_name)
    _multi("status_disposition", status_disposition)

    if class_action:
        clauses.append("LOWER(class_action) = ?")
        params.append(class_action.lower())

    if published_opinions:
        clauses.append("LOWER(published_opinions_binary) = ?")
        params.append(published_opinions.lower())

    # Date range filters on date_filed
    if date_from:
        clauses.append("date_filed >= ?")
        params.append(date_from)
    if date_to:
        clauses.append("date_filed <= ?")
        params.append(date_to)

    # Date range filters on most_recent_activity_date
    if activity_from:
        clauses.append("most_recent_activity_date >= ?")
        params.append(activity_from)
    if activity_to:
        clauses.append("most_recent_activity_date <= ?")
        params.append(activity_to)

    return " AND ".join(clauses) if clauses else "1=1"

