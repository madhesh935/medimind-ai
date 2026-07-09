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
  { name: "AI Chat", value: 25, color: "hsl(280 75% 55%)" },
  { name: "SMS", value: 18, color: "hsl(160 70% 45%)" },
  { name: "WhatsApp", value: 12, color: "hsl(45 90% 55%)" },
];

export const medications = [
  { id: 1, name: "Metformin", purpose: "Blood sugar control", dosage: "500mg", schedule: "8:00 AM · 8:00 PM", food: "With meals", sideEffects: ["Nausea", "Digestive discomfort"], warnings: ["Alcohol interaction"], remaining: 24, color: "from-blue-500 to-indigo-600" },
  { id: 2, name: "Lisinopril", purpose: "Blood pressure", dosage: "10mg", schedule: "9:00 AM", food: "Any time", sideEffects: ["Dry cough", "Dizziness"], warnings: ["Potassium supplements"], remaining: 18, color: "from-emerald-500 to-teal-600" },
  { id: 3, name: "Atorvastatin", purpose: "Cholesterol", dosage: "20mg", schedule: "10:00 PM", food: "With or without food", sideEffects: ["Muscle pain"], warnings: ["Grapefruit"], remaining: 12, color: "from-purple-500 to-fuchsia-600" },
  { id: 4, name: "Aspirin", purpose: "Cardiovascular protection", dosage: "81mg", schedule: "9:00 AM", food: "With food", sideEffects: ["Stomach upset"], warnings: ["Blood thinners"], remaining: 30, color: "from-rose-500 to-orange-500" },
];

export const todaysSchedule = [
  { time: "8:00 AM", name: "Metformin", dosage: "500mg", status: "taken" },
  { time: "9:00 AM", name: "Lisinopril", dosage: "10mg", status: "taken" },
  { time: "9:00 AM", name: "Aspirin", dosage: "81mg", status: "taken" },
  { time: "8:00 PM", name: "Metformin", dosage: "500mg", status: "upcoming" },
  { time: "10:00 PM", name: "Atorvastatin", dosage: "20mg", status: "upcoming" },
];

export const activity = [
  { type: "Medicine taken", detail: "Metformin 500mg", time: "8:02 AM", tone: "success" },
  { type: "Reminder sent", detail: "Push notification — Lisinopril", time: "9:00 AM", tone: "info" },
  { type: "Bottle opened", detail: "Smart Bottle #A2 · Kitchen", time: "9:03 AM", tone: "info" },
  { type: "AI interaction", detail: '"Did I take my morning pills?"', time: "9:15 AM", tone: "accent" },
  { type: "Clinician review", detail: "Dr. Patel reviewed weekly report", time: "Yesterday", tone: "success" },
  { type: "Medicine missed", detail: "Atorvastatin 20mg", time: "Yesterday, 10:00 PM", tone: "danger" },
];

export const patients = [
  { name: "Emma Wilson", age: 58, disease: "Type 2 Diabetes", medication: "Metformin, Insulin", risk: "High", adherence: 68, status: "Missed", lastDose: "6h ago", doctor: "Dr. Priya Patel" },
  { name: "James Carter", age: 71, disease: "Hypertension", medication: "Lisinopril, Aspirin", risk: "Medium", adherence: 82, status: "On track", lastDose: "1h ago", doctor: "Dr. Marcus Lee" },
  { name: "Priya Menon", age: 64, disease: "Cardiac", medication: "Atorvastatin, Metoprolol", risk: "Low", adherence: 96, status: "On track", lastDose: "3h ago", doctor: "Dr. Marcus Lee" },
  { name: "Robert Kim", age: 69, disease: "COPD", medication: "Tiotropium, Prednisone", risk: "High", adherence: 61, status: "Delayed", lastDose: "8h ago", doctor: "Dr. Samuel Okafor" },
  { name: "Sofia Alvarez", age: 55, disease: "Type 2 Diabetes", medication: "Metformin", risk: "Medium", adherence: 79, status: "On track", lastDose: "2h ago", doctor: "Dr. Priya Patel" },
  { name: "David Chen", age: 74, disease: "Cardiac", medication: "Warfarin, Statin", risk: "Low", adherence: 94, status: "On track", lastDose: "1h ago", doctor: "Dr. Elena Rossi" },
  { name: "Aisha Rahman", age: 47, disease: "Asthma", medication: "Albuterol", risk: "Low", adherence: 91, status: "On track", lastDose: "4h ago", doctor: "Dr. Samuel Okafor" },
  { name: "Michael O'Connor", age: 66, disease: "Hypertension", medication: "Amlodipine", risk: "Medium", adherence: 76, status: "On track", lastDose: "2h ago", doctor: "Dr. Hannah Weiss" },
];

