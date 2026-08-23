from flask import Blueprint, request
from flask_jwt_extended import (
    create_access_token, create_refresh_token, jwt_required,
    get_jwt_identity, get_jwt
)

from app.extensions import db
from app.models import User, Role
from app.utils.responses import success, error

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return error("Email and password are required.", 400)

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return error("Invalid email or password.", 401)

    if not user.is_active:
        return error("This account has been deactivated. Contact the administration.", 403)

    additional_claims = {"role": user.role, "name": user.name}
    access_token = create_access_token(
        identity=str(user.id), additional_claims=additional_claims
    )
    refresh_token = create_refresh_token(
        identity=str(user.id), additional_claims=additional_claims
    )

    return success({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user.to_dict(),
    }, "Login successful.")


@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    claims = get_jwt()
    additional_claims = {"role": claims.get("role"), "name": claims.get("name")}
    new_access_token = create_access_token(
        identity=identity, additional_claims=additional_claims
    )
    return success({"access_token": new_access_token}, "Token refreshed.")


@auth_bp.post("/logout")
@jwt_required()
def logout():
    # Stateless JWT: logout is handled client-side by discarding the token.
    # Endpoint kept for a consistent API surface / future token-blocklist support.
    return success(message="Logged out successfully.")


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return error("User not found.", 404)
    return success(user.to_dict())
