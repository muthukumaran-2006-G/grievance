export const ROLES = {
  STUDENT: "student",
  FACULTY: "faculty",
  WORKER: "worker",
  PARENT: "parent",
  PRINCIPAL: "principal",
  GRIEVANCE_TEAM: "grievance_team",
};

export const APPLICANT_ROLES = [ROLES.STUDENT, ROLES.FACULTY, ROLES.WORKER, ROLES.PARENT];
export const ADMIN_ROLES = [ROLES.PRINCIPAL, ROLES.GRIEVANCE_TEAM];

export const ROLE_LABELS = {
  [ROLES.STUDENT]: "Student",
  [ROLES.FACULTY]: "Faculty",
  [ROLES.WORKER]: "Worker / Staff",
  [ROLES.PARENT]: "Parent",
  [ROLES.PRINCIPAL]: "Principal",
  [ROLES.GRIEVANCE_TEAM]: "Grievance Team",
};

export const STATUSES = ["Pending", "Under Review", "In Progress", "Resolved", "Rejected"];

export const STATUS_SLUG = {
  "Pending": "pending",
  "Under Review": "under-review",
  "In Progress": "in-progress",
  "Resolved": "resolved",
  "Rejected": "rejected",
};

export const CATEGORIES = [
  "Academic", "Infrastructure", "Hostel", "Transport", "Examination",
  "Faculty", "Staff", "Fees", "Canteen", "Library", "Discipline", "Safety", "Other",
];

export const PRIORITIES = ["Low", "Medium", "High", "Critical"];

export const RECEIVERS = [
  { value: "principal", label: "Principal", desc: "For policy, academic, or administrative matters." },
  { value: "grievance_team", label: "Grievance Team", desc: "For general grievances handled by the redressal cell." },
];

export const DEMO_ACCOUNTS = [
  { role: "Student", email: "student@roever.edu.in" },
  { role: "Faculty", email: "faculty@roever.edu.in" },
  { role: "Worker", email: "worker@roever.edu.in" },
  { role: "Parent", email: "parent@roever.edu.in" },
  { role: "Principal", email: "principal@roever.edu.in" },
  { role: "Grievance Team", email: "grievance@roever.edu.in" },
];

export const DEMO_PASSWORD = "Roever@123";
