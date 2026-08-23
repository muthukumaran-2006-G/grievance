from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from app.extensions import db
from app.middleware.auth import get_current_user
from app.models import Notification
from app.utils.responses import success, error

notifications_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")


@notifications_bp.get("")
@jwt_required()
def list_notifications():
    user = get_current_user()
    unread_only = request.args.get("unread_only") == "true"

    query = Notification.query.filter_by(user_id=user.id)
    if unread_only:
        query = query.filter_by(is_read=False)

    notifications = query.order_by(Notification.created_at.desc()).limit(50).all()
    unread_count = Notification.query.filter_by(user_id=user.id, is_read=False).count()

    return success({
        "notifications": [n.to_dict() for n in notifications],
        "unread_count": unread_count,
    })


@notifications_bp.put("/<int:notification_id>/read")
@jwt_required()
def mark_read(notification_id):
    user = get_current_user()
    notification = Notification.query.get(notification_id)

    if not notification:
        return error("Notification not found.", 404)
    if notification.user_id != user.id:
        return error("You are not authorized to modify this notification.", 403)

    notification.is_read = True
    db.session.commit()
    return success(notification.to_dict(), "Marked as read.")


@notifications_bp.put("/read-all")
@jwt_required()
def mark_all_read():
    user = get_current_user()
    Notification.query.filter_by(user_id=user.id, is_read=False).update({"is_read": True})
    db.session.commit()
    return success(message="All notifications marked as read.")
