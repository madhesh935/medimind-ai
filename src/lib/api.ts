/**
 * API Client for MediMind AI Backend
 * Connects the frontend to FastAPI at http://localhost:8000
 * When backend is offline, all endpoints fall back to typed mock data.
 */

const BASE_URL = "http://localhost:8000/api/v1";

// ─────────────────────────── Auth helpers ────────────────────────────
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("medimind.token");
}

function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("medimind.token", token);
  }
}

function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("medimind.token");
    localStorage.removeItem("medimind.user");
  }
}

export function getStoredUser(): LoginResponse["user"] | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("medimind.user");
  return raw ? JSON.parse(raw) : null;
}

export const MOCK_PATIENTS: PatientSummary[] = [
  { id: 1, user_id: 10, name: "Emma Wilson", email: "emma@medimind.ai", dob: "1966-03-14", gender: "Female", doctor_id: 2, risk: "High", adherence: 68, status: "Missed", last_dose: "6h ago", medications: ["Metformin", "Insulin"] },
  { id: 2, user_id: 11, name: "James Carter", email: "james@medimind.ai", dob: "1953-07-22", gender: "Male", doctor_id: 2, risk: "Medium", adherence: 82, status: "On track", last_dose: "1h ago", medications: ["Lisinopril", "Aspirin"] },
  { id: 3, user_id: 12, name: "Priya Menon", email: "priya.m@medimind.ai", dob: "1960-11-05", gender: "Female", doctor_id: 2, risk: "Low", adherence: 96, status: "On track", last_dose: "3h ago", medications: ["Atorvastatin", "Metoprolol"] },
  { id: 4, user_id: 13, name: "Robert Kim", email: "robert@medimind.ai", dob: "1955-01-30", gender: "Male", doctor_id: 2, risk: "High", adherence: 61, status: "Delayed", last_dose: "8h ago", medications: ["Tiotropium", "Prednisone"] },
  { id: 5, user_id: 14, name: "Sofia Alvarez", email: "sofia@medimind.ai", dob: "1969-08-19", gender: "Female", doctor_id: 3, risk: "Medium", adherence: 79, status: "On track", last_dose: "2h ago", medications: ["Metformin"] },
  { id: 6, user_id: 15, name: "David Chen", email: "david@medimind.ai", dob: "1950-05-11", gender: "Male", doctor_id: 2, risk: "Low", adherence: 94, status: "On track", last_dose: "1h ago", medications: ["Warfarin", "Statin"] },
  { id: 7, user_id: 16, name: "Aisha Rahman", email: "aisha@medimind.ai", dob: "1977-12-02", gender: "Female", doctor_id: 3, risk: "Low", adherence: 91, status: "On track", last_dose: "4h ago", medications: ["Albuterol"] },
  { id: 8, user_id: 17, name: "Michael O'Connor", email: "michael@medimind.ai", dob: "1958-09-27", gender: "Male", doctor_id: 2, risk: "Medium", adherence: 76, status: "On track", last_dose: "2h ago", medications: ["Amlodipine"] },
];

export const MOCK_DOCTORS: DoctorSummary[] = [
  { id: 1, user_id: 2, name: "Dr. Priya Patel", email: "priya.patel@medimind.ai", phone: "+1-555-0101", hospital: "MediMind Central", specialization: "Internal Medicine", status: "active", patients_count: 138 },
  { id: 2, user_id: 5, name: "Dr. Marcus Lee", email: "marcus.lee@medimind.ai", phone: "+1-555-0102", hospital: "MediMind Central", specialization: "Cardiology", status: "active", patients_count: 92 },
  { id: 3, user_id: 6, name: "Dr. Elena Rossi", email: "elena.rossi@medimind.ai", phone: "+1-555-0103", hospital: "MediMind Central", specialization: "Endocrinology", status: "active", patients_count: 104 },
  { id: 4, user_id: 7, name: "Dr. Samuel Okafor", email: "samuel.okafor@medimind.ai", phone: "+1-555-0104", hospital: "MediMind Central", specialization: "Pulmonology", status: "on_leave", patients_count: 71 },
  { id: 5, user_id: 8, name: "Dr. Hannah Weiss", email: "hannah.weiss@medimind.ai", phone: "+1-555-0105", hospital: "MediMind Central", specialization: "Geriatrics", status: "active", patients_count: 118 },
];

