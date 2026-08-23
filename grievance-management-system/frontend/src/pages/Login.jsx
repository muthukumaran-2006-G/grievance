import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../services/api";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "../utils/constants";
import { IconGavel } from "../components/icons";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      const redirectTo = location.state?.from || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div>
          <div className="auth-seal"><IconGavel width={22} height={22} /></div>
          <div className="auth-eyebrow">Grievance Redressal System</div>
          <h1>Every complaint on record. Every response accountable.</h1>
          <p className="auth-tagline">
            A single portal for students, faculty, staff and parents of Roever
            Engineering College to raise, track, and resolve grievances with
            the Principal's office and the Grievance Redressal Cell.
          </p>
          <div className="auth-role-list">
            <span className="auth-role-chip">Student</span>
            <span className="auth-role-chip">Faculty</span>
            <span className="auth-role-chip">Worker / Staff</span>
            <span className="auth-role-chip">Parent</span>
            <span className="auth-role-chip">Principal</span>
            <span className="auth-role-chip">Grievance Team</span>
          </div>
        </div>
        <p className="auth-footer-note">© {new Date().getFullYear()} Roever Engineering College. All rights reserved.</p>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-card">
          <h2>Sign in</h2>
          <p className="auth-sub">Enter your institutional credentials to access your dashboard.</p>

          {error && <div className="auth-alert">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="field-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="field-input"
                placeholder="you@roever.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="field-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <details className="demo-creds">
            <summary>Demo accounts (development seed data)</summary>
            <table>
              <tbody>
                {DEMO_ACCOUNTS.map((acc) => (
                  <tr key={acc.email}>
                    <td>{acc.role}</td>
                    <td>{acc.email}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2} style={{ paddingTop: 8, color: "var(--text-primary)" }}>
                    Password for all: <strong>{DEMO_PASSWORD}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </details>
        </div>
      </div>
    </div>
  );
}
