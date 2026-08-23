from flask import Blueprint, request, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt

from app.extensions import db
from app.middleware.auth import get_current_user, role_required
from app.models import (
    Complaint, ComplaintCategory, ComplaintPriority, AssignedTo,
    ComplaintStatus, ComplaintStatusHistory, Role
)
from app.utils.numbering import generate_complaint_number
from app.utils.uploads import save_attachment
from app.utils.notify import notify_admins_of_role
from app.utils.responses import success, error

complaints_bp = Blueprint("complaints", __name__, url_prefix="/api/complaints")

APPLICANT_ROLES = Role.APPLICANT_ROLES


@complaints_bp.post("")
@role_required(*APPLICANT_ROLES)
def submit_complaint():
    user = get_current_user()

    # Support both multipart/form-data (with file) and plain JSON
    if request.content_type and "multipart/form-data" in request.content_type:
        form = request.form
        file_storage = request.files.get("attachment")
    else:
        form = request.get_json(silent=True) or {}
        file_storage = None

    title = (form.get("title") or "").strip()
    description = (form.get("description") or "").strip()
    category = (form.get("category") or "").strip()
    priority = (form.get("priority") or ComplaintPriority.MEDIUM).strip()
    assigned_to = (form.get("assigned_to") or form.get("receiver") or "").strip()

    errors = {}
    if not title:
        errors["title"] = "Title is required."
    if not description:
        errors["description"] = "Description is required."
    if category not in ComplaintCategory.ALL:
        errors["category"] = f"Category must be one of {ComplaintCategory.ALL}."
    if priority not in ComplaintPriority.ALL:
        errors["priority"] = f"Priority must be one of {ComplaintPriority.ALL}."
    if assigned_to not in AssignedTo.ALL:
        errors["assigned_to"] = "Receiver must be 'principal' or 'grievance_team'."

    if errors:
        return error("Please correct the highlighted fields.", 422, errors)

    attachment_path, attachment_original_name = None, None
    if file_storage:
        try:
            attachment_path, attachment_original_name = save_attachment(file_storage)
        except ValueError as e:
            return error(str(e), 400)

    complaint = Complaint(
        complaint_number=generate_complaint_number(),
        user_id=user.id,
        title=title,
        description=description,
        category=category,
        priority=priority,
        assigned_to=assigned_to,
        status=ComplaintStatus.PENDING,
        attachment_path=attachment_path,
        attachment_original_name=attachment_original_name,
    )
    db.session.add(complaint)
    db.session.flush()  # get complaint.id before commit

    history = ComplaintStatusHistory(
        complaint_id=complaint.id,
        changed_by=user.id,
        old_status=None,
        new_status=ComplaintStatus.PENDING,
        remarks="Grievance submitted.",
    )
    db.session.add(history)

    notify_admins_of_role(
        assigned_to,
        f"New grievance received: {complaint.complaint_number} - {title}",
        complaint.id,
    )

    db.session.commit()
    return success(complaint.to_dict(), "Grievance submitted successfully.", 201)


@complaints_bp.get("/my")
@role_required(*APPLICANT_ROLES)
def my_complaints():
    user = get_current_user()

    status_filter = request.args.get("status")
    search = request.args.get("search", "").strip()

    query = Complaint.query.filter_by(user_id=user.id)

    if status_filter and status_filter != "All":
        query = query.filter(Complaint.status == status_filter)

    if search:
        like = f"%{search}%"
        query = query.filter(
            db.or_(Complaint.complaint_number.ilike(like), Complaint.title.ilike(like))
        )

    complaints = query.order_by(Complaint.created_at.desc()).all()
    return success([c.to_dict(include_relations=False) for c in complaints])


@complaints_bp.get("/<int:complaint_id>")
@jwt_required()
def get_complaint(complaint_id):
    user = get_current_user()
    claims = get_jwt()
    role = claims.get("role")

    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return error("Complaint not found.", 404)

    # Authorization: the owning applicant, or the admin role it was assigned to.
    is_owner = complaint.user_id == user.id
    is_authorized_admin = role in Role.ADMIN_ROLES and complaint.assigned_to == role

    if not (is_owner or is_authorized_admin):
        return error("You are not authorized to view this complaint.", 403)

    return success(complaint.to_dict())


@complaints_bp.get("/attachments/<path:filename>")
@jwt_required()
def download_attachment(filename):
    user = get_current_user()
    claims = get_jwt()
    role = claims.get("role")

    complaint = Complaint.query.filter_by(attachment_path=filename).first()
    if not complaint:
        return error("Attachment not found.", 404)

    is_owner = complaint.user_id == user.id
    is_authorized_admin = role in Role.ADMIN_ROLES and complaint.assigned_to == role
    if not (is_owner or is_authorized_admin):
        return error("You are not authorized to access this file.", 403)

    return send_from_directory(
        current_app.config["UPLOAD_FOLDER"],
        filename,
        as_attachment=True,
        download_name=complaint.attachment_original_name or filename,
    )
