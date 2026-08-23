import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import Topbar from "../components/Topbar";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/userService";
import { extractErrorMessage } from "../services/api";
import { useToast } from "../context/ToastContext";
import { ROLE_LABELS } from "../utils/constants";
import { initials } from "../utils/format";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [department, setDepartment] = useState(user.department || "");
  const [savingInfo, setSavingInfo] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleInfoSave(e) {
    e.preventDefault();
    setSavingInfo(true);
    try {
      const updated = await updateProfile({ name, phone, department });
      updateUser(updated);
      showToast("Profile updated.", "success");
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setSavingInfo(false);
    }
  }

  async function handlePasswordSave(e) {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setSavingPassword(true);
    try {
      await updateProfile({ current_password: currentPassword, new_password: newPassword });
      setCurrentPassword("");
      setNewPassword("");
      showToast("Password changed.", "success");
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <DashboardLayout topbarSlot={<Topbar title="Profile" subtitle="Manage your account details" />}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="profile-grid">
        <div className="card" style={{ padding: "26px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", background: "var(--ledger-950)",
              color: "var(--brass-light)", display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 19,
            }}>
              {initials(user.name)}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{user.name}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{ROLE_LABELS[user.role]} · {user.email}</div>
            </div>
          </div>

          <form onSubmit={handleInfoSave}>
            <div className="field-group">
              <label className="field-label">Full Name</label>
              <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field-group">
              <label className="field-label">Email</label>
              <input className="field-input" value={user.email} disabled style={{ opacity: 0.6 }} />
            </div>
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Phone</label>
                <input className="field-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="field-group">
                <label className="field-label">Department</label>
                <input className="field-input" value={department} onChange={(e) => setDepartment(e.target.value)} />
              </div>
            </div>
            <button className="btn btn-primary" disabled={savingInfo}>
              {savingInfo ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>

        <div className="card" style={{ padding: "26px 28px" }}>
          <h3 style={{ fontSize: 16, marginBottom: 18 }}>Change Password</h3>
          <form onSubmit={handlePasswordSave}>
            <div className="field-group">
              <label className="field-label">Current Password</label>
              <input
                type="password" className="field-input"
                value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="field-group">
              <label className="field-label">New Password</label>
              <input
                type="password" className="field-input"
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              />
              <p className="field-hint">At least 6 characters.</p>
            </div>
            <button className="btn btn-outline" disabled={savingPassword || !currentPassword || !newPassword}>
              {savingPassword ? "Updating…" : "Update Password"}
            </button>
          </form>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </DashboardLayout>
  );
}
