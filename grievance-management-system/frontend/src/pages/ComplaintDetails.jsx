import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Topbar from "../components/Topbar";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusStamp from "../components/StatusStamp";
import PriorityTag from "../components/PriorityTag";
import { IconPaperclip, IconChevronRight } from "../components/icons";
import { fetchComplaintById, attachmentUrl } from "../services/complaintService";
import {
  fetchAdminComplaintById, updateComplaintStatus, addComplaintResponse,
} from "../services/adminService";
import { useAuth } from "../context/AuthContext";
import { ADMIN_ROLES, STATUSES } from "../utils/constants";
import { formatDateTime } from "../utils/format";
import { extractErrorMessage } from "../services/api";
import { useToast } from "../context/ToastContext";

export default function ComplaintDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = ADMIN_ROLES.includes(user.role);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusValue, setStatusValue] = useState("");
  const [remarks, setRemarks] = useState("");
  const [responseText, setResponseText] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingResponse, setSavingResponse] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = isAdmin ? await fetchAdminComplaintById(id) : await fetchComplaintById(id);
      setComplaint(data);
      setStatusValue(data.status);
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [id, isAdmin, navigate, showToast]);

  useEffect(() => { load(); }, [load]);

  async function handleStatusUpdate() {
    setSavingStatus(true);
    try {
      const updated = await updateComplaintStatus(id, statusValue, remarks);
      setComplaint(updated);
      setRemarks("");
      showToast("Status updated.", "success");
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleAddResponse() {
    if (!responseText.trim()) return;
    setSavingResponse(true);
    try {
      const updated = await addComplaintResponse(id, responseText);
      setComplaint(updated);
      setResponseText("");
      showToast("Response added.", "success");
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setSavingResponse(false);
    }
  }

  if (loading || !complaint) {
    return (
      <DashboardLayout topbarSlot={<Topbar title="Complaint Details" />}>
        <LoadingSpinner label="Loading complaint…" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      topbarSlot={<Topbar title={complaint.complaint_number} subtitle={complaint.title} />}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, alignItems: "start" }}
           className="complaint-details-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Main complaint card */}
          <div className="card" style={{ padding: "24px 26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
                  {complaint.complaint_number}
                </div>
                <h2 style={{ fontSize: 20 }}>{complaint.title}</h2>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <PriorityTag priority={complaint.priority} />
                <StatusStamp status={complaint.status} />
              </div>
            </div>

            <p style={{ lineHeight: 1.65, color: "var(--text-primary)", marginBottom: 20 }}>
              {complaint.description}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, paddingTop: 16, borderTop: "1px solid var(--border-soft)" }}>
              <MetaField label="Category" value={complaint.category} />
              <MetaField label="Filed by" value={`${complaint.user_name} (${complaint.user_role})`} />
              <MetaField label="Receiver" value={complaint.assigned_to.replace("_", " ")} capitalize />
              <MetaField label="Submitted" value={formatDateTime(complaint.created_at)} />
              <MetaField label="Last Updated" value={formatDateTime(complaint.updated_at)} />
              {complaint.resolved_at && <MetaField label="Resolved" value={formatDateTime(complaint.resolved_at)} />}
            </div>

            {complaint.attachment_path && (
              <a
                href={attachmentUrl(complaint.attachment_path)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm"
                style={{ marginTop: 18 }}
              >
                <IconPaperclip width={14} height={14} />
                {complaint.attachment_original_name || "Download attachment"}
              </a>
            )}
          </div>

          {/* Responses */}
          <div className="card" style={{ padding: "24px 26px" }}>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Administrator Responses</h3>
            {complaint.responses.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 13.5 }}>No responses yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {complaint.responses.map((r) => (
                  <div key={r.id} style={{ background: "#faf8f2", border: "1px solid var(--border-soft)", borderRadius: "var(--radius-md)", padding: "13px 15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, textTransform: "capitalize" }}>{r.admin_name} — {r.admin_role.replace("_", " ")}</span>
                      <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{formatDateTime(r.created_at)}</span>
                    </div>
                    <p style={{ fontSize: 13.5, lineHeight: 1.55 }}>{r.response}</p>
                  </div>
                ))}
              </div>
            )}

            {isAdmin && (
              <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--border-soft)" }}>
                <label className="field-label" htmlFor="response">Add a response</label>
                <textarea
                  id="response"
                  className="field-textarea"
                  placeholder="Write a response visible to the complainant…"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  style={{ minHeight: 90 }}
                />
                <button
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: 10 }}
                  disabled={savingResponse || !responseText.trim()}
                  onClick={handleAddResponse}
                >
                  {savingResponse ? "Posting…" : "Post Response"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Admin status control */}
          {isAdmin && (
            <div className="card" style={{ padding: "22px 24px" }}>
              <h3 style={{ fontSize: 15, marginBottom: 14 }}>Update Status</h3>
              <div className="field-group">
                <label className="field-label" htmlFor="status">Status</label>
                <select
                  id="status"
                  className="field-select"
                  value={statusValue}
                  onChange={(e) => setStatusValue(e.target.value)}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Remarks <span className="optional">(optional)</span></label>
                <textarea
                  className="field-textarea"
                  style={{ minHeight: 70 }}
                  placeholder="Internal note about this status change"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
              <button
                className="btn btn-accent btn-full"
                disabled={savingStatus || statusValue === complaint.status && !remarks}
                onClick={handleStatusUpdate}
              >
                {savingStatus ? "Updating…" : "Update Status"}
              </button>
            </div>
          )}

          {/* Timeline */}
          <div className="card" style={{ padding: "22px 24px" }}>
            <h3 style={{ fontSize: 15, marginBottom: 16 }}>Status History</h3>
            <div className="timeline">
              {complaint.status_history.map((h, idx) => (
                <div className="timeline-item" key={h.id}>
                  <div className="timeline-dot-col">
                    <div className="timeline-dot" />
                    {idx < complaint.status_history.length - 1 && <div className="timeline-line" />}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-status">{h.new_status}</div>
                    <div className="timeline-meta">
                      {h.changed_by_name ? `by ${h.changed_by_name} · ` : ""}{formatDateTime(h.changed_at)}
                    </div>
                    {h.remarks && <div className="timeline-remark">{h.remarks}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .complaint-details-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </DashboardLayout>
  );
}

function MetaField({ label, value, capitalize }) {
  return (
    <div>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 13.5, textTransform: capitalize ? "capitalize" : "none" }}>{value}</div>
    </div>
  );
}
