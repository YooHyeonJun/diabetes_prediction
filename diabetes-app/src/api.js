import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
});

/* --- 토큰 자동 첨부 ------------------------------------------------ */
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("access_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

/* --- 인증 API ------------------------------------------------------ */
export const registerUser = (email, password) =>
  api.post("/auth/register", { email, password });

export const loginUser = (email, password) =>
  api.post(
    "/auth/jwt/login",
    new URLSearchParams({ username: email, password })
  );

/* 기존 예측 함수 */
export const predictDiabetes = (payload) => api.post("/predict", { data: payload });

export const fetchRecords = (limit = 10) =>
  api.get(`/records?limit=${limit}`);

export const logout = () => {
  localStorage.removeItem("access_token");
  window.location.href = "/login";
};
