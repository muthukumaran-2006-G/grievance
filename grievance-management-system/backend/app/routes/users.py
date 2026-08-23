from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from app.extensions import db
from app.middleware.auth import get_current_user
from app.utils.responses import success, error

users_bp = Blueprint("users", __name__, url_prefix="/api/users")


@users_bp.get("/profile")
@jwt_required()
def get_profile():
    user = get_current_user()
    if not user:
        return error("User not found.", 404)
    return success(user.to_dict())


@users_bp.put("/profile")
@jwt_required()
def update_profile():
    user = get_current_user()
    if not user:
        return error("User not found.", 404)

    data = request.get_json(silent=True) or {}

    name = data.get("name")
    phone = data.get("phone")
    department = data.get("department")
    new_password = data.get("new_password")
    current_password = data.get("current_password")

    if name:
        user.name = name.strip()
    if phone is not None:
        user.phone = phone.strip()
    if department is not None:
        user.department = department.strip()

    if new_password:
        if not current_password or not user.check_password(current_password):
            return error("Current password is incorrect.", 400)
        if len(new_password) < 6:
            return error("New password must be at least 6 characters.", 400)
        user.set_password(new_password)

    db.session.commit()
    return success(user.to_dict(), "Profile updated successfully.")
