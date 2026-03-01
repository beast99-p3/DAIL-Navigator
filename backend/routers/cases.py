"""routers/cases.py — /api/cases and /api/case/:id endpoints."""

from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from database import get_conn
from models import CaseDetail, CaseSummary, SearchResponse, DocketLink
from search import build_where, SORT_MAP

router = APIRouter()


@router.get("/cases", response_model=SearchResponse)
def search_cases(
    q: str = Query(default=""),
    area_of_application: list[str] = Query(default=[]),
    issue: list[str] = Query(default=[]),
    cause_of_action: list[str] = Query(default=[]),
    name_of_algorithm: list[str] = Query(default=[]),
    jurisdiction_type: list[str] = Query(default=[]),
    jurisdiction_name: list[str] = Query(default=[]),
    status_disposition: list[str] = Query(default=[]),
    class_action: Optional[str] = Query(default=None),
    published_opinions: Optional[str] = Query(default=None),
    date_from: Optional[str] = Query(default=None),
    date_to: Optional[str] = Query(default=None),
    activity_from: Optional[str] = Query(default=None),
    activity_to: Optional[str] = Query(default=None),
    sort: str = Query(default="recent_activity"),
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
):
    params: list = []
    where = build_where(
        q=q,
        area_of_application=area_of_application,
        issue=issue,
        cause_of_action=cause_of_action,
        name_of_algorithm=name_of_algorithm,
        jurisdiction_type=jurisdiction_type,
        jurisdiction_name=jurisdiction_name,
        status_disposition=status_disposition,
        class_action=class_action,
        published_opinions=published_opinions,
        date_from=date_from,
        date_to=date_to,
        activity_from=activity_from,
        activity_to=activity_to,
        params=params,
    )
    order = SORT_MAP.get(sort, SORT_MAP["recent_activity"])

    conn = get_conn()
    try:
        total_params = list(params)
        total_row = conn.execute(
            f"SELECT COUNT(*) FROM cases WHERE {where}", total_params
        ).fetchone()
        total = total_row[0] if total_row else 0

        offset = (page - 1) * per_page
        rows = conn.execute(
            f"""
            SELECT record_number, caption, brief_description,
                   jurisdiction_type, jurisdiction_name, status_disposition,
                   date_filed, most_recent_activity_date, last_update_date,
                   class_action, published_opinions_binary,
                   area_of_application_list, issue_list, cause_of_action_list
            FROM cases
            WHERE {where}
            ORDER BY {order}
            LIMIT ? OFFSET ?
            """,
            params + [per_page, offset],
        ).fetchall()
    finally:
        conn.close()

    results = [CaseSummary(**dict(r)) for r in rows]
    return SearchResponse(total=total, page=page, per_page=per_page, results=results)


@router.get("/case/{record_number}", response_model=CaseDetail)
def get_case(record_number: str):
    conn = get_conn()
    try:
        row = conn.execute(
            "SELECT * FROM cases WHERE record_number = ?", (record_number,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Case not found")

        docket_rows = conn.execute(
            "SELECT docket_id, court, docket_number, link FROM dockets WHERE record_number = ?",
            (record_number,),
        ).fetchall()
    finally:
        conn.close()

    dockets = [DocketLink(**dict(d)) for d in docket_rows]
    case = CaseDetail(**dict(row), dockets=dockets)
    return case

