"""
Lightweight role-namespaced endpoints (/api/student/me, /api/faculty/me, etc.)
as specified in the project brief. These sit alongside the main resource-based
APIs (/api/complaints, /api/admin/*) and simply confirm identity + role for a
given namespace, each protected so only that exact role may call it.
"""
from flask import Blueprint
from app.middleware.auth import get_current_user, role_required
from app.models import Role
from app.utils.responses import success

student_bp = Blueprint("student_ns", __name__, url_prefix="/api/student")
faculty_bp = Blueprint("faculty_ns", __name__, url_prefix="/api/faculty")
worker_bp = Blueprint("worker_ns", __name__, url_prefix="/api/worker")
parent_bp = Blueprint("parent_ns", __name__, url_prefix="/api/parent")
principal_bp = Blueprint("principal_ns", __name__, url_prefix="/api/principal")
grievance_team_bp = Blueprint("grievance_team_ns", __name__, url_prefix="/api/grievance-team")


def _make_me_route(blueprint: Blueprint, role: str):
    @blueprint.get("/me", endpoint=f"{role}_me")
    @role_required(role)
    def me():
        user = get_current_user()
        return success(user.to_dict())


_make_me_route(student_bp, Role.STUDENT)
_make_me_route(faculty_bp, Role.FACULTY)
_make_me_route(worker_bp, Role.WORKER)
_make_me_route(parent_bp, Role.PARENT)
_make_me_route(principal_bp, Role.PRINCIPAL)
_make_me_route(grievance_team_bp, Role.GRIEVANCE_TEAM)

ALL_ROLE_BLUEPRINTS = [
    student_bp, faculty_bp, worker_bp, parent_bp, principal_bp, grievance_team_bp
]
