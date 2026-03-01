"""routers/stats.py — /api/stats endpoint."""

from fastapi import APIRouter
from database import get_conn

router = APIRouter()


@router.get("/stats")
def get_stats():
    conn = get_conn()
    try:
        total_cases = conn.execute("SELECT COUNT(*) FROM cases").fetchone()[0]
        total_dockets = conn.execute("SELECT COUNT(*) FROM dockets").fetchone()[0]
        jurisdictions = conn.execute(
            "SELECT COUNT(DISTINCT jurisdiction_name) FROM cases WHERE jurisdiction_name IS NOT NULL"
        ).fetchone()[0]
        last_updated = conn.execute(
            "SELECT MAX(last_update_date) FROM cases"
        ).fetchone()[0]
        class_actions = conn.execute(
            "SELECT COUNT(*) FROM cases WHERE LOWER(class_action) = 'yes'"
        ).fetchone()[0]
        published_opinions = conn.execute(
            "SELECT COUNT(*) FROM cases WHERE LOWER(published_opinions_binary) = 'yes'"
        ).fetchone()[0]
    finally:
        conn.close()

    return {
        "total_cases": total_cases,
        "total_dockets": total_dockets,
        "jurisdictions": jurisdictions,
        "last_updated": last_updated,
        "class_actions": class_actions,
        "published_opinions": published_opinions,
    }
