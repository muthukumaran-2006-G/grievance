from flask import Blueprint
from sqlalchemy import func

from app.extensions import db
from app.middleware.auth import get_current_user, role_required
from app.models import Complaint, ComplaintStatus, Role
from app.utils.responses import success

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@dashboard_bp.get("/summary")
@role_required(*Role.APPLICANT_ROLES)
def summary():
    """Stats for the logged-in applicant's own dashboard (student/faculty/worker/parent)."""
    user = get_current_user()

    rows = (
        db.session.query(Complaint.status, func.count(Complaint.id))
        .filter(Complaint.user_id == user.id)
        .group_by(Complaint.status)
        .all()
    )
    counts = {status: 0 for status in ComplaintStatus.ALL}
    total = 0
    for status, count in rows:
        counts[status] = count
        total += count

    recent = (
        Complaint.query.filter_by(user_id=user.id)
        .order_by(Complaint.created_at.desc())
        .limit(5)
        .all()
    )

    return success({
        "total": total,
        "by_status": counts,
        "recent_complaints": [c.to_dict(include_relations=False) for c in recent],
    })
