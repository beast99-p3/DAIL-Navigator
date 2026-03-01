"""
build_db.py — Ingest DAIL Excel exports into SQLite.

Usage:
    python build_db.py \
        --cases  "../data/Case_Table_2026-Feb-21_1952.xlsx" \
        --dockets "../data/Docket_Table_2026-Feb-21_2003.xlsx" \
        --db     "dail.db"

The script normalises column names, maps known variants to canonical names,
and creates two tables: cases + dockets, plus a FTS5 virtual table for
full-text search.
"""

import argparse
import sqlite3
import re
import sys
from pathlib import Path

import pandas as pd


# ---------------------------------------------------------------------------
# Canonical column names we expect (lower-cased, underscored)
# ---------------------------------------------------------------------------
CASE_CANONICAL = {
    "record_number": ["record_number", "record number", "recordnumber", "id"],
    "caption": ["caption", "case caption", "case name"],
    "brief_description": ["brief_description", "brief description"],
    "organizations_involved": ["organizations_involved", "organizations involved", "organization"],
    "keyword": ["keyword", "keywords"],
    "summary_of_significance": ["summary_of_significance", "summary of significance"],
    "summary_facts_activity_to_date": [
        "summary_facts_activity_to_date",
        "summary of facts & activity to date",
        "summary facts activity to date",
        "summary_of_facts_activity_to_date",
    ],
    "most_recent_activity": ["most_recent_activity", "most recent activity"],
    "area_of_application_list": [
        "area_of_application_list",
        "area of application",
        "area_of_application",
    ],
    "issue_list": ["issue_list", "issues", "issue"],
    "cause_of_action_list": [
        "cause_of_action_list",
        "cause of action",
        "cause_of_action",
    ],
    "name_of_algorithm_list": [
        "name_of_algorithm_list",
        "name of algorithm",
        "algorithm name",
        "algorithm",
    ],
    "jurisdiction_type": ["jurisdiction_type", "jurisdiction type"],
    "jurisdiction_name": ["jurisdiction_name", "jurisdiction name", "jurisdiction"],
    "status_disposition": [
        "status_disposition",
        "status/disposition",
        "status disposition",
        "status",
    ],
    "class_action": ["class_action", "class action"],
    "published_opinions_binary": [
        "published_opinions_binary",
        "published opinions",
        "published_opinions",
    ],
    "date_filed": ["date_filed", "date filed", "filing date"],
    "most_recent_activity_date": [
        "most_recent_activity_date",
        "most recent activity date",
        "recent activity date",
    ],
    "last_update_date": ["last_update_date", "last update date", "last updated"],
    "researcher": ["researcher", "researcher name"],
    "progress_notes": ["progress_notes", "progress notes", "notes"],
}

DOCKET_CANONICAL = {
    "docket_id": ["docket_id", "id", "docket id"],
    "record_number": ["record_number", "record number", "case record number"],
    "court": ["court", "court name"],
    "docket_number": ["docket_number", "docket number"],
    "link": ["link", "url", "docket link", "source link"],
}


def normalise(s: str) -> str:
    """Lowercase and strip a string for fuzzy matching."""
    return re.sub(r"[^a-z0-9]+", "_", str(s).lower().strip()).strip("_")


def build_column_map(df_cols: list[str], canonical: dict[str, list[str]]) -> dict[str, str]:
    """Return {original_col -> canonical_name} mapping."""
    norm_to_orig = {normalise(c): c for c in df_cols}
    mapping: dict[str, str] = {}
    for canon, variants in canonical.items():
        for v in variants:
            key = normalise(v)
            if key in norm_to_orig:
                mapping[norm_to_orig[key]] = canon
                break
    return mapping


def read_excel(path: str) -> pd.DataFrame:
    p = Path(path)
    if not p.exists():
        print(f"[WARNING] File not found: {path}. Skipping.", file=sys.stderr)
        return pd.DataFrame()
    print(f"[INFO] Reading {p.name} …")
    return pd.read_excel(p, sheet_name=0, dtype=str)


