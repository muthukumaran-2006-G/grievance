# Roever Engineering College — Grievance Management System

A full-stack grievance management portal for students, faculty, workers/staff,
and parents to submit grievances to the Principal or the Grievance Redressal
Team, track their status, and receive responses — with separate, permission-
scoped dashboards for each administrator role.

**Stack:** React (Vite) frontend, Flask REST API backend, MySQL database,
JWT authentication, Role-Based Access Control enforced server-side.

---

## 1. Project Structure

```
grievance-management-system/
├── frontend/                # React + Vite SPA
│   └── src/
│       ├── components/      # Shared UI: Sidebar, Topbar, StatusStamp, Modal...
│       ├── pages/           # Route-level pages (Login, Dashboard, etc.)
│       ├── layouts/         # DashboardLayout (sidebar + topbar shell)
│       ├── services/        # Axios API clients per resource
│       ├── context/         # AuthContext, ToastContext
│       ├── utils/           # constants, formatters
│       ├── App.jsx
│       └── main.jsx
├── backend/                 # Flask REST API
│   ├── app/
│   │   ├── models/          # SQLAlchemy models (User, Complaint, ...)
│   │   ├── routes/          # Blueprints: auth, users, complaints, admin, ...
│   │   ├── middleware/      # RBAC decorators (role_required, get_current_user)
│   │   ├── utils/           # complaint numbering, uploads, notifications
│   │   └── __init__.py      # App factory
│   ├── uploads/              # Uploaded attachments (created automatically)
│   ├── config.py
│   ├── run.py
│   ├── seed.py               # Seeds the 6 demo accounts
│   ├── requirements.txt
│   └── .env.example
├── database/
│   ├── schema.sql            # Reference DDL (matches the SQLAlchemy models)
│   └── seed_data.sql         # Reference-only SQL seed (use seed.py instead)
└── README.md
```

---

## 2. Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- MySQL 8.0+ (or MariaDB 10.6+) running locally or reachable over the network

---

## 3. Database Setup

Log into MySQL and create a database and user (or reuse an existing account):

```sql
CREATE DATABASE grievance_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'grievance_user'@'localhost' IDENTIFIED BY 'change_this_password';
GRANT ALL PRIVILEGES ON grievance_management.* TO 'grievance_user'@'localhost';
FLUSH PRIVILEGES;
```

You do not need to run `schema.sql` manually. The backend creates all tables
automatically on first run via `db.create_all()` (see step 4 below).
`database/schema.sql` is provided for reference, documentation, and manual
setups only, and matches the SQLAlchemy models exactly.

---

## 4. Backend Setup (Flask API)

```bash
cd backend

# 1. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables
cp .env.example .env
```

Now edit `backend/.env` and set real values. Never commit this file.

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=grievance_management
DB_USER=grievance_user
DB_PASSWORD=change_this_password

SECRET_KEY=<generate a long random string>
JWT_SECRET_KEY=<generate a different long random string>

FRONTEND_ORIGIN=http://localhost:5173
```

Generate strong random secrets with:

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Then create the tables and seed demo users:

```bash
# 4. Create tables and seed 6 demo accounts (one per role)
python seed.py
```

Run the API:

```bash
# 5. Start the Flask server
python run.py
```

The API is now available at http://localhost:5000. Verify it is up:

```bash
curl http://localhost:5000/api/health
```

### Seeded demo accounts

All seeded accounts share the password `Roever@123`. Change this immediately
in any real deployment.

| Role            | Email                       |
|-----------------|------------------------------|
| Student         | student@roever.edu.in        |
| Faculty         | faculty@roever.edu.in        |
| Worker/Staff    | worker@roever.edu.in         |
| Parent          | parent@roever.edu.in         |
| Principal       | principal@roever.edu.in      |
| Grievance Team  | grievance@roever.edu.in      |

---

## 5. Frontend Setup (React + Vite)

Open a second terminal:

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Edit .env if your backend isn't on the default http://localhost:5000/api

# 3. Start the dev server
npm run dev
```

The app is now available at http://localhost:5173. Sign in with any of the
seeded accounts above.

To build a production bundle:

```bash
npm run build      # outputs to frontend/dist/
npm run preview    # preview the production build locally
```

---

## 6. Running Both Together

You need three things running during development:

1. MySQL server (already running as a service)
2. Backend: `cd backend && source venv/bin/activate && python run.py` (port 5000)
3. Frontend: `cd frontend && npm run dev` (port 5173)

The frontend calls the backend at the URL in `frontend/.env`
(`VITE_API_BASE_URL`), and the backend only accepts cross-origin requests
from the URL in `backend/.env` (`FRONTEND_ORIGIN`). Keep these in sync.

---

## 7. How the System Works

1. A Student / Faculty / Worker / Parent logs in and lands on their
   dashboard, showing total, pending, under review, resolved, and rejected
   counts plus recent complaints.
2. They open Submit Grievance, fill in title, description, category,
   priority, an optional attachment, and choose a receiver: Principal or
   Grievance Team.
