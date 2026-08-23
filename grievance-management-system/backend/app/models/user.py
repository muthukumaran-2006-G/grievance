from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db


class Role:
    STUDENT = "student"
    FACULTY = "faculty"
    WORKER = "worker"
    PARENT = "parent"
    PRINCIPAL = "principal"
    GRIEVANCE_TEAM = "grievance_team"

    ALL = [STUDENT, FACULTY, WORKER, PARENT, PRINCIPAL, GRIEVANCE_TEAM]
    APPLICANT_ROLES = [STUDENT, FACULTY, WORKER, PARENT]
    ADMIN_ROLES = [PRINCIPAL, GRIEVANCE_TEAM]


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), nullable=False, unique=True, index=True)
    phone = db.Column(db.String(20), nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(30), nullable=False, index=True)
    department = db.Column(db.String(150), nullable=True)
    register_number = db.Column(db.String(50), nullable=True)  # student reg no / employee id
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    complaints = db.relationship(
        "Complaint", back_populates="user", foreign_keys="Complaint.user_id",
        cascade="all, delete-orphan"
    )
    responses = db.relationship("ComplaintResponse", back_populates="admin")
    notifications = db.relationship(
        "Notification", back_populates="user", cascade="all, delete-orphan"
    )

    def set_password(self, raw_password: str) -> None:
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password: str) -> bool:
        return check_password_hash(self.password_hash, raw_password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "role": self.role,
            "department": self.department,
            "register_number": self.register_number,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