export const doctors = [
  { name: "Dr. Priya Patel", specialty: "Internal Medicine", patients: 138, rating: 4.9, status: "Active" },
  { name: "Dr. Marcus Lee", specialty: "Cardiology", patients: 92, rating: 4.8, status: "Active" },
  { name: "Dr. Elena Rossi", specialty: "Endocrinology", patients: 104, rating: 4.9, status: "Active" },
  { name: "Dr. Samuel Okafor", specialty: "Pulmonology", patients: 71, rating: 4.7, status: "On leave" },
  { name: "Dr. Hannah Weiss", specialty: "Geriatrics", patients: 118, rating: 4.9, status: "Active" },
];

const patientNotifications = [
  { title: "Medicine Taken", body: "Metformin 500mg logged", time: "2m ago", type: "success", channel: "Push", read: false },
  { title: "Refill Reminder", body: "Atorvastatin — 5 days left", time: "1h ago", type: "warning", channel: "SMS", read: false },
  { title: "Risk Increased", body: "Evening adherence dropped 12%", time: "3h ago", type: "danger", channel: "AI", read: false },
  { title: "AI Reminder Sent", body: "Bedtime medication check", time: "5h ago", type: "info", channel: "AI", read: true },
  { title: "Bottle Offline", body: "Smart Bottle #A2 disconnected", time: "Yesterday", type: "warning", channel: "Device", read: true },
  { title: "Doctor Message", body: "Dr. Patel: 'Great progress this week!'", time: "Yesterday", type: "info", channel: "Clinician", read: true },
];

const doctorNotifications = [
  { title: "Critical Alert", body: "Michael Torres — INR check needed immediately", time: "10m ago", type: "danger", channel: "AI", read: false },
  { title: "New Patient Message", body: "Sarah Connor: 'My inhaler ran out yesterday.'", time: "35m ago", type: "info", channel: "Push", read: false },
  { title: "Adherence Drop Alert", body: "Robert Kim — adherence fell 18% this week", time: "2h ago", type: "warning", channel: "AI", read: false },
  { title: "Lab Results Ready", body: "Priya Patel — TSH panel came back normal", time: "4h ago", type: "success", channel: "Clinician", read: true },
  { title: "Prescription Renewal Request", body: "James Carter requested a Lisinopril refill", time: "Yesterday", type: "info", channel: "SMS", read: true },
  { title: "Appointment Reminder", body: "6 appointments scheduled today, starting 9:00 AM", time: "Yesterday", type: "info", channel: "Push", read: true },
];

const adminNotifications = [
  { title: "Suspicious Login Attempt", body: "3 failed logins from IP 203.0.113.45", time: "8m ago", type: "danger", channel: "AI", read: false },
  { title: "Storage Usage Warning", body: "Platform storage at 62% — trending toward 75% in 6 weeks", time: "1h ago", type: "warning", channel: "Device", read: false },
  { title: "New Doctor Added", body: "Dr. Hannah Weiss onboarded — Geriatrics", time: "3h ago", type: "success", channel: "Clinician", read: false },
  { title: "Device Firmware Update Available", body: "12 Smart Bottles eligible for v2.4.1 update", time: "5h ago", type: "info", channel: "Device", read: true },
  { title: "Monthly Compliance Report Ready", body: "July platform adherence report generated", time: "Yesterday", type: "info", channel: "SMS", read: true },
  { title: "System Backup Completed", body: "Nightly backup finished — 8,420 devices synced", time: "Yesterday", type: "success", channel: "AI", read: true },
];