def clean_df(df: pd.DataFrame, canonical: dict[str, list[str]], table: str) -> pd.DataFrame:
    if df.empty:
        return df

    col_map = build_column_map(list(df.columns), canonical)
    unmapped = [c for c in df.columns if c not in col_map]
    if unmapped:
        print(f"[{table}] Unmapped columns (will be ignored): {unmapped}")

    mapped = {orig: canon for orig, canon in col_map.items()}
    df = df[list(mapped.keys())].rename(columns=mapped)

    # Ensure all canonical columns exist (fill with None if absent)
    for col in canonical:
        if col not in df.columns:
            df[col] = None

    # Replace empty strings and "nan" with None
    df = df.replace({"": None, "nan": None, "NaN": None, "None": None})
    df = df.where(df.notna(), other=None)

    return df


def build(cases_path: str, dockets_path: str, db_path: str) -> None:
    cases_raw = read_excel(cases_path)
    dockets_raw = read_excel(dockets_path)

    cases = clean_df(cases_raw, CASE_CANONICAL, "cases")
    dockets = clean_df(dockets_raw, DOCKET_CANONICAL, "dockets")

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # ------------------------------------------------------------------
    # Cases table
    # ------------------------------------------------------------------
    cur.execute("DROP TABLE IF EXISTS cases")
    cur.execute(
        """
        CREATE TABLE cases (
            record_number               TEXT PRIMARY KEY,
            caption                     TEXT,
            brief_description           TEXT,
            organizations_involved      TEXT,
            keyword                     TEXT,
            summary_of_significance     TEXT,
            summary_facts_activity_to_date TEXT,
            most_recent_activity        TEXT,
            area_of_application_list    TEXT,
            issue_list                  TEXT,
            cause_of_action_list        TEXT,
            name_of_algorithm_list      TEXT,
            jurisdiction_type           TEXT,
            jurisdiction_name           TEXT,
            status_disposition          TEXT,
            class_action                TEXT,
            published_opinions_binary   TEXT,
            date_filed                  TEXT,
            most_recent_activity_date   TEXT,
            last_update_date            TEXT,
            researcher                  TEXT,
            progress_notes              TEXT
        )
        """
    )

    if not cases.empty:
        cases["record_number"] = cases["record_number"].astype(str).str.strip()
        cases = cases.drop_duplicates(subset="record_number")
        cases.to_sql("cases", conn, if_exists="append", index=False)
        print(f"[INFO] Inserted {len(cases)} cases.")
    else:
        print("[WARNING] No case data inserted.")

    # ------------------------------------------------------------------
    # Dockets table
    # ------------------------------------------------------------------
    cur.execute("DROP TABLE IF EXISTS dockets")
    cur.execute(
        """
        CREATE TABLE dockets (
            docket_id       INTEGER PRIMARY KEY AUTOINCREMENT,
            record_number   TEXT,
            court           TEXT,
            docket_number   TEXT,
            link            TEXT,
            FOREIGN KEY (record_number) REFERENCES cases(record_number)
        )
        """
    )

    if not dockets.empty:
        if "docket_id" in dockets.columns:
            dockets = dockets.drop(columns=["docket_id"])
        dockets.to_sql("dockets", conn, if_exists="append", index=False)
        print(f"[INFO] Inserted {len(dockets)} docket rows.")
    else:
        print("[WARNING] No docket data inserted.")

    # ------------------------------------------------------------------
    # FTS5 virtual table for full-text search
    # ------------------------------------------------------------------
    cur.execute("DROP TABLE IF EXISTS cases_fts")
    cur.execute(
        """
        CREATE VIRTUAL TABLE cases_fts USING fts5(
            record_number UNINDEXED,
            caption,
            brief_description,
            organizations_involved,
            keyword,
            summary_of_significance,
            summary_facts_activity_to_date,
            most_recent_activity,
            content=cases,
            content_rowid=rowid
        )
        """
    )
    cur.execute(
        "INSERT INTO cases_fts(cases_fts) VALUES('rebuild')"
    )
    print("[INFO] FTS5 index built.")

    conn.commit()
    conn.close()
    print(f"[DONE] Database written to {db_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build DAIL SQLite database from Excel exports.")
    parser.add_argument("--cases", required=True, help="Path to Case_Table Excel file")
    parser.add_argument("--dockets", required=True, help="Path to Docket_Table Excel file")
    parser.add_argument("--db", default="dail.db", help="Output SQLite path (default: dail.db)")
    args = parser.parse_args()
    build(args.cases, args.dockets, args.db)
