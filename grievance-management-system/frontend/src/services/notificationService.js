import api from "./api";

export async function fetchNotifications(unreadOnly = false) {
  const res = await api.get("/notifications", { params: { unread_only: unreadOnly } });
  return res.data.data; // { notifications, unread_count }
}

export async function markNotificationRead(id) {
  const res = await api.put(`/notifications/${id}/read`);
  return res.data.data;
}

export async function markAllNotificationsRead() {
  const res = await api.put("/notifications/read-all");
  return res.data;
}
