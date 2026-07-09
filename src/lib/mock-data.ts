// Realistic mock healthcare data for MediMind AI

export const currentUser = {
  name: "John Anderson",
  firstName: "John",
  age: 62,
  avatar: "JA",
  email: "john.anderson@medimind.ai",
  condition: "Type 2 Diabetes · Hypertension",
};

export const dashboardStats = {
  adherence: 94,
  todaysDoses: 4,
  weeklyStreak: 12,
  missedDoses: 2,
  riskScore: "Low",
  remainingPills: 18,
  nextMedicine: { name: "Metformin", time: "8:00 PM", dosage: "500mg" },
};

export const weeklyAdherence = [
  { day: "Mon", adherence: 92, target: 95 },
  { day: "Tue", adherence: 96, target: 95 },
  { day: "Wed", adherence: 89, target: 95 },
  { day: "Thu", adherence: 98, target: 95 },
  { day: "Fri", adherence: 94, target: 95 },
  { day: "Sat", adherence: 86, target: 95 },
  { day: "Sun", adherence: 91, target: 95 },
];

export const monthlyAdherence = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
  taken: 82 + Math.round(Math.sin(i) * 8 + 10),
  missed: 18 - Math.round(Math.sin(i) * 5 + 5),
}));

export const riskPrediction = Array.from({ length: 14 }, (_, i) => ({
  day: `Day ${i + 1}`,
  risk: 20 + Math.round(Math.sin(i / 2) * 15 + i * 1.5),
  predicted: 25 + Math.round(Math.sin(i / 2 + 1) * 12 + i * 1.2),
}));

export const reminderPie = [
  { name: "Push", value: 45, color: "hsl(220 90% 55%)" },
  { name: "Voice", value: 25, color: "hsl(280 75% 55%)" },
  { name: "SMS", value: 18, color: "hsl(160 70% 45%)" },
  { name: "WhatsApp", value: 12, color: "hsl(45 90% 55%)" },
];

export const medications = [
  {
    id: 1,
    name: "Metformin",
    purpose: "Blood sugar control",
    dosage: "500mg",
    schedule: "8:00 AM · 8:00 PM",
    food: "With meals",
    sideEffects: ["Nausea", "Digestive discomfort"],
    warnings: ["Alcohol interaction"],
    remaining: 24,
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: 2,
    name: "Lisinopril",
    purpose: "Blood pressure",
    dosage: "10mg",
    schedule: "9:00 AM",
    food: "Any time",
    sideEffects: ["Dry cough", "Dizziness"],
    warnings: ["Potassium supplements"],
    remaining: 18,
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: 3,
    name: "Atorvastatin",
    purpose: "Cholesterol",
    dosage: "20mg",
    schedule: "10:00 PM",
    food: "With or without food",
    sideEffects: ["Muscle pain"],
    warnings: ["Grapefruit"],
    remaining: 12,
    color: "from-purple-500 to-fuchsia-600",
  },
  {
    id: 4,
    name: "Aspirin",
    purpose: "Cardiovascular protection",
    dosage: "81mg",
    schedule: "9:00 AM",
    food: "With food",
    sideEffects: ["Stomach upset"],
    warnings: ["Blood thinners"],
    remaining: 30,
    color: "from-rose-500 to-orange-500",
  },
];

export const activity = [
  { type: "Medicine taken", detail: "Metformin 500mg", time: "8:02 AM", tone: "success" },
  { type: "Reminder sent", detail: "Push notification — Lisinopril", time: "9:00 AM", tone: "info" },
  { type: "Bottle opened", detail: "Smart Bottle #A2 · Kitchen", time: "9:03 AM", tone: "info" },
  { type: "Voice interaction", detail: '"Did I take my morning pills?"', time: "9:15 AM", tone: "accent" },
  { type: "Clinician review", detail: "Dr. Patel reviewed weekly report", time: "Yesterday", tone: "success" },
  { type: "Medicine missed", detail: "Atorvastatin 20mg", time: "Yesterday, 10:00 PM", tone: "danger" },
];

export const patients = [
  { name: "Emma Wilson", age: 58, disease: "Diabetes", risk: "High", status: "Missed", lastDose: "6h ago" },
  { name: "James Carter", age: 71, disease: "Hypertension", risk: "Medium", status: "On track", lastDose: "1h ago" },
  { name: "Priya Menon", age: 64, disease: "Cardiac", risk: "Low", status: "On track", lastDose: "3h ago" },
  { name: "Robert Kim", age: 69, disease: "COPD", risk: "High", status: "Delayed", lastDose: "8h ago" },
  { name: "Sofia Alvarez", age: 55, disease: "Diabetes", risk: "Medium", status: "On track", lastDose: "2h ago" },
  { name: "David Chen", age: 74, disease: "Cardiac", risk: "Low", status: "On track", lastDose: "1h ago" },
];

export const notifications = [
  { title: "Medicine Taken", body: "Metformin 500mg logged", time: "2m ago", type: "success", channel: "Push" },
  { title: "Refill Reminder", body: "Atorvastatin — 5 days left", time: "1h ago", type: "warning", channel: "SMS" },
  { title: "Risk Increased", body: "Evening adherence dropped 12%", time: "3h ago", type: "danger", channel: "AI" },
  { title: "Voice Reminder Sent", body: "Bedtime medication check", time: "5h ago", type: "info", channel: "Voice" },
  { title: "Bottle Offline", body: "Smart Bottle #A2 disconnected", time: "Yesterday", type: "warning", channel: "Device" },
  { title: "Doctor Message", body: "Dr. Patel: 'Great progress this week!'", time: "Yesterday", type: "info", channel: "Clinician" },
];

export const sensorReadings = {
  battery: 82,
  wifi: "Excellent",
  temperature: "24.5°C",
  weight: "128g",
  lid: "Closed",
  motion: "Idle",
  pillCount: 18,
  lastOpened: "8:02 AM",
  sensorHealth: 96,
};

export const voiceCommands = [
  "Did I take my medicine?",
  "What is my next dose?",
  "Read today's schedule",
  "Call my doctor",
  "Notify caregiver",
  "Why am I high risk?",
];

export const conversation = [
  { role: "user", text: "Did I take my morning pills?" },
  { role: "ai", text: "Yes, John. You took Metformin at 8:02 AM and Lisinopril at 9:00 AM. Your next dose is Metformin at 8:00 PM." },
  { role: "user", text: "Remind me 15 minutes earlier tonight." },
  { role: "ai", text: "Done. I'll notify you at 7:45 PM via push and voice reminder." },
];

export const behaviorHeatmap = Array.from({ length: 7 }, (_, r) =>
  Array.from({ length: 24 }, (_, c) => ({
    day: r,
    hour: c,
    value: Math.max(0, Math.round(Math.sin(c / 3 + r) * 40 + 50 + (c > 18 ? -20 : 0))),
  })),
).flat();

export const inventory = medications.map((m) => ({
  name: m.name,
  remaining: m.remaining,
  total: 30,
  refillDate: new Date(Date.now() + m.remaining * 24 * 3600 * 1000).toLocaleDateString(),
}));
