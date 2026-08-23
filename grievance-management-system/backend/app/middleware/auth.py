from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt, get_jwt_identity

from app.models import User


def role_required(*allowed_roles):
    """
    Decorator that verifies a valid JWT is present AND that the user's role
    (read from the JWT claims, set at login) is one of allowed_roles.
    This enforces authorization on the backend regardless of what the
    frontend shows or hides.
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            role = claims.get("role")
            if role not in allowed_roles:
                return jsonify({
                    "success": False,
                    "message": "You are not authorized to access this resource."
                }), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def any_authenticated(fn):
    """Just requires a valid JWT, any role."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        return fn(*args, **kwargs)
    return wrapper


def get_current_user():
    """Fetch the full User row for the identity in the current JWT."""
    user_id = get_jwt_identity()
    return User.query.get(int(user_id))
