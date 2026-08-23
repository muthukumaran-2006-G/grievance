import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Topbar from "../components/Topbar";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusStamp from "../components/StatusStamp";
import PriorityTag from "../components/PriorityTag";
import EmptyState from "../components/EmptyState";
import { fetchDashboardSummary } from "../services/complaintService";
import { useAuth } from "../context/AuthContext";
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

export default function ApplicantDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchDashboardSummary();
        setSummary(data);
      } catch (err) {
        showToast(extractErrorMessage(err), "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [showToast]);

  return (
    <DashboardLayout
      topbarSlot={<Topbar title="Dashboard" subtitle={`Welcome back, ${user.name.split(" ")[0]}`} />}
    >
      {loading ? (
        <LoadingSpinner label="Loading your dashboard…" />
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card" style={{ "--accent": "#b8863b" }}>
              <div className="stat-card-label">Total Complaints</div>
              <div className="stat-card-value">{summary.total}</div>
            </div>
            {Object.entries(summary.by_status).map(([status, count]) => (
              <div key={status} className="stat-card" style={{ "--accent": STAT_ACCENTS[status] }}>
                <div className="stat-card-label">{status}</div>
                <div className="stat-card-value">{count}</div>
              </div>
            ))}
          </div>

          <div className="page-header">
            <div>
              <h2>Recent Complaints</h2>
              <p>Your most recently submitted grievances</p>
            </div>
            <button className="btn btn-accent" onClick={() => navigate("/submit-grievance")}>
              Submit New Grievance
            </button>
          </div>

          {summary.recent_complaints.length === 0 ? (
            <div className="card">
              <EmptyState
                title="No grievances yet"
                description="Once you submit a grievance, it will appear here for tracking."
              />
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Complaint ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Submitted</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recent_complaints.map((c) => (
                    <tr key={c.id} onClick={() => navigate(`/complaints/${c.id}`)}>
                      <td className="complaint-id-cell">{c.complaint_number}</td>
                      <td>{c.title}</td>
                      <td>{c.category}</td>
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
    </DashboardLayout>
  );
}
