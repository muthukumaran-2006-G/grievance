import api from "./api";

export async function login(email, password) {
  const res = await api.post("/auth/login", { email, password });
  return res.data.data; // { access_token, refresh_token, user }
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch {
    // ignore network errors on logout - we clear local state regardless
  }
}

export async function fetchMe() {
  const res = await api.get("/auth/me");
  return res.data.data;
}
