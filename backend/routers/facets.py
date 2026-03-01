"""routers/facets.py — /api/facets endpoint."""

from __future__ import annotations
from typing import Optional
from collections import Counter

from fastapi import APIRouter, Query
from database import get_conn
from models import FacetValue, FacetsResponse
from search import build_where, parse_list_field

router = APIRouter()

_LIST_FACETS = {
    "area_of_application": "area_of_application_list",
    "issue": "issue_list",
    "cause_of_action": "cause_of_action_list",
    "name_of_algorithm": "name_of_algorithm_list",
}

_SCALAR_FACETS = {
    "jurisdiction_type": "jurisdiction_type",
    "jurisdiction_name": "jurisdiction_name",
    "status_disposition": "status_disposition",
}


def _facet_from_list_col(rows: list, col: str) -> list[FacetValue]:
    counter: Counter = Counter()
    for row in rows:
        val = row[col]
        for item in parse_list_field(val):
            if item:
                counter[item] += 1
    return [FacetValue(value=v, count=c) for v, c in counter.most_common(200)]


def _facet_from_scalar_col(rows: list, col: str) -> list[FacetValue]:
    counter: Counter = Counter()
    for row in rows:
        val = row[col]
        if val:
            counter[val] += 1
    return [FacetValue(value=v, count=c) for v, c in counter.most_common(200)]


@router.get("/facets", response_model=FacetsResponse)
def get_facets(
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

    conn = get_conn()
    try:
        rows = conn.execute(
            f"""
            SELECT area_of_application_list, issue_list, cause_of_action_list,
                   name_of_algorithm_list, jurisdiction_type, jurisdiction_name,
                   status_disposition
            FROM cases WHERE {where}
            """,
            params,
        ).fetchall()
    finally:
        conn.close()

    return FacetsResponse(
        area_of_application=_facet_from_list_col(rows, "area_of_application_list"),
        issue=_facet_from_list_col(rows, "issue_list"),
        cause_of_action=_facet_from_list_col(rows, "cause_of_action_list"),
        name_of_algorithm=_facet_from_list_col(rows, "name_of_algorithm_list"),
        jurisdiction_type=_facet_from_scalar_col(rows, "jurisdiction_type"),
        jurisdiction_name=_facet_from_scalar_col(rows, "jurisdiction_name"),
        status_disposition=_facet_from_scalar_col(rows, "status_disposition"),
    )

