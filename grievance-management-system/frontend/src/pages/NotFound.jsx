import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", background: "var(--paper)", gap: 14, padding: 20,
    }}>
      <h1 style={{ fontSize: 60, color: "var(--ledger-800)" }}>404</h1>
      <p style={{ color: "var(--text-muted)" }}>The page you're looking for doesn't exist.</p>
      <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
    </div>
  );
}
