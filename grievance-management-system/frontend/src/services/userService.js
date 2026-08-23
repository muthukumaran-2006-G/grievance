import api from "./api";

export async function getProfile() {
  const res = await api.get("/users/profile");
  return res.data.data;
}

export async function updateProfile(payload) {
  const res = await api.put("/users/profile", payload);
  return res.data.data;
}
