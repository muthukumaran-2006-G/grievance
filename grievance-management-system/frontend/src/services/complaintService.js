import api from "./api";

export async function submitComplaint(payload, file) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => formData.append(key, value));
  if (file) formData.append("attachment", file);

  const res = await api.post("/complaints", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}

export async function fetchMyComplaints(params = {}) {
  const res = await api.get("/complaints/my", { params });
  return res.data.data;
}

export async function fetchComplaintById(id) {
  const res = await api.get(`/complaints/${id}`);
  return res.data.data;
}

export async function fetchDashboardSummary() {
  const res = await api.get("/dashboard/summary");
  return res.data.data;
}

export function attachmentUrl(filename) {
  const base = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api");
  return `${base}/complaints/attachments/${filename}`;
}
