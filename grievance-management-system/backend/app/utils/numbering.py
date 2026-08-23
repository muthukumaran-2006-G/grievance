from datetime import datetime, timezone
from sqlalchemy import func
from app.extensions import db
from app.models import Complaint


def generate_complaint_number() -> str:
    """
    Generates a unique complaint number in the form GRV-<year>-<sequence>.
    Uses a row-level approach with a retry loop to avoid collisions under
    concurrent submissions (the unique constraint on complaint_number is the
    final safety net).
    """
    year = datetime.now(timezone.utc).year
    prefix = f"GRV-{year}-"

    count = (
        db.session.query(func.count(Complaint.id))
        .filter(Complaint.complaint_number.like(f"{prefix}%"))
        .scalar()
    )
    sequence = count + 1

    while True:
        candidate = f"{prefix}{sequence:04d}"
        exists = db.session.query(
            Complaint.query.filter_by(complaint_number=candidate).exists()
        ).scalar()
        if not exists:
            return candidate
        sequence += 1