export const MOCK_ADMIN_USERS: AdminUser[] = [
  { id: 1, name: "John Anderson", email: "john@medimind.ai", role: "patient", is_active: true, created_at: "2024-01-10T10:00:00Z", patients_count: 0 },
  { id: 2, name: "Dr. Priya Patel", email: "priya.patel@medimind.ai", role: "doctor", is_active: true, created_at: "2024-01-05T09:00:00Z", patients_count: 138 },
  { id: 3, name: "System Admin", email: "admin@medimind.ai", role: "admin", is_active: true, created_at: "2024-01-01T08:00:00Z", patients_count: 0 },
  { id: 4, name: "Emma Wilson", email: "emma@medimind.ai", role: "patient", is_active: true, created_at: "2024-02-12T11:00:00Z", patients_count: 0 },
  { id: 5, name: "Dr. Marcus Lee", email: "marcus.lee@medimind.ai", role: "doctor", is_active: true, created_at: "2024-01-08T09:30:00Z", patients_count: 92 },
];

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 1, actor_name: "Dr. Priya Patel", role: "doctor", action: "Updated prescription", target: "Emma Wilson", ip_address: "192.168.1.10", severity: "info", created_at: new Date(Date.now() - 2 * 60000).toISOString() },
  { id: 2, actor_name: "System", role: "system", action: "Auto-refill triggered", target: "Atorvastatin", ip_address: undefined, severity: "info", created_at: new Date(Date.now() - 12 * 60000).toISOString() },
  { id: 3, actor_name: "Alex Morgan", role: "admin", action: "Added new doctor", target: "Dr. Hannah Weiss", ip_address: "192.168.1.5", severity: "success", created_at: new Date(Date.now() - 60 * 60000).toISOString() },
  { id: 4, actor_name: "AI Engine", role: "system", action: "Flagged high risk", target: "Robert Kim", ip_address: undefined, severity: "warning", created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: 5, actor_name: "Sarah Anderson", role: "admin", action: "Sent emergency alert", target: "John Anderson", ip_address: "192.168.1.8", severity: "danger", created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 6, actor_name: "System", role: "system", action: "Device firmware update", target: "Bottle fleet v3.2.1", ip_address: undefined, severity: "info", created_at: new Date(Date.now() - 24 * 3600000).toISOString() },
];

export const MOCK_ADMIN_DEVICES: AdminDevice[] = [
  { id: 1, device_id: "SB-A2-8891", patient_name: "John Anderson", battery: 82, wifi_status: "connected", firmware_version: "3.2.1", last_sync: new Date(Date.now() - 5 * 60000).toISOString(), open_count: 14 },
  { id: 2, device_id: "SB-A2-8792", patient_name: "Emma Wilson", battery: 42, wifi_status: "connected", firmware_version: "3.2.1", last_sync: new Date(Date.now() - 30 * 60000).toISOString(), open_count: 8 },
  { id: 3, device_id: "SB-A1-6612", patient_name: "James Carter", battery: 21, wifi_status: "connected", firmware_version: "3.1.8", last_sync: new Date(Date.now() - 2 * 3600000).toISOString(), open_count: 6 },
  { id: 4, device_id: "SB-A2-9014", patient_name: "Priya Menon", battery: 91, wifi_status: "connected", firmware_version: "3.2.1", last_sync: new Date(Date.now() - 10 * 60000).toISOString(), open_count: 19 },
  { id: 5, device_id: "SB-A1-4423", patient_name: "Robert Kim", battery: 0, wifi_status: "disconnected", firmware_version: "3.1.8", last_sync: new Date(Date.now() - 48 * 3600000).toISOString(), open_count: 0 },
];

export const MOCK_MEDICINES: Medicine[] = [
  { id: 1, patient_id: 1, medicine_name: "Metformin", dosage: "500mg", frequency: "Twice daily", schedule: ["08:00", "20:00"], instructions: "With meals", remaining_pills: 24, status: "active", auto_refill: true },
  { id: 2, patient_id: 1, medicine_name: "Lisinopril", dosage: "10mg", frequency: "Once daily", schedule: ["09:00"], instructions: "Any time", remaining_pills: 18, status: "active", auto_refill: true },
  { id: 3, patient_id: 1, medicine_name: "Atorvastatin", dosage: "20mg", frequency: "Once daily", schedule: ["22:00"], instructions: "With or without food", remaining_pills: 12, status: "active", auto_refill: false },
  { id: 4, patient_id: 1, medicine_name: "Aspirin", dosage: "81mg", frequency: "Once daily", schedule: ["09:00"], instructions: "With food", remaining_pills: 30, status: "active", auto_refill: true },
];

