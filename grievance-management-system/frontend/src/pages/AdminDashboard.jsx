import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Topbar from "../components/Topbar";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusStamp from "../components/StatusStamp";
import PriorityTag from "../components/PriorityTag";
import BarChart from "../components/BarChart";
import EmptyState from "../components/EmptyState";
import { fetchAdminStats, fetchAdminComplaints } from "../services/adminService";
import { useAuth } from "../context/AuthContext";
import { ROLE_LABELS } from "../utils/constants";
import { formatDate } from "../utils/format";
import { extractErrorMessage } from "../services/api";
import { useToast } from "../context/ToastContext";

const STAT_ACCENTS = {
  "Pending": "#5b6478",
  "Under Review": "#2c5282",
  "In Progress": "#a5751f",
  "Resolved": "#2f6b4f",
  "Rejected": "#a5372d",
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const [statsData, complaintsData] = await Promise.all([
          fetchAdminStats(),
          fetchAdminComplaints(),
        ]);
        setStats(statsData);
        setRecent(complaintsData.slice(0, 6));
      } catch (err) {
        showToast(extractErrorMessage(err), "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [showToast]);

  return (
    <DashboardLayout
      topbarSlot={<Topbar title={`${ROLE_LABELS[user.role]} Dashboard`} subtitle="Complaints assigned to your office" />}
    >
      {loading ? (
        <LoadingSpinner label="Loading dashboard…" />
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card" style={{ "--accent": "#b8863b" }}>
              <div className="stat-card-label">Total Received</div>
              <div className="stat-card-value">{stats.total}</div>
            </div>
            {Object.entries(stats.by_status).map(([status, count]) => (
              <div key={status} className="stat-card" style={{ "--accent": STAT_ACCENTS[status] }}>
                <div className="stat-card-label">{status}</div>
                <div className="stat-card-value">{count}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 26 }} className="admin-chart-grid">
            <div className="card" style={{ padding: "22px 24px" }}>
              <h3 style={{ fontSize: 15, marginBottom: 18 }}>Complaints by Status</h3>
              <BarChart
                data={Object.entries(stats.by_status).map(([label, value]) => ({
                  label, value, color: STAT_ACCENTS[label],
                }))}
              />
            </div>
            <div className="card" style={{ padding: "22px 24px" }}>
              <h3 style={{ fontSize: 15, marginBottom: 18 }}>Complaints by Category</h3>
              {Object.keys(stats.by_category).length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No data yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {Object.entries(stats.by_category)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, count]) => {
                      const max = Math.max(...Object.values(stats.by_category));
                      return (
                        <div key={cat}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                            <span>{cat}</span>
                            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{count}</span>
                          </div>
                          <div style={{ height: 7, background: "var(--border-soft)", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${(count / max) * 100}%`, background: "var(--brass)" }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          <div className="page-header">
            <div>
              <h2>Recent Complaints</h2>
              <p>Latest grievances awaiting your attention</p>
            </div>
            <button className="btn btn-outline" onClick={() => navigate("/complaints")}>
              View All
            </button>
          </div>

          {recent.length === 0 ? (
            <div className="card">
              <EmptyState title="No complaints yet" description="Complaints assigned to your office will appear here." />
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Complaint ID</th>
                    <th>Title</th>
                    <th>Filed By</th>
                    <th>Priority</th>
                    <th>Submitted</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((c) => (
                    <tr key={c.id} onClick={() => navigate(`/complaints/${c.id}`)}>
                      <td className="complaint-id-cell">{c.complaint_number}</td>
                      <td>{c.title}</td>
                      <td>{c.user_name}</td>
                      <td><PriorityTag priority={c.priority} /></td>
                      <td>{formatDate(c.created_at)}</td>
                      <td><StatusStamp status={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      <style>{`
        @media (max-width: 900px) {
          .admin-chart-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </DashboardLayout>
  );
}
