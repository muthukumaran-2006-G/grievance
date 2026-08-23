from flask import Blueprint, request
from sqlalchemy import func

from app.extensions import db
from app.middleware.auth import get_current_user, role_required
from app.models import (
    Complaint, ComplaintStatus, ComplaintResponse, ComplaintStatusHistory, Role
)
from app.utils.notify import notify_user
from app.utils.responses import success, error

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

ADMIN_ROLES = Role.ADMIN_ROLES  # ["principal", "grievance_team"]


def _admin_scope(role: str):
    """
    Returns the 'assigned_to' bucket an admin role is allowed to see.
    This is the single source of truth for backend authorization -
    the frontend never determines what data is visible.
    """
    return role  # "principal" -> sees assigned_to == "principal", etc.


@admin_bp.get("/complaints")
@role_required(*ADMIN_ROLES)
def list_complaints():
    user = get_current_user()
    scope = _admin_scope(user.role)

    status_filter = request.args.get("status")
    priority_filter = request.args.get("priority")
    category_filter = request.args.get("category")
    search = request.args.get("search", "").strip()

    query = Complaint.query.filter(Complaint.assigned_to == scope)

    if status_filter and status_filter != "All":
        query = query.filter(Complaint.status == status_filter)
    if priority_filter and priority_filter != "All":
        query = query.filter(Complaint.priority == priority_filter)
    if category_filter and category_filter != "All":
        query = query.filter(Complaint.category == category_filter)
    if search:
        like = f"%{search}%"
        query = query.filter(
            db.or_(Complaint.complaint_number.ilike(like), Complaint.title.ilike(like))
        )

    complaints = query.order_by(Complaint.created_at.desc()).all()
    return success([c.to_dict(include_relations=False) for c in complaints])


@admin_bp.get("/complaints/<int:complaint_id>")
@role_required(*ADMIN_ROLES)
def get_complaint(complaint_id):
    user = get_current_user()
    scope = _admin_scope(user.role)

    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return error("Complaint not found.", 404)

    # Backend enforcement: an admin can only fetch complaints assigned to
    # their own role bucket, even if they guess a valid complaint id.
    if complaint.assigned_to != scope:
        return error("You are not authorized to access this complaint.", 403)

    return success(complaint.to_dict())


@admin_bp.put("/complaints/<int:complaint_id>/status")
@role_required(*ADMIN_ROLES)
def update_status(complaint_id):
    user = get_current_user()
    scope = _admin_scope(user.role)

    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return error("Complaint not found.", 404)
    if complaint.assigned_to != scope:
        return error("You are not authorized to modify this complaint.", 403)

    data = request.get_json(silent=True) or {}
    new_status = (data.get("status") or "").strip()
    remarks = (data.get("remarks") or "").strip() or None

    if new_status not in ComplaintStatus.ALL:
        return error(f"Status must be one of {ComplaintStatus.ALL}.", 422)

    old_status = complaint.status
    complaint.status = new_status
    if new_status == ComplaintStatus.RESOLVED:
        from datetime import datetime, timezone
        complaint.resolved_at = datetime.now(timezone.utc)

    history = ComplaintStatusHistory(
        complaint_id=complaint.id,
        changed_by=user.id,
        old_status=old_status,
        new_status=new_status,
        remarks=remarks,
    )
    db.session.add(history)

    notify_user(
        complaint.user_id,
        f"Your grievance {complaint.complaint_number} is now {new_status}.",
        complaint.id,
    )

    db.session.commit()
    return success(complaint.to_dict(), "Status updated successfully.")


@admin_bp.post("/complaints/<int:complaint_id>/response")
@role_required(*ADMIN_ROLES)
def add_response(complaint_id):
    user = get_current_user()
    scope = _admin_scope(user.role)

    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return error("Complaint not found.", 404)
    if complaint.assigned_to != scope:
        return error("You are not authorized to respond to this complaint.", 403)

    data = request.get_json(silent=True) or {}
    response_text = (data.get("response") or "").strip()
    if not response_text:
        return error("Response text is required.", 422)

    response = ComplaintResponse(
        complaint_id=complaint.id, admin_id=user.id, response=response_text
    )
    db.session.add(response)

    notify_user(
        complaint.user_id,
        f"You received a new response on grievance {complaint.complaint_number}.",
        complaint.id,
    )

    db.session.commit()
    return success(complaint.to_dict(), "Response added successfully.", 201)


@admin_bp.get("/stats")
@role_required(*ADMIN_ROLES)
def stats():
    user = get_current_user()
    scope = _admin_scope(user.role)

    rows = (
        db.session.query(Complaint.status, func.count(Complaint.id))
        .filter(Complaint.assigned_to == scope)
        .group_by(Complaint.status)
        .all()
    )
    counts = {status: 0 for status in ComplaintStatus.ALL}
    total = 0
    for status, count in rows:
        counts[status] = count
        total += count

    category_rows = (
        db.session.query(Complaint.category, func.count(Complaint.id))
        .filter(Complaint.assigned_to == scope)
        .group_by(Complaint.category)
        .all()
    )

    return success({
        "total": total,
        "by_status": counts,
        "by_category": {cat: count for cat, count in category_rows},
    })