export const MOCK_MED_LOGS = (() => {
  const logs: {
    id: number; user_id: number; medicine_id: number; medicine_name: string;
    scheduled_time: string; taken_time: string | null; status: string; delay_minutes: number;
  }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    [1, 2, 3].forEach((medId, j) => {
      const scheduled = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 8 + j * 2, 0);
      const rng = Math.random();
      const status = rng > 0.12 ? "taken" : "missed";
      const delay = rng > 0.12 ? Math.floor(Math.random() * 20) : 0;
      const takenTime = status === "taken" ? new Date(scheduled.getTime() + delay * 60000) : null;
      logs.push({
        id: i * 10 + j,
        user_id: 1,
        medicine_id: medId,
        medicine_name: medId === 1 ? "Metformin" : medId === 2 ? "Lisinopril" : "Atorvastatin",
        scheduled_time: scheduled.toISOString(),
        taken_time: takenTime?.toISOString() || null,
        status,
        delay_minutes: delay,
      });
    });
  }
  return logs;
})();

export const MOCK_MY_DEVICE: MyDevice = {
  id: 1,
  device_id: "SB-A2-8891",
  battery: 82,
  wifi_status: "connected",
  temperature: 24.5,
  weight: 128,
  lid_status: "closed",
  firmware_version: "3.2.1",
  last_sync: new Date(Date.now() - 5 * 60000).toISOString(),
};

export const MOCK_DEVICE_EVENTS = [
  { id: 1, device_id: "SB-A2-8891", event_type: "open", timestamp: new Date(Date.now() - 3600000).toISOString(), metadata: {}, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, device_id: "SB-A2-8891", event_type: "close", timestamp: new Date(Date.now() - 3550000).toISOString(), metadata: { weight_diff: -2 }, created_at: new Date(Date.now() - 3550000).toISOString() },
  { id: 3, device_id: "SB-A2-8891", event_type: "sync", timestamp: new Date(Date.now() - 5 * 60000).toISOString(), metadata: { battery: 82 }, created_at: new Date(Date.now() - 5 * 60000).toISOString() },
];

