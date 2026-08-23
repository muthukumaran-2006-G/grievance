from datetime import datetime, timezone
from app.extensions import db


class ComplaintResponse(db.Model):
    __tablename__ = "complaint_responses"

    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey("complaints.id"), nullable=False, index=True)
    admin_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    response = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    complaint = db.relationship("Complaint", back_populates="responses")
    admin = db.relationship("User", back_populates="responses")

    def to_dict(self):
        return {
            "id": self.id,
            "complaint_id": self.complaint_id,
            "admin_id": self.admin_id,
            "admin_name": self.admin.name if self.admin else None,
            "admin_role": self.admin.role if self.admin else None,
            "response": self.response,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class ComplaintStatusHistory(db.Model):
    __tablename__ = "complaint_status_history"

    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey("complaints.id"), nullable=False, index=True)
    changed_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    old_status = db.Column(db.String(30), nullable=True)
    new_status = db.Column(db.String(30), nullable=False)
    changed_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    remarks = db.Column(db.Text, nullable=True)

    complaint = db.relationship("Complaint", back_populates="status_history")
    changed_by_user = db.relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "complaint_id": self.complaint_id,
            "changed_by": self.changed_by,
            "changed_by_name": self.changed_by_user.name if self.changed_by_user else None,
            "old_status": self.old_status,
            "new_status": self.new_status,
            "changed_at": self.changed_at.isoformat() if self.changed_at else None,
            "remarks": self.remarks,
        }


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey("complaints.id"), nullable=True)
    message = db.Column(db.String(500), nullable=False)
    is_read = db.Column(db.Boolean, default=False, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", back_populates="notifications")
    complaint = db.relationship("Complaint", back_populates="notifications")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "complaint_id": self.complaint_id,
            "complaint_number": self.complaint.complaint_number if self.complaint else None,
            "message": self.message,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
