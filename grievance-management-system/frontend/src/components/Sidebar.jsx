import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES, ROLE_LABELS } from "../utils/constants";
import { initials } from "../utils/format";
import {
  IconDashboard, IconSubmit, IconList, IconBell, IconUser, IconLogout,
} from "./icons";

function navItemsForRole(role) {
  const base = [{ to: "/dashboard", label: "Dashboard", icon: IconDashboard }];

  if ([ROLES.STUDENT, ROLES.FACULTY, ROLES.WORKER, ROLES.PARENT].includes(role)) {
    return [
      ...base,
      { to: "/submit-grievance", label: "Submit Grievance", icon: IconSubmit },
      { to: "/my-complaints", label: "My Complaints", icon: IconList },
      { to: "/notifications", label: "Notifications", icon: IconBell },
      { to: "/profile", label: "Profile", icon: IconUser },
    ];
  }

  // Admin roles (principal / grievance_team)
  return [
    ...base,
    { to: "/complaints", label: "Complaints", icon: IconList },
    { to: "/notifications", label: "Notifications", icon: IconBell },
    { to: "/profile", label: "Profile", icon: IconUser },
  ];
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  if (!user) return null;

  const items = navItemsForRole(user.role);

  return (
    <>
      <div className={`sidebar-scrim ${open ? "open" : ""}`} onClick={onClose} />
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-seal">RC</div>
          <div className="sidebar-brand-text">
            <h1>Roever Engineering<br />College</h1>
            <span>Grievance Portal</span>
          </div>
        </div>

        <div className="sidebar-role-tag">{ROLE_LABELS[user.role]} Access</div>

        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            >
              <item.icon />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials(user.name)}</div>
            <div>
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-role">{ROLE_LABELS[user.role]}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            <IconLogout />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