export const MOCK_CONSULTATIONS: Consultation[] = [
  { id: 1, patient_id: 1, doctor_id: 2, scheduled_for: new Date(Date.now() + 24 * 3600000).toISOString(), status: "confirmed", consultation_type: "video", consultation_notes: null, prescription_status: "pending", created_at: new Date().toISOString() },
  { id: 2, patient_id: 1, doctor_id: 2, scheduled_for: new Date(Date.now() + 4 * 24 * 3600000).toISOString(), status: "pending", consultation_type: "prescription_review", consultation_notes: null, prescription_status: "none", created_at: new Date().toISOString() },
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: 1, title: "Medicine Taken", message: "Metformin 500mg logged at 8:02 AM", type: "success", read: false, created_at: new Date(Date.now() - 2 * 60000).toISOString() },
  { id: 2, title: "Refill Reminder", message: "Atorvastatin — 5 days left, refill soon", type: "warning", read: false, created_at: new Date(Date.now() - 60 * 60000).toISOString() },
  { id: 3, title: "Risk Increased", message: "Evening adherence dropped 12% this week", type: "danger", read: false, created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: 4, title: "AI Reminder Sent", message: "Bedtime medication check sent successfully", type: "info", read: true, created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 5, title: "Bottle Offline", message: "Smart Bottle #A2 disconnected", type: "warning", read: true, created_at: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: 6, title: "Doctor Message", message: "Dr. Patel: 'Great progress this week!'", type: "info", read: true, created_at: new Date(Date.now() - 26 * 3600000).toISOString() },
];

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

    if (res.status === 401) {
      removeToken();
      window.location.href = "/";
      throw new Error("Unauthorized");
    }
    if (!res.ok) {
      throw new Error(`Request to ${path} failed with status ${res.status}`);
    }
    if (res.status === 204) return undefined as T;
    return await res.json() as T;
  } catch (err) {
    console.warn(`Backend offline – returning mock data for: ${path}`);
    // No artificial delay — mock data is immediate so UI renders on first paint

    // ─── Dashboard ───────────────────────────────────────────────────────────
    if (path.includes("/dashboard/patient")) {
      return {
        weekly_adherence: 94,
        monthly_adherence: 91,
        risk_score: "Low",
        total_doses: 28,
        taken_doses: 26,
        missed_doses: 2,
      } as T;
    }

    if (path.includes("/dashboard/doctor")) {
      return {
        total_patients: 8,
        high_risk_patients: 2,
        upcoming_appointments: 5,
        avg_adherence: 81,
        messages: 14,
        urgent_reviews: 2,
        recent_reports: 3,
      } as T;
    }

    if (path.includes("/dashboard/admin")) {
      return {
        total_users: 12840,
        connected_devices: 7912,
        system_status: "Healthy",
        active_alerts: 3,
        active_doctors: 342,
        active_patients: 11290,
        total_doctors: 342,
        total_patients: 11290,
      } as T;
    }

    // ─── Medicines & Logs ─────────────────────────────────────────────────────
    if (path.includes("/medicines/logs/today")) {
      const now = new Date();
      return [
        { id: 1, medicine_id: 1, scheduled_time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0).toISOString(), status: "taken", delay_minutes: 2 },
        { id: 2, medicine_id: 2, scheduled_time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0).toISOString(), status: "taken", delay_minutes: 0 },
        { id: 3, medicine_id: 4, scheduled_time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0).toISOString(), status: "taken", delay_minutes: 0 },
        { id: 4, medicine_id: 1, scheduled_time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0).toISOString(), status: "upcoming", delay_minutes: 0 },
        { id: 5, medicine_id: 3, scheduled_time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22, 0).toISOString(), status: "upcoming", delay_minutes: 0 },
      ] as T;
    }

    if (path.includes("/medicines/logs") && !path.includes("/today")) {
      return MOCK_MED_LOGS as T;
    }

    if (path.includes("/medicines") && options.method !== "POST" && options.method !== "PUT") {
      return MOCK_MEDICINES as T;
    }

    // ─── AI Prediction ────────────────────────────────────────────────────────
    if (path.includes("/ai/prediction")) {
      return {
        prediction: {
          id: 1,
          patient_id: 1,
          current_risk: "Low",
          future_risk_7d: "Low",
          future_risk_30d: "Moderate",
          confidence_score: 96,
          next_miss_probability: 18,
          expected_adherence: 92,
          summary: "Based on your recent behaviour, you are likely to miss evening doses during weekends.",
          updated_at: new Date().toISOString(),
        },
        details: [
          { id: 1, prediction_id: 1, text: "Take medicine before dinner to avoid missed evening doses.", rec_type: "schedule", applied: false },
          { id: 2, prediction_id: 1, text: "Enable bedtime reminders on weekends.", rec_type: "reminder", applied: false },
          { id: 3, prediction_id: 1, text: "Refill Atorvastatin within 5 days.", rec_type: "refill", applied: true },
        ],
      } as T;
    }

    // ─── Patient & Doctor Rosters ─────────────────────────────────────────────
    if (path.includes("/profiles/patients")) {
      return MOCK_PATIENTS as T;
    }

    if (path.includes("/profiles/doctors")) {
      return MOCK_DOCTORS as T;
    }

    // ─── Admin endpoints ──────────────────────────────────────────────────────
    if (path.includes("/admin/users")) {
      return MOCK_ADMIN_USERS as T;
    }

    if (path.includes("/admin/audit-logs") || path.includes("/admin/audit")) {
      return MOCK_AUDIT_LOGS as T;
    }

    if (path.includes("/admin/devices") || (path.includes("/devices") && !path.includes("/me") && !path.includes("/events"))) {
      return MOCK_ADMIN_DEVICES as T;
    }

    // ─── My Smart Bottle device ───────────────────────────────────────────────
    if (path.includes("/devices/me")) {
      return MOCK_MY_DEVICE as T;
    }

    if (path.includes("/events") && path.includes("/devices")) {
      return MOCK_DEVICE_EVENTS as T;
    }

    // ─── Notifications ────────────────────────────────────────────────────────
    if (path.includes("/notifications")) {
      return MOCK_NOTIFICATIONS as T;
    }

    // ─── Telemedicine ─────────────────────────────────────────────────────────
    if (path.includes("/telemedicine")) {
      return MOCK_CONSULTATIONS as T;
    }

    if (path.includes("/profiles/doctor/me")) {
      return { id: 1, user_id: 2, availability_status: "available", specialization: "Cardiology", hospital: "MediMind Central" } as T;
    }

    // ─── AI Conversations ─────────────────────────────────────────────────────
    // POST /ai/conversations → create a new conversation
    if (path === "/ai/conversations" && options.method === "POST") {
      const body = options.body ? JSON.parse(options.body as string) : {};
      return { id: Math.floor(Math.random() * 9000) + 1000, title: body.title ?? "New Chat", created_at: new Date().toISOString(), messages: [] } as T;
    }

    // POST /ai/conversations/:id/messages → send a message and get an AI reply
    if (path.match(/\/ai\/conversations\/\d+\/messages/) && options.method === "POST") {
      const body = options.body ? JSON.parse(options.body as string) : {};
      const q = (body.message ?? "").toLowerCase();
      let reply = "I'm here to help! Could you tell me more about what you need?";
      if (q.includes("adherence") || q.includes("took") || q.includes("medicine") || q.includes("dose") || q.includes("pill")) {
        reply = "Your adherence this week is **94%** — excellent work! You've taken Metformin at 8:02 AM and Lisinopril at 9:00 AM today. Your next dose is **Metformin 500mg at 8:00 PM**.";
      } else if (q.includes("risk") || q.includes("score")) {
        reply = "Your current risk level is **Low**. The AI prediction gives you a **96% confidence score** and a 7-day outlook of Low risk. Keep maintaining your medication schedule!";
      } else if (q.includes("refill") || q.includes("supply") || q.includes("remaining")) {
        reply = "You currently have: Metformin (**24 pills**), Lisinopril (**18 pills**), Atorvastatin (**12 pills** — refill soon!), and Aspirin (**30 pills**). I recommend ordering Atorvastatin within the next 5 days.";
      } else if (q.includes("appointment") || q.includes("doctor") || q.includes("consult")) {
        reply = "Your next appointment is **tomorrow at 10:30 AM** (Video consultation with Dr. Sarah Jenkins). You also have a Prescription Review on Monday. Would you like to reschedule or get a reminder?";
      } else if (q.includes("report") || q.includes("summary") || q.includes("week")) {
        reply = "**Weekly Summary:** You took **94%** of your scheduled doses. You missed 2 evening doses this week (Saturday and Sunday). Your longest streak is 12 days. Overall: great progress! 🎉";
      } else if (q.includes("interact") || q.includes("side effect")) {
        reply = "Metformin can interact with **alcohol** and **iodinated contrast media**. Lisinopril should not be taken with **potassium supplements**. Atorvastatin may be affected by **grapefruit juice**. Always consult Dr. Patel before making changes.";
      } else if (q.includes("pain") || q.includes("feel") || q.includes("symptom")) {
        reply = "I'm sorry you're not feeling well. If you're experiencing **severe pain or an emergency**, please call emergency services immediately. For medication side effects, I recommend contacting Dr. Patel directly through the Telemedicine portal.";
      }
      return { id: Date.now(), sender: "ai", message: reply, created_at: new Date().toISOString() } as T;
    }

    // GET /ai/conversations → list conversations
    if (path.includes("/ai/conversations")) {
      return [
        { id: 1, title: "Morning medication check", created_at: new Date(Date.now() - 3600000).toISOString(), messages: [
          { id: 1, sender: "user", message: "Did I take my morning pills?", created_at: new Date(Date.now() - 3700000).toISOString() },
          { id: 2, sender: "ai", message: "Yes, John! You took Metformin 500mg at 8:02 AM and Lisinopril at 9:00 AM. Your next dose is Metformin at 8:00 PM.", created_at: new Date(Date.now() - 3600000).toISOString() },
        ]},
        { id: 2, title: "Refill status inquiry", created_at: new Date(Date.now() - 24 * 3600000).toISOString(), messages: [
          { id: 3, sender: "user", message: "When does Atorvastatin run out?", created_at: new Date(Date.now() - 24 * 3600000).toISOString() },
          { id: 4, sender: "ai", message: "Your Atorvastatin has 12 pills remaining. At your current dose, that's approximately 12 days. I recommend refilling within the next 5 days to avoid running out.", created_at: new Date(Date.now() - 23 * 3600000).toISOString() },
        ]},
      ] as T;
    }


    // ─── Auth/me ──────────────────────────────────────────────────────────────
    if (path.includes("/auth/me")) {
      const user = getStoredUser();
      if (user) return user as T;
      return { id: 1, name: "John Anderson", email: "patient@medimind.ai", role: "patient", is_active: true } as T;
    }

    // ─── Mutations (POST / PUT / DELETE) – return plausible echo responses ─────
    if (options.method === "POST" || options.method === "PUT" || options.method === "DELETE") {
      try {
        const body = options.body ? JSON.parse(options.body as string) : {};
        // For user status update
        if (path.includes("/admin/users") && path.includes("/status")) {
          const idMatch = path.match(/\/admin\/users\/(\d+)/); 
          const id = idMatch ? Number(idMatch[1]) : Date.now();
          return { id, name: "User", email: "user@medimind.ai", role: "patient", is_active: body.is_active ?? true, created_at: new Date().toISOString(), patients_count: 0 } as T;
        }
        // For medicine creation
        if (path.includes("/medicines") && options.method === "POST") {
          return { id: Date.now(), patient_id: 1, ...body, remaining_pills: body.remaining_pills ?? 30, status: "active", auto_refill: false } as T;
        }
        // For AI recommendation apply
        if (path.includes("/ai/recommendations") && path.includes("/apply")) {
          const idMatch = path.match(/\/ai\/recommendations\/(\d+)/);
          return { id: idMatch ? Number(idMatch[1]) : 1, prediction_id: 1, text: "Recommendation applied.", rec_type: "schedule", applied: true } as T;
        }
        // Generic mutation: echo body
        return { id: Date.now(), ...body, created_at: new Date().toISOString() } as T;
      } catch {
        return { id: Date.now(), created_at: new Date().toISOString() } as T;
      }
    }

    // ─── Catch-all ────────────────────────────────────────────────────────────
    return [] as T;
  }
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

  let data: LoginResponse;
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Backend login failed");
    }
    data = await res.json();
  } catch (err) {
    console.warn("Login failed, using mock fallback:", err);
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Fallback mock logic for testing when backend is down
    let role = "patient";
    let name = "John Anderson";
    if (email.includes("doctor")) {
      role = "doctor";
      name = "Dr. Sarah Jenkins";
    } else if (email.includes("admin")) {
      role = "admin";
      name = "System Admin";
    }
    
    data = {
      access_token: "mock-token-12345",
      token_type: "bearer",
      user: {
        id: role === "patient" ? 1 : role === "doctor" ? 2 : 3,
        name,
        email,
        role,
        is_active: true,
      }
    };
  }

  setToken(data.access_token);
  if (typeof window !== "undefined") {
    localStorage.setItem("medimind.user", JSON.stringify(data.user));
  }
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
  auto_refill: boolean;
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

