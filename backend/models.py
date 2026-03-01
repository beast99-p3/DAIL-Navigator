"""models.py — Pydantic schemas for API responses."""

from __future__ import annotations
from typing import Optional
from pydantic import BaseModel


class DocketLink(BaseModel):
    docket_id: int
    court: Optional[str] = None
    docket_number: Optional[str] = None
    link: Optional[str] = None


class CaseSummary(BaseModel):
    record_number: str
    caption: Optional[str] = None
    brief_description: Optional[str] = None
    jurisdiction_type: Optional[str] = None
    jurisdiction_name: Optional[str] = None
    status_disposition: Optional[str] = None
    date_filed: Optional[str] = None
    most_recent_activity_date: Optional[str] = None
    last_update_date: Optional[str] = None
    class_action: Optional[str] = None
    published_opinions_binary: Optional[str] = None
    area_of_application_list: Optional[str] = None
    issue_list: Optional[str] = None
    cause_of_action_list: Optional[str] = None


class CaseDetail(BaseModel):
    record_number: str
    caption: Optional[str] = None
    brief_description: Optional[str] = None
    organizations_involved: Optional[str] = None
    keyword: Optional[str] = None
    summary_of_significance: Optional[str] = None
    summary_facts_activity_to_date: Optional[str] = None
    most_recent_activity: Optional[str] = None
    area_of_application_list: Optional[str] = None
    issue_list: Optional[str] = None
    cause_of_action_list: Optional[str] = None
    name_of_algorithm_list: Optional[str] = None
    jurisdiction_type: Optional[str] = None
    jurisdiction_name: Optional[str] = None
    status_disposition: Optional[str] = None
    class_action: Optional[str] = None
    published_opinions_binary: Optional[str] = None
    date_filed: Optional[str] = None
    most_recent_activity_date: Optional[str] = None
    last_update_date: Optional[str] = None
    researcher: Optional[str] = None
    progress_notes: Optional[str] = None
    dockets: list[DocketLink] = []


class SearchResponse(BaseModel):
    total: int
    page: int
    per_page: int
    results: list[CaseSummary]


class FacetValue(BaseModel):
    value: str
    count: int


class FacetsResponse(BaseModel):
    area_of_application: list[FacetValue]
    issue: list[FacetValue]
    cause_of_action: list[FacetValue]
    jurisdiction_type: list[FacetValue]
    jurisdiction_name: list[FacetValue]
    status_disposition: list[FacetValue]
    name_of_algorithm: list[FacetValue]
