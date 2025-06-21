export function getAuthHeaders() {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("auth_token");
}

export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const headers = {
    ...getAuthHeaders(),
    "Content-Type": "application/json",
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
}