export async function updateMedicine(id: number, data: Partial<Medicine>): Promise<Medicine> {
  return request(`/medicines/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function getMedicationLogsRange(start: string, end: string) {
  return request(`/medicines/logs?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
}

export interface ScannedPrescription {
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  doctor_name: string;
  hospital: string;
  confidence: number;
}

export async function scanPrescription(file: File): Promise<ScannedPrescription> {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);
  
  try {
    const res = await fetch(`${BASE_URL}/medicines/scan`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
    
    if (!res.ok) {
      throw new Error("Backend scan failed");
    }
    
    return await res.json();
  } catch (err) {
    // If backend is unavailable or fails, fallback to mock extraction 
    // to allow the user to test the UI flow.
    console.warn("Scan failed, using mock data fallback:", err);
    
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    return {
      medicine_name: "Amoxicillin",
      dosage: "500mg",
      frequency: "3 times a day",
      duration: "7 days",
      doctor_name: "Dr. Sarah Jenkins",
      hospital: "City General Hospital",
      confidence: 92,
    };
  }
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
export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export async function getNotificationsList(): Promise<AppNotification[]> {
  return request("/notifications");
}

export async function markNotificationRead(id: number): Promise<AppNotification> {
  return request(`/notifications/${id}/read`, { method: "PUT" });
}

export async function markAllNotificationsRead() {
  return request("/notifications/read-all", { method: "PUT" });
}

// ─────────────────────────── Telemedicine ────────────────────────────
export interface Consultation {
  id: number;
  patient_id: number;
  doctor_id: number;
  scheduled_for: string | null;
  status: string;
  consultation_type: string;
  consultation_notes: string | null;
  prescription_status: string;
  created_at: string;
}

export async function getPatientConsultations(patientId: number): Promise<Consultation[]> {
  return request(`/telemedicine/patient/${patientId}`);
}

export async function getDoctorConsultations(doctorId: number): Promise<Consultation[]> {
  return request(`/telemedicine/doctor/${doctorId}`);
}

export async function bookConsultation(patientId: number, doctorId: number): Promise<Consultation> {
  return request(`/telemedicine/book?patient_id=${patientId}&doctor_id=${doctorId}`, { method: "POST" });
}

export async function updateConsultationStatus(consultationId: number, status: string): Promise<{ status: string }> {
  return request(`/telemedicine/${consultationId}/status?status=${encodeURIComponent(status)}`, { method: "PUT" });
}

// ─────────────────────────── Doctor profile ────────────────────────────
export interface DoctorProfile {
  id: number;
  user_id: number;
  hospital?: string;
  specialization?: string;
  license_number?: string;
  availability_status?: string;
}

export async function getMyDoctorProfile(): Promise<DoctorProfile> {
  return request("/profiles/doctor/me");
}

export async function upsertMyDoctorProfile(data: Partial<DoctorProfile>): Promise<DoctorProfile> {
  return request("/profiles/doctor/me", { method: "POST", body: JSON.stringify(data) });
}

// ─────────────────────────── Patients / Doctors rosters ────────────────────────────
export interface PatientSummary {
  id: number;
  user_id: number;
  name: string;
  email: string;
  dob: string | null;
  gender: string | null;
  doctor_id: number | null;
  risk: string;
  adherence: number;
  status: string;
  last_dose: string | null;
  medications: string[];
}

export async function getPatientsList(): Promise<PatientSummary[]> {
  return request("/profiles/patients");
}

export interface DoctorSummary {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  hospital?: string;
  specialization?: string;
  status: string;
  patients_count: number;
}

export async function getDoctorsList(): Promise<DoctorSummary[]> {
  return request("/profiles/doctors");
}

// ─────────────────────────── Admin ────────────────────────────
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  patients_count: number;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  return request("/admin/users");
}

export async function updateUserStatus(userId: number, isActive: boolean): Promise<AdminUser> {
  return request(`/admin/users/${userId}/status`, { method: "PUT", body: JSON.stringify({ is_active: isActive }) });
}

export interface AdminDevice {
  id: number;
  device_id: string;
  patient_name?: string;
  battery: number;
  wifi_status: string;
  firmware_version?: string;
  last_sync?: string;
  open_count: number;
}

export async function getAdminDevices(): Promise<AdminDevice[]> {
  return request("/admin/devices");
}

export async function updateDeviceStatus(deviceId: string, data: Record<string, unknown>) {
  return request(`/devices/${deviceId}/status`, { method: "PUT", body: JSON.stringify(data) });
}

export interface AuditLogEntry {
  id: number;
  actor_name: string;
  role: string;
  action: string;
  target?: string;
  ip_address?: string;
  severity: "info" | "success" | "warning" | "danger";
  created_at: string;
}

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  return request("/admin/audit-logs");
}

