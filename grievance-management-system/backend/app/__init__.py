import os
from flask import Flask
from sqlalchemy.exc import SQLAlchemyError

from config import Config
from app.extensions import db, jwt, cors
from app.utils.responses import error


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # ---- Extensions ----
    db.init_app(app)
    jwt.init_app(app)

    # ---- CORS ----
    cors.init_app(
        app,
        resources={
            r"/*": {
                "origins": [
                    "https://grievance-hruf.vercel.app"
                ]
            }
        },
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
    )

    # ---- Blueprints ----
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.complaints import complaints_bp
    from app.routes.admin import admin_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.notifications import notifications_bp
    from app.routes.role_namespaces import ALL_ROLE_BLUEPRINTS

    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(complaints_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(notifications_bp)

    for bp in ALL_ROLE_BLUEPRINTS:
        app.register_blueprint(bp)

    # ---- JWT error handlers ----
    @jwt.unauthorized_loader
    def unauthorized_callback(reason):
        return error("Authentication token is missing.", 401)

    @jwt.invalid_token_loader
    def invalid_token_callback(reason):
        return error("Authentication token is invalid.", 401)

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return error(
            "Authentication token has expired. Please log in again.",
            401
        )

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return error(
            "Authentication token has been revoked.",
            401
        )

    # ---- General error handlers ----
    @app.errorhandler(404)
    def not_found(e):
        return error(
            "The requested resource was not found.",
            404
        )

    @app.errorhandler(405)
    def method_not_allowed(e):
        return error(
            "Method not allowed for this endpoint.",
            405
        )

    @app.errorhandler(413)
    def too_large(e):
        return error(
            "Uploaded file is too large.",
            413
        )

    @app.errorhandler(SQLAlchemyError)
    def handle_db_error(e):
        db.session.rollback()
        app.logger.exception("Database error")
        return error(
            "A database error occurred. Please try again later.",
            500
        )

    @app.errorhandler(Exception)
    def handle_unexpected_error(e):
        db.session.rollback()
        app.logger.exception("Unexpected error")
        return error(
            "An unexpected server error occurred.",
            500
        )

    # ---- Health check ----
    @app.get("/api/health")
    def health():
        return {
            "status": "ok",
            "service": "grievance-management-backend"
        }

    return app
