from app.extensions import db
from app.models import Notification, User, Role


def notify_user(user_id: int, message: str, complaint_id: int = None):
    note = Notification(user_id=user_id, message=message, complaint_id=complaint_id)
    db.session.add(note)
    return note


def notify_admins_of_role(role: str, message: str, complaint_id: int = None):
    """Notify every active admin user belonging to a given admin role."""
    admins = User.query.filter_by(role=role, is_active=True).all()
    for admin in admins:
        notify_user(admin.id, message, complaint_id)