// ─────────────────────────── AI Prediction ────────────────────────────
export interface AIRecommendation {
  id: number;
  prediction_id: number;
  text: string;
  rec_type: string;
  applied: boolean;
}

export interface AIPrediction {
  id: number;
  patient_id: number;
  current_risk: string;
  future_risk_7d: string;
  future_risk_30d: string;
  confidence_score: number;
  next_miss_probability: number;
  expected_adherence: number;
  summary?: string;
  updated_at: string;
}

export async function getAIPrediction(patientId: number): Promise<{ prediction: AIPrediction; details: AIRecommendation[] }> {
  return request(`/ai/prediction/${patientId}`);
}

export async function recalculateAIPrediction(patientId: number) {
  return request(`/ai/prediction/${patientId}/recalculate`, { method: "POST" });
}

export async function applyAIRecommendation(id: number): Promise<AIRecommendation> {
  return request(`/ai/recommendations/${id}/apply`, { method: "PUT" });
}

// ─────────────────────────── Smart Bottle (my device) ────────────────────────────
export interface MyDevice {
  id: number;
  device_id: string;
  battery: number;
  wifi_status: string;
  temperature?: number;
  weight?: number;
  lid_status: string;
  firmware_version?: string;
  last_sync?: string;
}

export async function getMyDevice(): Promise<MyDevice> {
  return request("/devices/me");
}
