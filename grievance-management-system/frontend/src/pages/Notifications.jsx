import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Topbar from "../components/Topbar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { IconBell } from "../components/icons";
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from "../services/notificationService";
import { formatDateTime } from "../utils/format";
import { extractErrorMessage } from "../services/api";
import { useToast } from "../context/ToastContext";

export default function Notifications() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchNotifications(false);
      setData(result);
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  async function handleClick(n) {
    if (!n.is_read) {
      try {
        await markNotificationRead(n.id);
      } catch {
        // non-critical
      }
    }
    if (n.complaint_id) navigate(`/complaints/${n.complaint_id}`);
  }

  async function handleMarkAll() {
    try {
      await markAllNotificationsRead();
      load();
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    }
  }

  return (
    <DashboardLayout topbarSlot={<Topbar title="Notifications" subtitle="Updates on your grievances" />}>
      {loading ? (
        <LoadingSpinner label="Loading notifications…" />
      ) : (
        <>
          <div className="page-header">
            <div />
            {data.notifications.some((n) => !n.is_read) && (
              <button className="btn btn-outline btn-sm" onClick={handleMarkAll}>
                Mark all as read
              </button>
            )}
          </div>

          {data.notifications.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={<IconBell width={36} height={36} />}
                title="No notifications"
                description="You're all caught up. New updates will appear here."
              />
            </div>
          ) : (
            <div className="card" style={{ overflow: "hidden" }}>
              {data.notifications.map((n, idx) => (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  style={{
                    display: "flex", gap: 12, padding: "16px 22px", cursor: "pointer",
                    borderBottom: idx < data.notifications.length - 1 ? "1px solid var(--border-soft)" : "none",
                    background: n.is_read ? "transparent" : "rgba(184,134,59,0.05)",
                  }}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", marginTop: 6, flexShrink: 0,
                    background: n.is_read ? "transparent" : "var(--brass)",
                  }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13.5, fontWeight: n.is_read ? 400 : 600 }}>{n.message}</p>
                    <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4 }}>
                      {n.complaint_number && `${n.complaint_number} · `}{formatDateTime(n.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
