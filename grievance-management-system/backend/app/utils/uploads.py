import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app


def allowed_file(filename: str) -> bool:
    if "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in current_app.config["ALLOWED_EXTENSIONS"]


def save_attachment(file_storage):
    """
    Validates and saves an uploaded file safely:
    - Rejects disallowed / executable extensions
    - Generates a random safe filename (prevents path traversal & collisions)
    - Saves inside the configured upload folder
    Returns (stored_relative_path, original_filename) or raises ValueError.
    """
    if file_storage is None or file_storage.filename == "":
        return None, None

    original_name = secure_filename(file_storage.filename)
    if not original_name:
        raise ValueError("Invalid file name.")

    if not allowed_file(original_name):
        raise ValueError("This file type is not allowed.")

    ext = original_name.rsplit(".", 1)[1].lower()
    safe_name = f"{uuid.uuid4().hex}.{ext}"

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_folder, exist_ok=True)

    destination = os.path.join(upload_folder, safe_name)
    file_storage.save(destination)

    return safe_name, original_name
