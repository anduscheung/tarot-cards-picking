import axios, { AxiosHeaders } from "axios";
export { login, signup } from "./auth";
export { listDraws, createDraw } from "./draws";

export const serviceInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

// Attach token on every request
serviceInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    if (!config.headers) config.headers = new AxiosHeaders();
    (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// only if you want instant cross-tab effects
window.addEventListener("storage", (e) => {
  if (e.key === "token") {
    const newToken = e.newValue ?? undefined;
    // update any in-memory auth state here
    if (!newToken) {
      // token cleared in another tab -> force logout UX
      // e.g. queryClient.clear(); navigate(ROUTES.login);
    }
  }
});

export type ApiError = {
  status?: number;
  code?: string;
  message: string;
  details?: unknown;
};

function toApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data;
    const message = data?.error || data?.message || err.message || "Request failed";
    return { status, message, details: data };
  }
  return { message: "Unexpected error" };
}

// Optional: central error handling
serviceInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    const e = toApiError(err);
    if (
      e.status === 401 || // Unauthorized
      e.status === 419 || // CSRF
      e.status === 440 // Login Timeout
    ) {
      localStorage.removeItem("token");
      // redirect to login
    }
    return Promise.reject(e);
  },
);