3. On submit, the backend generates a unique complaint number
   (`GRV-2026-0001`, ...), stores the complaint in MySQL, records the first
   status-history entry, and creates a notification for every active user in
   the chosen admin role.
4. The chosen administrator (Principal or Grievance Team) sees the complaint
   in their dashboard and complaints list, and only theirs. This scoping is
   enforced in the backend (`app/routes/admin.py`), not just hidden in the
   UI: an admin who guesses another complaint's ID that isn't assigned to
   their role gets an HTTP 403.
5. The admin opens the complaint, can update its status (Pending, Under
   Review, In Progress, Resolved, Rejected) and post a response. Both
   actions notify the original submitter and append to the status history.
6. The submitter tracks progress from My Complaints, opens the complaint to
   see the full timeline, category, priority, attachments, and the admin's
   response.

### Role-based access control

- Every protected endpoint requires a valid JWT (Flask-JWT-Extended).
- The JWT carries the user's role as a claim, set at login from the
  database. It is never taken from the frontend.
- `role_required(*roles)` (in `app/middleware/auth.py`) is applied to every
  route and returns 403 if the caller's role isn't in the allowed list.
- Admin complaint routes additionally filter by `Complaint.assigned_to`, so
  the Principal cannot read Grievance Team complaints and vice versa, even
  with a valid Principal token and a complaint ID.

---

## 8. API Reference

All responses follow a consistent shape:

```json
{ "success": true, "message": "...", "data": { } }
{ "success": false, "message": "...", "errors": { "field": "..." } }
```

| Method | Endpoint                                   | Access                          |
|--------|---------------------------------------------|----------------------------------|
| POST   | /api/auth/login                              | Public                           |
| POST   | /api/auth/refresh                            | Valid refresh token              |
| POST   | /api/auth/logout                             | Authenticated                    |
| GET    | /api/auth/me                                 | Authenticated                    |
| GET    | /api/users/profile                           | Authenticated                    |
| PUT    | /api/users/profile                           | Authenticated                    |
| POST   | /api/complaints                              | Student/Faculty/Worker/Parent    |
| GET    | /api/complaints/my                           | Student/Faculty/Worker/Parent    |
| GET    | /api/complaints/id                           | Owner or assigned admin          |
| GET    | /api/complaints/attachments/file             | Owner or assigned admin          |
| GET    | /api/dashboard/summary                       | Student/Faculty/Worker/Parent    |
| GET    | /api/admin/complaints                        | Principal / Grievance Team       |
| GET    | /api/admin/complaints/id                     | Principal / Grievance Team (own) |
| PUT    | /api/admin/complaints/id/status               | Principal / Grievance Team (own) |
| POST   | /api/admin/complaints/id/response             | Principal / Grievance Team (own) |
| GET    | /api/admin/stats                             | Principal / Grievance Team       |
| GET    | /api/notifications                           | Authenticated                    |
| PUT    | /api/notifications/id/read                    | Authenticated (owner)            |
| PUT    | /api/notifications/read-all                  | Authenticated                    |
| GET    | /api/{role}/me (student, faculty, worker, parent, principal, grievance-team) | Matching role only |

---

## 9. Security Notes

- Passwords are hashed with Werkzeug's `generate_password_hash` (PBKDF2).
  They are never stored in plain text.
- JWT secret, database credentials, and Flask secret key are all read from
  environment variables (`.env`), never hard-coded.
- File uploads are validated by extension, renamed to a random UUID-based
  filename before saving (prevents path traversal and executable uploads),
  and served back only to the complaint's owner or the assigned admin.
- SQL injection is mitigated by using SQLAlchemy's ORM/query layer
  throughout. There is no raw string-interpolated SQL.
- CORS is restricted to the configured `FRONTEND_ORIGIN`.
- All error responses use consistent JSON and appropriate HTTP status codes
  (400, 401, 403, 404, 413, 422, 500).

Before deploying to production:
- Change every seeded account's password.
- Generate fresh `SECRET_KEY` and `JWT_SECRET_KEY` values.
- Set `FLASK_DEBUG=0`.
- Serve over HTTPS and set a production-grade `FRONTEND_ORIGIN`.
- Put the Flask app behind a production WSGI server (e.g. gunicorn) rather
  than `python run.py`.

---

## 10. Troubleshooting

- Access denied for user or cannot connect to MySQL: double check DB_HOST,
  DB_USER, DB_PASSWORD, DB_NAME in `backend/.env`, and that the MySQL
  service is running and reachable on DB_PORT.
- Frontend shows network errors: confirm the backend is running on the port
  referenced by VITE_API_BASE_URL in `frontend/.env`, and that
  FRONTEND_ORIGIN in `backend/.env` matches the URL you're loading the
  frontend from, including port.
- 401 immediately after login: check your system clock, since JWT expiry
  validation is time-sensitive.
- File upload fails: check the file extension is in the allowed list (pdf,
  doc, docx, png, jpg, jpeg, gif, txt, xlsx, xls, csv) and under the
  configured size limit (10 MB by default).
