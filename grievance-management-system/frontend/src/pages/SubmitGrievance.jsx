import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Topbar from "../components/Topbar";
import { CATEGORIES, PRIORITIES, RECEIVERS } from "../utils/constants";
import { submitComplaint } from "../services/complaintService";
import { extractErrorMessage } from "../services/api";
import { useToast } from "../context/ToastContext";
import { IconPaperclip, IconCheck } from "../components/icons";

const initialForm = {
  title: "",
  description: "",
  category: "",
  priority: "Medium",
  assigned_to: "",
};

export default function SubmitGrievance() {
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required.";
    if (!form.description.trim()) errs.description = "Description is required.";
    if (!form.category) errs.category = "Please select a category.";
    if (!form.assigned_to) errs.assigned_to = "Please select who should receive this.";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      const complaint = await submitComplaint(form, file);
      setSuccess(complaint);
      showToast("Grievance submitted successfully.", "success");
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <DashboardLayout topbarSlot={<Topbar title="Submit Grievance" />}>
        <div className="card" style={{ padding: "40px", textAlign: "center", maxWidth: 480, margin: "40px auto" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%", background: "rgba(47,107,79,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px",
            color: "var(--ink-green)",
          }}>
            <IconCheck width={26} height={26} />
          </div>
          <h2 style={{ marginBottom: 8 }}>Grievance Submitted</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 6 }}>
            Your complaint has been recorded with reference number
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 18, color: "var(--ledger-800)", marginBottom: 24 }}>
            {success.complaint_number}
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="btn btn-outline" onClick={() => { setSuccess(null); setForm(initialForm); setFile(null); }}>
              Submit Another
            </button>
            <button className="btn btn-primary" onClick={() => navigate(`/complaints/${success.id}`)}>
              View Complaint
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout topbarSlot={<Topbar title="Submit Grievance" subtitle="File a new complaint for review" />}>
      <div className="card" style={{ padding: "28px 30px", maxWidth: 720 }}>
        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label" htmlFor="title">Complaint Title</label>
            <input
              id="title"
              className="field-input"
              placeholder="e.g. Water leakage in Block C washroom"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
            {errors.title && <p className="field-error">{errors.title}</p>}
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="description">Detailed Description</label>
            <textarea
              id="description"
              className="field-textarea"
              placeholder="Describe the issue with as much detail as possible — location, date it started, who is affected, and any steps already taken."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
            {errors.description && <p className="field-error">{errors.description}</p>}
          </div>

          <div className="field-row">
            <div className="field-group">
              <label className="field-label" htmlFor="category">Category</label>
              <select
                id="category"
                className="field-select"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="field-error">{errors.category}</p>}
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="priority">Priority</label>
              <select
                id="priority"
                className="field-select"
                value={form.priority}
                onChange={(e) => update("priority", e.target.value)}
              >
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Select Receiver</label>
            <div className="radio-card-group">
              {RECEIVERS.map((r) => (
                <div
                  key={r.value}
                  className={`radio-card ${form.assigned_to === r.value ? "selected" : ""}`}
                  onClick={() => update("assigned_to", r.value)}
                >
                  <div className="radio-card-title">{r.label}</div>
                  <div className="radio-card-desc">{r.desc}</div>
                </div>
              ))}
            </div>
            {errors.assigned_to && <p className="field-error">{errors.assigned_to}</p>}
          </div>

          <div className="field-group">
            <label className="field-label">
              Attachment <span className="optional">(optional)</span>
            </label>
            <label
              htmlFor="attachment"
              className="field-input"
              style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: file ? "var(--text-primary)" : "var(--text-muted)" }}
            >
              <IconPaperclip width={16} height={16} />
              {file ? file.name : "Attach a supporting document or image"}
            </label>
            <input
              id="attachment"
              type="file"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.txt,.xlsx,.xls,.csv"
            />
            <p className="field-hint">PDF, Word, Excel, or image files up to 10 MB.</p>
          </div>

          <button type="submit" className="btn btn-accent" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Grievance"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
