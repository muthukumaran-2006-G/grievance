import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


def _require(name: str, default: str = None) -> str:
    """Fetch an env var, allowing a default only for non-secret/dev fallbacks."""
    value = os.environ.get(name, default)
    return value


class Config:
    # ---- Core ----
    SECRET_KEY = _require("SECRET_KEY", "dev-secret-key-change-me")
    DEBUG = os.environ.get("FLASK_DEBUG", "0") == "1"

    # ---- Database ----
    DB_HOST = _require("DB_HOST", "localhost")
    DB_PORT = _require("DB_PORT", "3306")
    DB_NAME = _require("DB_NAME", "grievance_management")
    DB_USER = _require("DB_USER", "root")
    DB_PASSWORD = _require("DB_PASSWORD", "")

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 280,
    }

    # ---- JWT ----
    JWT_SECRET_KEY = _require("JWT_SECRET_KEY", "dev-jwt-secret-change-me")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        minutes=int(os.environ.get("JWT_ACCESS_TOKEN_EXPIRES_MINUTES", "60"))
    )
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(
        days=int(os.environ.get("JWT_REFRESH_TOKEN_EXPIRES_DAYS", "7"))
    )
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_ERROR_MESSAGE_KEY = "message"

    # ---- CORS ----
    FRONTEND_ORIGIN = _require("FRONTEND_ORIGIN", "http://localhost:5173")

    # ---- Uploads ----
    UPLOAD_FOLDER = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        os.environ.get("UPLOAD_FOLDER", "uploads"),
    )
    MAX_CONTENT_LENGTH = int(os.environ.get("MAX_CONTENT_LENGTH_MB", "10")) * 1024 * 1024
    ALLOWED_EXTENSIONS = {
        "pdf", "doc", "docx", "png", "jpg", "jpeg", "gif", "txt", "xlsx", "xls", "csv"
    }
