/**
 * API Client for MediMind AI Backend
 * Connects the frontend to FastAPI at http://localhost:8000
 */

const BASE_URL = "http://localhost:8000/api/v1";

// ─────────────────────────── Auth helpers ────────────────────────────
function getToken(): string | null {
  return localStorage.getItem("medimind.token");
}

function setToken(token: string) {
  localStorage.setItem("medimind.token", token);
}

function removeToken() {
  localStorage.removeItem("medimind.token");
  localStorage.removeItem("medimind.user");
}

export function getStoredUser(): LoginResponse["user"] | null {
  const raw = localStorage.getItem("medimind.user");
  return raw ? JSON.parse(raw) : null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    removeToken();
    window.location.href = "/";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  // Handle 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─────────────────────────── Auth ────────────────────────────
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    avatar?: string;
  };
}

export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
  const formData = new FormData();
  formData.append("username", email);
  formData.append("password", password);

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(err.detail || "Login failed");
  }
  const data: LoginResponse = await res.json();
  setToken(data.access_token);
  localStorage.setItem("medimind.user", JSON.stringify(data.user));
  return data;
}

export function apiLogout() {
  removeToken();
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export async function getMe(): Promise<LoginResponse["user"]> {
  return request("/auth/me");
}

// ─────────────────────────── Dashboard ────────────────────────────
export async function getDashboard(role: string) {
  return request(`/dashboard/${role}`);
}

// ─────────────────────────── Medicines ────────────────────────────
export interface Medicine {
  id: number;
  patient_id: number;
  medicine_name: string;
  dosage: string;
  frequency: string;
  schedule: string[];
  instructions?: string;
  remaining_pills: number;
  status: string;
}

export async function getMedicines(): Promise<Medicine[]> {
  return request("/medicines");
}

export async function createMedicine(data: Partial<Medicine>): Promise<Medicine> {
  return request("/medicines", { method: "POST", body: JSON.stringify(data) });
}

export async function getTodaysLogs() {
  return request("/medicines/logs/today");
}

export async function updateMedicationLog(logId: number, data: Record<string, unknown>) {
  return request(`/medicines/logs/${logId}`, { method: "PUT", body: JSON.stringify(data) });
}

// ─────────────────────────── Smart Bottle ────────────────────────────
export async function getDeviceEvents(deviceId: string, limit = 50) {
  return request(`/devices/${deviceId}/events?limit=${limit}`);
}

export async function logDeviceEvent(deviceId: string, eventType: string, sensorData?: unknown) {
  return request(`/devices/${deviceId}/events`, {
    method: "POST",
    body: JSON.stringify({ device_id: deviceId, event_type: eventType, sensor_data: sensorData }),
  });
}

// ─────────────────────────── AI Chat ────────────────────────────
export interface AIConversation {
  id: number;
  title: string;
  created_at: string;
  messages: AIMessage[];
}

export interface AIMessage {
  id: number;
  sender: "user" | "ai";
  message: string;
  created_at: string;
}

export async function getConversations(): Promise<AIConversation[]> {
  return request("/ai/conversations");
}

export async function createConversation(userId: number, title = "New Chat"): Promise<AIConversation> {
  return request("/ai/conversations", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, title }),
  });
}

export async function getConversation(id: number): Promise<AIConversation> {
  return request(`/ai/conversations/${id}`);
}

export async function sendMessage(convId: number, message: string): Promise<AIMessage> {
  return request(`/ai/conversations/${convId}/messages`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

// ─────────────────────────── Notifications ────────────────────────────
export async function getNotifications() {
  return request("/notifications").catch(() => []);
}
