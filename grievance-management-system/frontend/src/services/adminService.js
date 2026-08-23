import api from "./api";

export async function fetchAdminComplaints(params = {}) {
  const res = await api.get("/admin/complaints", { params });
  return res.data.data;
}

export async function fetchAdminComplaintById(id) {
  const res = await api.get(`/admin/complaints/${id}`);
  return res.data.data;
}

export async function updateComplaintStatus(id, status, remarks) {
  const res = await api.put(`/admin/complaints/${id}/status`, { status, remarks });
  return res.data.data;
}

export async function addComplaintResponse(id, response) {
  const res = await api.post(`/admin/complaints/${id}/response`, { response });
  return res.data.data;
}

export async function fetchAdminStats() {
  const res = await api.get("/admin/stats");
  return res.data.data;
}