export const notificationsByRole = {
  patient: patientNotifications,
  doctor: doctorNotifications,
  admin: adminNotifications,
};

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

export const conversation = [
  { role: "user", text: "Did I take my morning pills?" },
  { role: "ai", text: "Yes, John. You took Metformin at 8:02 AM and Lisinopril at 9:00 AM. Your next dose is Metformin at 8:00 PM." },
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

// Admin
export const platformStats = {
  totalUsers: 12840,
  doctors: 342,
  patients: 11290,
  bottlesConnected: 8420,
  activeDevices: 7912,
  offlineDevices: 508,
  dailyEvents: 48210,
  systemHealth: 99.4,
};

export const platformUsage = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
  users: 400 + Math.round(Math.sin(i / 2) * 200 + i * 60),
  events: 2000 + Math.round(Math.cos(i / 2) * 800 + i * 300),
}));

export const auditLogs = [
  { actor: "Dr. Priya Patel", action: "Updated prescription", target: "Emma Wilson", time: "2m ago", severity: "info" },
  { actor: "System", action: "Auto-refill triggered", target: "Atorvastatin", time: "12m ago", severity: "info" },
  { actor: "Alex Morgan", action: "Added new doctor", target: "Dr. Hannah Weiss", time: "1h ago", severity: "success" },
  { actor: "AI Engine", action: "Flagged high risk", target: "Robert Kim", time: "3h ago", severity: "warning" },
  { actor: "Sarah Anderson", action: "Sent emergency alert", target: "John Anderson", time: "Yesterday", severity: "danger" },
  { actor: "System", action: "Device firmware update", target: "Bottle fleet v3.2.1", time: "Yesterday", severity: "info" },
];

export const devices = [
  { id: "SB-A2-8891", type: "Smart Bottle Pro", owner: "John Anderson", battery: 82, status: "Online", firmware: "3.2.1" },
  { id: "SB-A2-8792", type: "Smart Bottle Pro", owner: "Emma Wilson", battery: 42, status: "Online", firmware: "3.2.1" },
  { id: "SB-A1-6612", type: "Smart Bottle", owner: "James Carter", battery: 21, status: "Low battery", firmware: "3.1.8" },
  { id: "SB-A2-9014", type: "Smart Bottle Pro", owner: "Priya Menon", battery: 91, status: "Online", firmware: "3.2.1" },
  { id: "SB-A1-4423", type: "Smart Bottle", owner: "Robert Kim", battery: 0, status: "Offline", firmware: "3.1.8" },
];

// AI Assistant chat history / suggestions — phrased for each portal's audience
export const chatSuggestionsByRole = {
  patient: [
    "Did I take my medicine today?",
    "When is my next dose?",
    "Show my adherence report.",
    "Explain my medication.",
    "What medicines interact with Metformin?",
    "Why is my risk score high?",
    "Summarize my health.",
    "Generate weekly report.",
    "Show refill status.",
  ],
  doctor: [
    "Which patients are high risk today?",
    "Summarize today's appointments.",
    "Draft a follow-up note for Emma Wilson.",
    "What's my panel's average adherence?",
    "Any critical alerts I should review?",
    "Show adherence trend for Robert Kim.",
    "Suggest a prescription change for James Carter.",
    "Generate a clinic compliance report.",
  ],
  admin: [
    "Show platform usage this month.",
    "Which devices need firmware updates?",
    "Summarize today's audit logs.",
    "How many critical alerts are open?",
    "Generate a hospital compliance report.",
    "What's our average patient adherence?",
    "Show doctors with the most patients.",
    "Any suspicious login activity?",
  ],
};

