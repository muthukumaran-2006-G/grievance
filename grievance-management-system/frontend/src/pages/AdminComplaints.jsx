import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Topbar from "../components/Topbar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import StatusStamp from "../components/StatusStamp";
import PriorityTag from "../components/PriorityTag";
import { IconSearch } from "../components/icons";
import { fetchAdminComplaints } from "../services/adminService";
import { CATEGORIES, PRIORITIES } from "../utils/constants";
import { formatDate } from "../utils/format";
import { extractErrorMessage } from "../services/api";
import { useToast } from "../context/ToastContext";

const STATUS_FILTERS = ["All", "Pending", "Under Review", "In Progress", "Resolved", "Rejected"];

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminComplaints({ status, priority, category, search });
      setComplaints(data);
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  }, [status, priority, category, search, showToast]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <DashboardLayout topbarSlot={<Topbar title="Complaints" subtitle="All grievances assigned to your office" />}>
      <div className="toolbar">
        <div className="search-input-wrap">
          <IconSearch />
          <input
            className="field-input"
            placeholder="Search by complaint ID or title"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="field-select" style={{ width: 160 }} value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="All">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="field-select" style={{ width: 170 }} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="filter-chip-row" style={{ marginBottom: 18 }}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-chip ${status === f ? "active" : ""}`}
            onClick={() => setStatus(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading complaints…" />
      ) : complaints.length === 0 ? (
        <div className="card">
          <EmptyState title="No complaints found" description="Try adjusting your filters or search term." />
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Title</th>
                <th>Filed By</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Submitted</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id} onClick={() => navigate(`/complaints/${c.id}`)}>
                  <td className="complaint-id-cell">{c.complaint_number}</td>
                  <td>{c.title}</td>
                  <td style={{ textTransform: "capitalize" }}>{c.user_name} <span style={{ color: "var(--text-muted)", fontSize: 11.5 }}>({c.user_role})</span></td>
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
    </DashboardLayout>
  );
}
