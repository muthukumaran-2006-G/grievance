"""
Seeds the database with one sample user per role for local testing / demo.

Usage:
    cd backend
    python seed.py

IMPORTANT: The sample password below is for local development/demo only.
Change all seeded passwords immediately in any staging or production environment.
"""
from app import create_app
from app.extensions import db
from app.models import User, Role

SAMPLE_PASSWORD = "Roever@123"  # CHANGE IN PRODUCTION

SEED_USERS = [
    {
        "name": "Arun Kumar", "email": "student@roever.edu.in", "phone": "9000000001",
        "role": Role.STUDENT, "department": "Computer Science and Engineering",
        "register_number": "REC21CS001",
    },
    {
        "name": "Dr. Meena Sundaram", "email": "faculty@roever.edu.in", "phone": "9000000002",
        "role": Role.FACULTY, "department": "Computer Science and Engineering",
        "register_number": "EMP1001",
    },
    {
        "name": "Ravi Shankar", "email": "worker@roever.edu.in", "phone": "9000000003",
        "role": Role.WORKER, "department": "Maintenance",
        "register_number": "EMP2001",
    },
    {
        "name": "Lakshmi Narayanan", "email": "parent@roever.edu.in", "phone": "9000000004",
        "role": Role.PARENT, "department": None,
        "register_number": None,
    },
    {
        "name": "Dr. S. Venkatesan", "email": "principal@roever.edu.in", "phone": "9000000005",
        "role": Role.PRINCIPAL, "department": "Administration",
        "register_number": "EMP0001",
    },
    {
        "name": "Grievance Redressal Cell", "email": "grievance@roever.edu.in", "phone": "9000000006",
        "role": Role.GRIEVANCE_TEAM, "department": "Administration",
        "register_number": "EMP0002",
    },
]


def run_seed():
    app = create_app()
    with app.app_context():
        db.create_all()

        created, skipped = 0, 0
        for entry in SEED_USERS:
            existing = User.query.filter_by(email=entry["email"]).first()
            if existing:
                skipped += 1
                continue

            user = User(
                name=entry["name"],
                email=entry["email"],
                phone=entry["phone"],
                role=entry["role"],
                department=entry["department"],
                register_number=entry["register_number"],
            )
            user.set_password(SAMPLE_PASSWORD)
            db.session.add(user)
            created += 1

        db.session.commit()
        print(f"Seed complete. Created: {created}, already existed: {skipped}")
        print(f"Sample password for all seeded accounts: {SAMPLE_PASSWORD}")
        print("CHANGE THIS PASSWORD before using in any real/production environment.")


if __name__ == "__main__":
    run_seed()
