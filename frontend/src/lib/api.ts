const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  guestLogin: () => request<{ token: string; user: any }>("/auth/guest", { method: "POST" }),
  googleLoginUrl: () => `${API_URL}/auth/google`,
  me: () => request<any>("/auth/me"),
  logout: () => request<{ success: boolean }>("/auth/logout", { method: "POST" }),

  getProjects: () => request<any[]>("/projects"),
  createProject: (data: { name: string; priority?: string; dueDate?: string }) =>
    request<any>("/projects", { method: "POST", body: JSON.stringify(data) }),

  getTasks: (projectId?: string) => request<any[]>(`/tasks${projectId ? `?project=${projectId}` : ""}`),
  createTask: (data: { title: string; status?: string; project?: string }) =>
    request<any>("/tasks", { method: "POST", body: JSON.stringify(data) }),
  updateTask: (id: string, data: Record<string, unknown>) =>
    request<any>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
};

export { API_URL };