export const chatHistoryGroups = [
  {
    label: "Today",
    items: [
      { id: "t1", title: "Morning medication check", preview: "Yes, you took Metformin at 8:03 AM", pinned: true },
      { id: "t2", title: "Weekly adherence report", preview: "Your adherence is 94% this week" },
    ],
  },
  {
    label: "Yesterday",
    items: [
      { id: "y1", title: "Drug interaction: Metformin", preview: "Grapefruit may reduce absorption…" },
      { id: "y2", title: "Refill status", preview: "Atorvastatin — 5 days remaining" },
    ],
  },
  {
    label: "Last week",
    items: [
      { id: "l1", title: "Explain Lisinopril", preview: "Lisinopril is an ACE inhibitor used…" },
      { id: "l2", title: "Blood pressure trends", preview: "Systolic average is 128 mmHg" },
      { id: "l3", title: "Risk score deep dive", preview: "Three factors influence your score" },
    ],
  },
];

// --- AI Prediction Data ---
export const aiPrediction = {
  currentRisk: "Low",
  futureRisk7Days: "Low",
  futureRisk30Days: "Moderate",
  confidence: 96,
  nextMissProbability: 18,
  expectedMonthlyAdherence: 92,
  summary: "Based on your recent behaviour, you are likely to miss evening doses during weekends.",
  explainability: [
    "Missed evening medicines twice this week.",
    "Weekend adherence decreased.",
    "Average delay increased by 10 minutes.",
    "Previous reminders were ignored."
  ],
  recommendations: [
    "Take medicine before dinner.",
    "Enable bedtime reminders.",
    "Refill medicine within 5 days.",
    "Contact your doctor if another dose is missed."
  ],
  forecast30Days: Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    predictedAdherence: 95 - Math.round(Math.pow(i, 1.2) * 0.3) + Math.round(Math.random() * 4),
    lowerBound: 90 - Math.round(Math.pow(i, 1.3) * 0.4),
    upperBound: 99
  }))
};

// --- Telemedicine Data ---
export const telemedicineData = {
  doctor: {
    name: "Dr. Sarah Jenkins",
    specialization: "Endocrinologist",
    hospital: "MediMind Central Hospital",
    avatar: "SJ",
    availability: "Available Tomorrow",
  },
  nextAppointment: {
    date: "Tomorrow",
    time: "10:30 AM",
    type: "Video Consultation",
    status: "Confirmed",
  },
  upcomingConsultations: [
    { day: "Tomorrow", type: "Video Consultation", icon: "Video" },
    { day: "Monday", type: "Prescription Review", icon: "FileText" },
    { day: "Friday", type: "Routine Follow-up", icon: "Stethoscope" }
  ],
  recentConsultation: "June 14th, 2026",
  prescriptionStatus: "Updated",
};

// --- Gamification Data ---
export const gamificationData = {
  level: 5,
  currentXP: 420,
  neededXP: 1000,
  rewardPoints: 1250,
  todaysBonus: 50,
  weeklyBonus: 200,
  monthlyBonus: 1000,
  nextReward: "Free Dietitian Consult",
  streak: { current: 12, best: 45 },
  achievements: [
    { title: "7-Day Streak", icon: "🔥", color: "bg-orange-500/10 text-orange-600" },
    { title: "Medication Champion", icon: "🏆", color: "bg-amber-500/10 text-amber-600" },
    { title: "Early Bird", icon: "🌅", color: "bg-blue-500/10 text-blue-600" },
    { title: "Perfect Week", icon: "⭐", color: "bg-purple-500/10 text-purple-600" },
  ],
  dailyChallenges: [
    { title: "Take all medicines today", progress: 66, max: 100, reward: "+50 XP", done: false },
    { title: "Never delay more than 10 mins", progress: 100, max: 100, reward: "+100 XP", done: true },
    { title: "Check Smart Bottle", progress: 0, max: 1, reward: "+20 XP", done: false },
  ],
  motivational: [
    "You've improved by 12% this month.",
    "Only 2 more days to unlock your next badge.",
    "Excellent consistency this week.",
    "Your doctor has noticed your progress."
  ],
  leaderboard: {
    healthScore: "Top 20%",
    consistencyRank: "Gold Level"
  }
};
