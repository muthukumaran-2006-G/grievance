from datetime import datetime, timezone
from app.extensions import db


class ComplaintStatus:
    PENDING = "Pending"
    UNDER_REVIEW = "Under Review"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"
    REJECTED = "Rejected"

    ALL = [PENDING, UNDER_REVIEW, IN_PROGRESS, RESOLVED, REJECTED]


class ComplaintCategory:
    ALL = [
        "Academic", "Infrastructure", "Hostel", "Transport", "Examination",
        "Faculty", "Staff", "Fees", "Canteen", "Library", "Discipline",
        "Safety", "Other",
    ]


class ComplaintPriority:
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

    ALL = [LOW, MEDIUM, HIGH, CRITICAL]


class AssignedTo:
    PRINCIPAL = "principal"
    GRIEVANCE_TEAM = "grievance_team"

    ALL = [PRINCIPAL, GRIEVANCE_TEAM]


class Complaint(db.Model):
    __tablename__ = "complaints"

    id = db.Column(db.Integer, primary_key=True)
    complaint_number = db.Column(db.String(30), nullable=False, unique=True, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)

    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    priority = db.Column(db.String(20), nullable=False, default=ComplaintPriority.MEDIUM)

    assigned_to = db.Column(db.String(30), nullable=False, index=True)  # principal | grievance_team
    status = db.Column(db.String(30), nullable=False, default=ComplaintStatus.PENDING, index=True)

    attachment_path = db.Column(db.String(500), nullable=True)
    attachment_original_name = db.Column(db.String(255), nullable=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    resolved_at = db.Column(db.DateTime, nullable=True)

    user = db.relationship("User", back_populates="complaints", foreign_keys=[user_id])
    responses = db.relationship(
        "ComplaintResponse", back_populates="complaint",
        cascade="all, delete-orphan", order_by="ComplaintResponse.created_at"
    )
    status_history = db.relationship(
        "ComplaintStatusHistory", back_populates="complaint",
        cascade="all, delete-orphan", order_by="ComplaintStatusHistory.changed_at"
    )
    notifications = db.relationship(
        "Notification", back_populates="complaint", cascade="all, delete-orphan"
    )

    def to_dict(self, include_relations=True):
        data = {
            "id": self.id,
            "complaint_number": self.complaint_number,
            "user_id": self.user_id,
            "user_name": self.user.name if self.user else None,
            "user_role": self.user.role if self.user else None,
            "user_department": self.user.department if self.user else None,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "priority": self.priority,
            "assigned_to": self.assigned_to,
            "status": self.status,
            "attachment_path": self.attachment_path,
            "attachment_original_name": self.attachment_original_name,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
        }
        if include_relations:
            data["responses"] = [r.to_dict() for r in self.responses]
            data["status_history"] = [h.to_dict() for h in self.status_history]
        return data
