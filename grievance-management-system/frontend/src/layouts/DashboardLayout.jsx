import { useState, cloneElement } from "react";
import Sidebar from "../components/Sidebar";
import { IconMenu } from "../components/icons";

export default function DashboardLayout({ title, subtitle, topbarSlot, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="main-panel">
        <div className="mobile-topbar">
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <IconMenu />
          </button>
          <span className="mobile-topbar-brand">Roever Grievance Portal</span>
          <span style={{ width: 34 }} />
        </div>

        {topbarSlot}

        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}
