import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Topbar from "../components/Topbar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import StatusStamp from "../components/StatusStamp";
import PriorityTag from "../components/PriorityTag";
import { IconSearch } from "../components/icons";
import { fetchMyComplaints } from "../services/complaintService";
import { formatDate } from "../utils/format";
import { extractErrorMessage } from "../services/api";
import { useToast } from "../context/ToastContext";

const FILTERS = ["All", "Pending", "Under Review", "In Progress", "Resolved", "Rejected"];

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMyComplaints({ status, search });
      setComplaints(data);
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  }, [status, search, showToast]);

  useEffect(() => {
    const timeout = setTimeout(load, 250); // debounce search
    return () => clearTimeout(timeout);
  }, [load]);

  return (
    <DashboardLayout topbarSlot={<Topbar title="My Complaints" subtitle="Track and review everything you've submitted" />}>
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
      </div>

      <div className="filter-chip-row" style={{ marginBottom: 18 }}>
        {FILTERS.map((f) => (
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
          <EmptyState
            title="No complaints found"
            description="Try a different filter or search term, or submit a new grievance."
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
                <th>Receiver</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id} onClick={() => navigate(`/complaints/${c.id}`)}>
                  <td className="complaint-id-cell">{c.complaint_number}</td>
                  <td>{c.title}</td>
                  <td>{c.category}</td>
                  <td><PriorityTag priority={c.priority} /></td>
                  <td>{formatDate(c.created_at)}</td>
                  <td style={{ textTransform: "capitalize" }}>{c.assigned_to.replace("_", " ")}</td>
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
