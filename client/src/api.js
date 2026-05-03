const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:4000/api" : `${window.location.origin}/api`);

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers
    },
    ...options
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  getSummary: (token, month) => request(`/dashboard/summary?month=${month}`, { token }),
  getRecord: (token, date) => request(`/records/${date}`, { token }),
  saveRecord: (token, date, payload) =>
    request(`/records/${date}`, { method: "PUT", token, body: JSON.stringify(payload) })
};

export { API_BASE_URL };
