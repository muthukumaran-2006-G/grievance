import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchNotifications } from "../services/notificationService";
import { IconBell } from "./icons";

export default function Topbar({ title, subtitle }) {
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const data = await fetchNotifications(true);
      setUnread(data.unread_count);
    } catch {
      // silent - notification badge is non-critical
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <div className="topbar">
      <div className="topbar-title">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="topbar-actions">
        <button className="notif-bell" onClick={() => navigate("/notifications")} aria-label="Notifications">
          <IconBell />
          {unread > 0 && <span className="notif-badge">{unread > 9 ? "9+" : unread}</span>}
        </button>
      </div>
    </div>
  );
}
