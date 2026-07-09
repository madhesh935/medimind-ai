import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Video, Phone, Search, Filter, Paperclip, Mic, Send, X, Pill,
  FileText, MoreVertical, CheckCheck, Check, Clock, Bot, Bell, AlertTriangle,
  Star, Activity, ChevronDown, Calendar, Wifi, WifiOff, Battery,
  BatteryMedium, ShieldAlert, TrendingUp, TrendingDown, Stethoscope,
  ClipboardList, Download, Share2, UserPlus, Pin, Smile, Image,
  ScreenShare, PhoneOff, VideoOff, MicOff, ChevronRight, Zap, Info,
  MessageSquarePlus, Inbox, Users, Radio,
} from "lucide-react";
import { useRole } from "@/lib/role-store";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { getMyDoctorProfile, upsertMyDoctorProfile } from "@/lib/api";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_app/telemedicine")({ component: Telemedicine });

// ─── Types ─────────────────────────────────────────────────────────────────────

type RiskLevel = "High" | "Medium" | "Low";
type BottleStatus = "Online" | "Offline";
type MsgType = "text" | "image" | "report" | "medicine" | "voice";

interface Patient {
  id: number;
  name: string;
  age: number;
  avatar: string;
  initials: string;
  disease: string;
  risk: RiskLevel;
  adherence: number;
  lastMessage: string;
  lastActive: string;
  unread: number;
  appointmentTime: string | null;
  bottleStatus: BottleStatus;
  online: boolean;
  activeMeds: string[];
  doctor: string;
  futureRisk: string;
  riskReasons: string[];
  upcomingMeds: { name: string; time: string; status: "due" | "taken" | "missed" }[];
  timeline: { date: string; event: string; type: "appointment" | "report" | "medicine" | "alert" }[];
  aiNote: string;
}

interface Message {
  id: number;
  from: "doctor" | "patient";
  text: string;
  time: string;
  type: MsgType;
  read: boolean;
  pinned?: boolean;
}

// ─── Shared Doctor ─────────────────────────────────────────────────────────────

const SHARED_DOCTOR = {
  name: "Dr. Sarah Chen",
  specialty: "Cardiologist",
  avatar: "https://i.pravatar.cc/150?u=dr_sarah_chen",
  initials: "SC",
};

// ─── 18 Dummy Patients ─────────────────────────────────────────────────────────

const ALL_PATIENTS: Patient[] = [
  {
    id: 1, name: "John Anderson", age: 42, avatar: "https://i.pravatar.cc/150?u=john_anderson",
    initials: "JA", disease: "Type 2 Diabetes • Hypertension", risk: "Low", adherence: 94,
    lastMessage: "Should I skip the evening dose today?", lastActive: "2 min ago", unread: 2,
    appointmentTime: "10:30 AM", bottleStatus: "Online", online: true,
    activeMeds: ["Lisinopril 10mg", "Metformin 500mg", "Atorvastatin 20mg"],
    doctor: SHARED_DOCTOR.name, futureRisk: "Low", riskReasons: ["Good adherence streak", "Stable vitals", "On-time refills"],
    upcomingMeds: [{ name: "Metformin 500mg", time: "1:00 PM", status: "due" }, { name: "Lisinopril 10mg", time: "8:00 PM", status: "due" }],
    timeline: [{ date: "Jul 8", event: "Lab Report uploaded", type: "report" }, { date: "Jul 5", event: "Appointment with Dr. Chen", type: "appointment" }, { date: "Jun 28", event: "Metformin dose increased", type: "medicine" }],
    aiNote: "Patient maintains excellent adherence. Recommend maintaining current regimen.",
  },
  {
    id: 2, name: "Sarah Connor", age: 35, avatar: "https://i.pravatar.cc/150?u=sarah_connor",
    initials: "SC", disease: "Asthma • Allergies", risk: "Medium", adherence: 76,
    lastMessage: "My inhaler ran out yesterday.", lastActive: "15 min ago", unread: 1,
    appointmentTime: "11:00 AM", bottleStatus: "Online", online: true,
    activeMeds: ["Albuterol Inhaler", "Montelukast 10mg"],
    doctor: SHARED_DOCTOR.name, futureRisk: "High", riskReasons: ["Missed 3 evening doses this week", "Weekend non-compliance pattern", "Inhaler depleted"],
    upcomingMeds: [{ name: "Montelukast 10mg", time: "9:00 PM", status: "due" }],
    timeline: [{ date: "Jul 7", event: "Refill requested", type: "medicine" }, { date: "Jul 1", event: "Asthma attack alert", type: "alert" }],
    aiNote: "High risk of asthma episode. Recommend scheduling urgent follow-up and refill authorization.",
  },
  {
    id: 3, name: "Michael Torres", age: 58, avatar: "https://i.pravatar.cc/150?u=michael_torres",
    initials: "MT", disease: "Cardiac Arrhythmia", risk: "High", adherence: 61,
    lastMessage: "Feeling palpitations since morning.", lastActive: "1 hr ago", unread: 3,
    appointmentTime: "11:30 AM", bottleStatus: "Offline", online: false,
    activeMeds: ["Amiodarone 200mg", "Lisinopril 5mg", "Warfarin 5mg"],
    doctor: SHARED_DOCTOR.name, futureRisk: "High", riskReasons: ["Critical adherence drop", "Missed Warfarin 4 days", "Offline bottle — no sync"],
    upcomingMeds: [{ name: "Amiodarone 200mg", time: "Now", status: "missed" }, { name: "Warfarin 5mg", time: "6:00 PM", status: "due" }],
    timeline: [{ date: "Jul 8", event: "⚠ Missed Warfarin dose — Alert sent", type: "alert" }, { date: "Jul 3", event: "Cardiology appointment", type: "appointment" }],
    aiNote: "CRITICAL: Patient missed Warfarin for 4 days. Recommend immediate call and emergency refill.",
  },
  {
    id: 4, name: "Priya Patel", age: 29, avatar: "https://i.pravatar.cc/150?u=priya_patel",
    initials: "PP", disease: "Hypothyroidism", risk: "Low", adherence: 98,
    lastMessage: "TSH levels came back normal!", lastActive: "3 hrs ago", unread: 0,
    appointmentTime: null, bottleStatus: "Online", online: false,
    activeMeds: ["Levothyroxine 50mcg"],
    doctor: SHARED_DOCTOR.name, futureRisk: "Low", riskReasons: ["Perfect adherence", "Stable hormone levels"],
    upcomingMeds: [{ name: "Levothyroxine 50mcg", time: "7:00 AM (taken)", status: "taken" }],
    timeline: [{ date: "Jul 6", event: "TSH Lab Report — Normal", type: "report" }, { date: "Jun 20", event: "6-month check-up", type: "appointment" }],
    aiNote: "Excellent management. No changes needed. Next follow-up in 3 months.",
  },
  {
    id: 5, name: "Robert Kim", age: 67, avatar: "https://i.pravatar.cc/150?u=robert_kim",
    initials: "RK", disease: "COPD • Heart Failure", risk: "High", adherence: 54,
    lastMessage: "Breathing has been harder at night.", lastActive: "30 min ago", unread: 4,
    appointmentTime: "2:00 PM", bottleStatus: "Offline", online: true,
    activeMeds: ["Furosemide 40mg", "Carvedilol 12.5mg", "Spironolactone 25mg"],
    doctor: SHARED_DOCTOR.name, futureRisk: "High", riskReasons: ["Severe adherence drop", "Nocturnal symptoms increasing", "Fluid retention likely"],
    upcomingMeds: [{ name: "Furosemide 40mg", time: "Now", status: "missed" }, { name: "Carvedilol 12.5mg", time: "8:00 PM", status: "due" }],
    timeline: [{ date: "Jul 8", event: "⚠ Oxygen saturation low — Alert", type: "alert" }, { date: "Jul 2", event: "Cardiology referral", type: "appointment" }],
    aiNote: "URGENT: Nocturnal dyspnea + fluid retention signs. Consider hospitalization assessment.",
  },
  {
    id: 6, name: "Linda Foster", age: 44, avatar: "https://i.pravatar.cc/150?u=linda_foster",
    initials: "LF", disease: "Rheumatoid Arthritis", risk: "Medium", adherence: 82,
    lastMessage: "Morning stiffness is better this week.", lastActive: "5 hrs ago", unread: 0,
    appointmentTime: null, bottleStatus: "Online", online: false,
    activeMeds: ["Methotrexate 15mg", "Folic Acid 5mg", "Hydroxychloroquine 200mg"],
    doctor: SHARED_DOCTOR.name, futureRisk: "Medium", riskReasons: ["Occasional missed weekend doses", "Improving symptom trend"],
    upcomingMeds: [{ name: "Methotrexate 15mg", time: "Sunday", status: "due" }],
    timeline: [{ date: "Jul 4", event: "Joint pain assessment", type: "appointment" }, { date: "Jun 25", event: "Lab: CBC normal", type: "report" }],
    aiNote: "Good improvement trend. Monitor for Methotrexate toxicity — schedule monthly LFT.",
  },
  {
    id: 7, name: "James Murphy", age: 51, avatar: "https://i.pravatar.cc/150?u=james_murphy",
    initials: "JM", disease: "Chronic Kidney Disease", risk: "High", adherence: 69,
    lastMessage: "Had nausea after afternoon tablet.", lastActive: "45 min ago", unread: 2,
    appointmentTime: "3:30 PM", bottleStatus: "Online", online: true,
    activeMeds: ["Epoetin Alfa", "Sodium Bicarbonate 500mg", "Calcium Carbonate 500mg"],
    doctor: SHARED_DOCTOR.name, futureRisk: "High", riskReasons: ["GFR declining trend", "Nausea side effects", "Missed dialysis prep meds"],
    upcomingMeds: [{ name: "Sodium Bicarbonate", time: "3:00 PM", status: "due" }],
    timeline: [{ date: "Jul 7", event: "Nephrology consult", type: "appointment" }, { date: "Jul 5", event: "GFR Lab — Declining", type: "report" }],
    aiNote: "GFR trending down. Discuss dialysis planning at next appointment.",
  },
  {
    id: 8, name: "Emily Watson", age: 38, avatar: "https://i.pravatar.cc/150?u=emily_watson",
    initials: "EW", disease: "Bipolar Disorder • Anxiety", risk: "Medium", adherence: 88,
    lastMessage: "Feeling much more stable this month.", lastActive: "2 hrs ago", unread: 0,
    appointmentTime: null, bottleStatus: "Online", online: false,
    activeMeds: ["Lithium Carbonate 300mg", "Quetiapine 50mg", "Escitalopram 10mg"],
    doctor: SHARED_DOCTOR.name, futureRisk: "Low", riskReasons: ["Stable mood trends", "Consistent evening dose"],
    upcomingMeds: [{ name: "Quetiapine 50mg", time: "9:00 PM", status: "due" }, { name: "Lithium Carbonate", time: "9:00 PM", status: "due" }],
    timeline: [{ date: "Jul 6", event: "Psychiatry check-in", type: "appointment" }, { date: "Jun 30", event: "Lithium level — Therapeutic", type: "report" }],
    aiNote: "Stable on current regimen. Continue monthly monitoring of Lithium levels.",
  },
  {
    id: 9, name: "David Chen", age: 63, avatar: "https://i.pravatar.cc/150?u=david_chen",
    initials: "DC", disease: "Parkinson's Disease", risk: "Medium", adherence: 79,
    lastMessage: "Tremors are manageable with current dose.", lastActive: "1 day ago", unread: 0,
    appointmentTime: null, bottleStatus: "Online", online: false,
    activeMeds: ["Levodopa 100mg", "Carbidopa 25mg", "Pramipexole 0.5mg"],
    doctor: SHARED_DOCTOR.name, futureRisk: "Medium", riskReasons: ["Occasional morning dose delays", "Symptom control stable"],
    upcomingMeds: [{ name: "Levodopa/Carbidopa", time: "2:00 PM", status: "due" }, { name: "Levodopa/Carbidopa", time: "6:00 PM", status: "due" }],
    timeline: [{ date: "Jul 1", event: "Neurology follow-up", type: "appointment" }, { date: "Jun 20", event: "DBS assessment", type: "report" }],
    aiNote: "Tremor control adequate. Consider timing adjustment for morning dose to improve ON time.",
  },
  {
    id: 10, name: "Maria Gonzalez", age: 47, avatar: "https://i.pravatar.cc/150?u=maria_gonzalez",
    initials: "MG", disease: "Lupus • Hypertension", risk: "Medium", adherence: 85,
    lastMessage: "Rash on cheeks — should I be worried?", lastActive: "4 hrs ago", unread: 1,
    appointmentTime: "4:00 PM", bottleStatus: "Online", online: true,
    activeMeds: ["Hydroxychloroquine 200mg", "Prednisone 10mg", "Amlodipine 5mg"],
    doctor: SHARED_DOCTOR.name, futureRisk: "Medium", riskReasons: ["Butterfly rash flare", "Missed 2 HCQ doses"],
    upcomingMeds: [{ name: "Prednisone 10mg", time: "Now", status: "due" }, { name: "Hydroxychloroquine", time: "8:00 PM", status: "due" }],
    timeline: [{ date: "Jul 8", event: "Lupus flare symptom", type: "alert" }, { date: "Jul 1", event: "Rheumatology appointment", type: "appointment" }],
    aiNote: "Possible lupus flare. Recommend ANA panel and dsDNA antibody test urgently.",
  },
  {
    id: 11, name: "Alex Thompson", age: 33, avatar: "https://i.pravatar.cc/150?u=alex_thompson",
    initials: "AT", disease: "Type 1 Diabetes", risk: "Low", adherence: 96,
    lastMessage: "CGM readings looking great today!", lastActive: "20 min ago", unread: 0,
    appointmentTime: null, bottleStatus: "Online", online: true,
    activeMeds: ["Insulin Glargine 20U", "Insulin Lispro (mealtime)"],
    doctor: SHARED_DOCTOR.name, futureRisk: "Low", riskReasons: ["Excellent CGM control", "HbA1c within target"],
    upcomingMeds: [{ name: "Insulin Glargine", time: "10:00 PM", status: "due" }],
    timeline: [{ date: "Jul 7", event: "HbA1c — 6.8% (Target met)", type: "report" }],
    aiNote: "Excellent glycemic control. Maintain current insulin regimen.",
  },
  {
    id: 12, name: "Susan Park", age: 56, avatar: "https://i.pravatar.cc/150?u=susan_park",
    initials: "SP", disease: "Osteoporosis • Vit D deficiency", risk: "Low", adherence: 91,
    lastMessage: "Bone density scan scheduled for Friday.", lastActive: "6 hrs ago", unread: 0,
    appointmentTime: null, bottleStatus: "Online", online: false,
    activeMeds: ["Alendronate 70mg (weekly)", "Calcium Carbonate 500mg", "Vitamin D3 2000IU"],
    doctor: SHARED_DOCTOR.name, futureRisk: "Low", riskReasons: ["Good adherence", "Supplement levels improving"],
    upcomingMeds: [{ name: "Calcium Carbonate", time: "12:00 PM", status: "taken" }, { name: "Vitamin D3", time: "12:00 PM", status: "taken" }],
    timeline: [{ date: "Jul 9", event: "Bone density scan scheduled", type: "appointment" }, { date: "Jun 15", event: "Vitamin D levels improved", type: "report" }],
    aiNote: "Good progress on bone density. Review DEXA scan results next visit.",
  },
  {
    id: 13, name: "Thomas Wright", age: 71, avatar: "https://i.pravatar.cc/150?u=thomas_wright",
    initials: "TW", disease: "Prostate Cancer (remission)", risk: "Low", adherence: 89,
    lastMessage: "PSA test was within normal range!", lastActive: "1 day ago", unread: 0,
    appointmentTime: null, bottleStatus: "Offline", online: false,
    activeMeds: ["Enzalutamide 160mg", "Calcium 500mg"],
    doctor: SHARED_DOCTOR.name, futureRisk: "Low", riskReasons: ["PSA stable", "In remission"],
    upcomingMeds: [{ name: "Enzalutamide 160mg", time: "9:00 AM (taken)", status: "taken" }],
    timeline: [{ date: "Jul 6", event: "PSA Normal — Remission maintained", type: "report" }, { date: "Jun 1", event: "Oncology follow-up", type: "appointment" }],
    aiNote: "Stable remission. Continue current therapy. Next PSA in 3 months.",
  },
  {
    id: 14, name: "Rachel Adams", age: 26, avatar: "https://i.pravatar.cc/150?u=rachel_adams",
    initials: "RA", disease: "Epilepsy", risk: "Medium", adherence: 80,
    lastMessage: "Had a mild seizure this morning.", lastActive: "10 min ago", unread: 5,
    appointmentTime: "5:00 PM", bottleStatus: "Online", online: true,
    activeMeds: ["Levetiracetam 500mg", "Lamotrigine 100mg"],
    doctor: SHARED_DOCTOR.name, futureRisk: "High", riskReasons: ["Seizure episode today", "Missed 2 morning doses", "Sleep deprivation reported"],
    upcomingMeds: [{ name: "Levetiracetam 500mg", time: "Now", status: "missed" }, { name: "Lamotrigine 100mg", time: "9:00 PM", status: "due" }],
    timeline: [{ date: "Jul 9", event: "⚠ Seizure reported", type: "alert" }, { date: "Jun 28", event: "EEG — Stable", type: "report" }],
    aiNote: "URGENT: Seizure today + missed doses. Immediate consultation required. Consider dose adjustment.",
  },
  {
    id: 15, name: "Kevin Nguyen", age: 45, avatar: "https://i.pravatar.cc/150?u=kevin_nguyen",
    initials: "KN", disease: "HIV (managed) • Hyperlipidemia", risk: "Low", adherence: 97,
    lastMessage: "Viral load undetectable — very happy!", lastActive: "3 hrs ago", unread: 0,
    appointmentTime: null, bottleStatus: "Online", online: false,
    activeMeds: ["Biktarvy (BIC/FTC/TAF)", "Rosuvastatin 10mg"],
    doctor: SHARED_DOCTOR.name, futureRisk: "Low", riskReasons: ["Undetectable viral load", "Excellent ART adherence"],
    upcomingMeds: [{ name: "Biktarvy", time: "8:00 PM", status: "due" }],
    timeline: [{ date: "Jul 5", event: "Viral Load — Undetectable", type: "report" }, { date: "Jun 20", event: "Infectious disease follow-up", type: "appointment" }],
    aiNote: "Excellent treatment response. U=U status maintained. Continue current ART regimen.",
  },
  {
    id: 16, name: "Anna Kowalski", age: 52, avatar: "https://i.pravatar.cc/150?u=anna_kowalski",
    initials: "AK", disease: "Breast Cancer (post-chemo)", risk: "Medium", adherence: 83,
    lastMessage: "Hair is starting to grow back!", lastActive: "8 hrs ago", unread: 0,
    appointmentTime: null, bottleStatus: "Online", online: false,
    activeMeds: ["Tamoxifen 20mg", "Zoledronic Acid (monthly IV)"],
    doctor: SHARED_DOCTOR.name, futureRisk: "Low", riskReasons: ["Post-chemo stabilization", "Tamoxifen compliance improving"],
    upcomingMeds: [{ name: "Tamoxifen 20mg", time: "8:00 AM (taken)", status: "taken" }],
    timeline: [{ date: "Jul 3", event: "Post-chemo assessment", type: "appointment" }, { date: "Jun 28", event: "Tumor markers — Negative", type: "report" }],
    aiNote: "Good recovery trajectory. Schedule 6-month mammogram. Continue Tamoxifen for 5 years.",
  },
  {
    id: 17, name: "George Harrison", age: 74, avatar: "https://i.pravatar.cc/150?u=george_harrison",
    initials: "GH", disease: "Alzheimer's (early) • HTN", risk: "High", adherence: 48,
    lastMessage: "Caregiver: He forgot morning pills again.", lastActive: "2 hrs ago", unread: 3,
    appointmentTime: "Tomorrow 9 AM", bottleStatus: "Offline", online: false,
    activeMeds: ["Donepezil 10mg", "Memantine 10mg", "Amlodipine 5mg"],
    doctor: SHARED_DOCTOR.name, futureRisk: "High", riskReasons: ["Caregiver-dependent adherence", "Cognitive decline", "Smart bottle offline for 3 days"],
    upcomingMeds: [{ name: "Donepezil 10mg", time: "Bedtime", status: "due" }],
    timeline: [{ date: "Jul 8", event: "⚠ Multiple missed doses — Alert", type: "alert" }, { date: "Jul 2", event: "Cognitive assessment", type: "appointment" }],
    aiNote: "CRITICAL: Caregiver-dependent patient missing medications. Consider automated dispenser upgrade.",
  },
  {
    id: 18, name: "Fatima Al-Hassan", age: 39, avatar: "https://i.pravatar.cc/150?u=fatima_hassan",
    initials: "FA", disease: "Crohn's Disease", risk: "Medium", adherence: 87,
    lastMessage: "Flare seems to be settling with the new dose.", lastActive: "5 hrs ago", unread: 1,
    appointmentTime: null, bottleStatus: "Online", online: true,
    activeMeds: ["Adalimumab 40mg (biweekly)", "Mesalazine 800mg", "Budesonide 9mg"],
    doctor: SHARED_DOCTOR.name, futureRisk: "Medium", riskReasons: ["Biologic injection compliance", "Dietary non-compliance reported"],
    upcomingMeds: [{ name: "Mesalazine 800mg", time: "6:00 PM", status: "due" }],
    timeline: [{ date: "Jul 7", event: "GI follow-up", type: "appointment" }, { date: "Jul 1", event: "CRP levels — improving", type: "report" }],
    aiNote: "Flare resolving. Continue biologic therapy. Reinforce dietary counseling at next visit.",
  },
];

// ─── Conversation threads ──────────────────────────────────────────────────────

const BASE_CONVERSATIONS: Record<number, Message[]> = {
  1: [
    { id: 1, from: "patient", text: "Good morning Dr. Chen! My morning readings are good today.", time: "9:05 AM", type: "text", read: true },
    { id: 2, from: "doctor", text: "Great to hear, John! Keep up the consistency with your morning meds.", time: "9:10 AM", type: "text", read: true },
    { id: 3, from: "patient", text: "I felt a bit dizzy after taking Lisinopril yesterday.", time: "9:42 AM", type: "text", read: true },
    { id: 4, from: "doctor", text: "That can be a mild side effect. Make sure you're well hydrated and take it after food. We'll review the dosage in tomorrow's session.", time: "10:00 AM", type: "text", read: true, pinned: true },
    { id: 5, from: "patient", text: "Should I skip the evening dose today?", time: "10:15 AM", type: "text", read: false },
  ],
  2: [
    { id: 1, from: "patient", text: "Hi doctor, I've been having more frequent wheezing this week.", time: "8:30 AM", type: "text", read: true },
    { id: 2, from: "doctor", text: "Noted, Sarah. Please check if there are new allergens in your environment. Are you using your inhaler as prescribed?", time: "8:45 AM", type: "text", read: true },
    { id: 3, from: "patient", text: "My inhaler ran out yesterday.", time: "10:00 AM", type: "text", read: false },
  ],
  3: [
    { id: 1, from: "patient", text: "Doctor, I've been feeling palpitations since this morning. Should I be worried?", time: "7:00 AM", type: "text", read: true },
    { id: 2, from: "doctor", text: "Michael, please don't ignore this. Have you taken your Warfarin today?", time: "7:30 AM", type: "text", read: true },
    { id: 3, from: "patient", text: "I think I missed it for the past few days, sorry.", time: "7:35 AM", type: "text", read: false },
    { id: 4, from: "patient", text: "Feeling palpitations since morning.", time: "9:00 AM", type: "text", read: false },
    { id: 5, from: "patient", text: "Can you call me doctor?", time: "9:05 AM", type: "text", read: false },
  ],
};

// ─── Filter types ─────────────────────────────────────────────────────────────

type FilterType = "all" | "high-risk" | "appointments" | "unread" | "online";

// ─── Helper: Risk colors ───────────────────────────────────────────────────────

function riskColor(risk: RiskLevel) {
  if (risk === "High") return "bg-red-100 text-red-700 border-red-200";
  if (risk === "Medium") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-green-100 text-green-700 border-green-200";
}

function riskDot(risk: RiskLevel) {
  if (risk === "High") return "bg-red-500";
  if (risk === "Medium") return "bg-amber-500";
  return "bg-green-500";
}

// ─── Entry point ───────────────────────────────────────────────────────────────

function Telemedicine() {
  const role = useRole();
  if (role === "doctor") return <DoctorWorkspace />;
  return <PatientTelemedicine />;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCTOR: Healthcare Messaging Workspace
// ═══════════════════════════════════════════════════════════════════════════════

function DoctorWorkspace() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<Record<number, Message[]>>(BASE_CONVERSATIONS);
  const [msgInput, setMsgInput] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "prescription" | "notes" | "reports">("chat");
  const [videoOpen, setVideoOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    getMyDoctorProfile()
      .then((profile) => setIsOnline((profile.availability_status ?? "available") === "available"))
      .catch(() => {});
  }, []);

  async function toggleAvailability() {
    const next = !isOnline;
    setIsOnline(next);
    try {
      await upsertMyDoctorProfile({ availability_status: next ? "available" : "away" });
    } catch {
      setIsOnline(!next);
      toast.error("Couldn't update availability — try again.");
    }
  }
  const [prescriptionForm, setPrescriptionForm] = useState({ medicine: "", dosage: "", duration: "", instructions: "" });
  const [clinicNotes, setClinicNotes] = useState({ symptoms: "", diagnosis: "", treatment: "", followUp: "" });
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredPatients = ALL_PATIENTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.disease.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === "high-risk") return p.risk === "High";
    if (filter === "appointments") return p.appointmentTime !== null;
    if (filter === "unread") return p.unread > 0;
    if (filter === "online") return p.online;
    return true;
  });

  const msgs = selectedPatient ? (conversations[selectedPatient.id] || []) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const sendMessage = () => {
    if (!msgInput.trim() || !selectedPatient) return;
    const newMsg: Message = {
      id: Date.now(), from: "doctor", text: msgInput, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "text", read: true,
    };
    setConversations(prev => ({ ...prev, [selectedPatient.id]: [...(prev[selectedPatient.id] || []), newMsg] }));
    setMsgInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply: Message = {
        id: Date.now() + 1, from: "patient",
        text: "Thank you, doctor. I'll follow your instructions.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "text", read: false,
      };
      setConversations(prev => ({ ...prev, [selectedPatient!.id]: [...(prev[selectedPatient!.id] || []), reply] }));
    }, 2000);
  };

  const totalUnread = ALL_PATIENTS.reduce((s, p) => s + p.unread, 0);
  const highRiskCount = ALL_PATIENTS.filter(p => p.risk === "High").length;

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-background">
      {/* ── Top Navbar ─────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-border/60 bg-card/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg">Virtual Clinic</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 h-7 bg-muted/60 rounded-full px-3 text-xs text-muted-foreground border border-border/40">
            <Users className="w-3.5 h-3.5" /> {ALL_PATIENTS.length} Patients
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalUnread > 0 && (
            <div className="flex items-center gap-1.5 h-7 bg-primary/10 border border-primary/20 rounded-full px-3 text-xs font-semibold text-primary">
              <Inbox className="w-3.5 h-3.5" /> {totalUnread} Unread
            </div>
          )}
          {highRiskCount > 0 && (
            <div className="flex items-center gap-1.5 h-7 bg-red-500/10 border border-red-200 rounded-full px-3 text-xs font-semibold text-red-600">
              <AlertTriangle className="w-3.5 h-3.5" /> {highRiskCount} High Risk
            </div>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
          <div
            className={`flex items-center gap-2 h-8 rounded-full px-3 border cursor-pointer transition-colors text-xs font-semibold ${isOnline ? "bg-success/10 border-success/30 text-success" : "bg-muted border-border text-muted-foreground"}`}
            onClick={toggleAvailability}
          >
            <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
            {isOnline ? "Available" : "Away"}
          </div>
          <Avatar className="w-8 h-8 border border-border/60">
            <AvatarImage src={SHARED_DOCTOR.avatar} />
            <AvatarFallback className="text-xs font-bold">{SHARED_DOCTOR.initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* ── Three-panel body ──────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ═══ LEFT SIDEBAR: Patient List (25%) ════════════════════════ */}
        <div className="w-[280px] xl:w-[300px] shrink-0 flex flex-col border-r border-border/60 bg-card/60">
          {/* Header */}
          <div className="p-4 border-b border-border/40">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm text-foreground">Patients</h2>
              <Badge variant="outline" className="text-[10px] font-semibold">{filteredPatients.length}</Badge>
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search patients..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-muted/40 border border-border/40 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 placeholder:text-muted-foreground/60"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Filter chips */}
          <div className="px-4 py-2.5 flex gap-1.5 flex-wrap border-b border-border/40">
            {(["all", "high-risk", "appointments", "unread", "online"] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-full transition-colors capitalize ${filter === f ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/60 text-muted-foreground hover:text-foreground border border-border/40"}`}
              >
                {f === "all" ? "All" : f === "high-risk" ? "High Risk" : f === "appointments" ? "Today's Appts" : f === "unread" ? "Unread" : "Online"}
              </button>
            ))}
          </div>

          {/* Patient list */}
          <ScrollArea className="flex-1">
            <div className="divide-y divide-border/30">
              {filteredPatients.map(patient => (
                <button
                  key={patient.id}
                  onClick={() => { setSelectedPatient(patient); setActiveTab("chat"); }}
                  className={`w-full text-left p-4 transition-all hover:bg-muted/30 ${selectedPatient?.id === patient.id ? "bg-primary/5 border-r-2 border-primary" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <Avatar className="w-10 h-10 border border-border/40">
                        <AvatarImage src={patient.avatar} alt={patient.name} />
                        <AvatarFallback className="text-xs font-bold">{patient.initials}</AvatarFallback>
                      </Avatar>
                      {patient.online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-sm font-semibold truncate">{patient.name}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">{patient.lastActive}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] text-muted-foreground truncate">{patient.age}y • {patient.disease.split("•")[0].trim()}</span>
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${riskColor(patient.risk)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1 ${riskDot(patient.risk)}`} />{patient.risk}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{patient.adherence}% adh</span>
                        {patient.unread > 0 && (
                          <span className="shrink-0 min-w-[18px] h-[18px] rounded-full bg-primary text-[9px] text-primary-foreground font-bold flex items-center justify-center px-1">
                            {patient.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 truncate italic">{patient.lastMessage}</p>
                      {patient.appointmentTime && (
                        <div className="flex items-center gap-1 mt-1 text-[9px] text-blue-600 font-semibold">
                          <Clock className="w-3 h-3" /> {patient.appointmentTime}
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-1 text-[9px] text-muted-foreground">
                        {patient.bottleStatus === "Online"
                          ? <><Wifi className="w-3 h-3 text-green-500" /><span className="text-green-600">Bottle Online</span></>
                          : <><WifiOff className="w-3 h-3 text-red-400" /><span className="text-red-500">Bottle Offline</span></>
                        }
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* ═══ CENTER: Consultation Workspace (50%) ════════════════════ */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {!selectedPatient ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 p-8">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center shadow-inner">
                <MessageSquarePlus className="w-9 h-9 text-primary/60" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display mb-2">Select a Patient</h3>
                <p className="text-sm text-muted-foreground max-w-xs">Choose a patient from the left panel to open the consultation workspace, view AI insights, and start a conversation.</p>
              </div>
              <div className="grid grid-cols-3 gap-3 max-w-sm w-full">
                {[
                  { icon: Users, label: `${ALL_PATIENTS.length} Patients`, sub: "In your care" },
                  { icon: AlertTriangle, label: `${highRiskCount} High Risk`, sub: "Need attention" },
                  { icon: Inbox, label: `${totalUnread} Unread`, sub: "Messages" },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-4 text-center">
                    <s.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                    <div className="text-sm font-bold">{s.label}</div>
                    <div className="text-[10px] text-muted-foreground">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Patient header bar */}
              <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-border/60 bg-card/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10 border border-border/40">
                      <AvatarImage src={selectedPatient.avatar} />
                      <AvatarFallback className="text-xs font-bold">{selectedPatient.initials}</AvatarFallback>
                    </Avatar>
                    {selectedPatient.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{selectedPatient.name}</span>
                      <span className="text-xs text-muted-foreground">· {selectedPatient.age}y</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${riskColor(selectedPatient.risk)}`}>{selectedPatient.risk} Risk</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                      <span>{selectedPatient.disease}</span>
                      <span>·</span>
                      <span>{selectedPatient.adherence}% adherence</span>
                      <span>·</span>
                      <span className={selectedPatient.online ? "text-green-600" : ""}>{selectedPatient.online ? "Online" : "Offline"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => setVideoOpen(true)} size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white h-8 rounded-xl text-xs font-semibold shadow-md shadow-blue-200/50">
                    <Video className="w-3.5 h-3.5" /> Video
                  </Button>
                  <Button onClick={() => toast.success("Calling patient...")} size="sm" variant="outline" className="gap-1.5 h-8 rounded-xl text-xs">
                    <Phone className="w-3.5 h-3.5" /> Call
                  </Button>
                  <Button onClick={() => toast.success("Generating patient report...")} size="sm" variant="outline" className="gap-1.5 h-8 rounded-xl text-xs">
                    <FileText className="w-3.5 h-3.5" /> Report
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <div className="shrink-0 flex border-b border-border/60 bg-card/60">
                {(["chat", "prescription", "notes", "reports"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2.5 text-xs font-semibold capitalize transition-colors flex items-center gap-1.5 ${activeTab === tab ? "border-b-2 border-blue-500 text-blue-600 bg-blue-500/5" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}
                  >
                    {tab === "chat" && <MessageSquarePlus className="w-3.5 h-3.5" />}
                    {tab === "prescription" && <Pill className="w-3.5 h-3.5" />}
                    {tab === "notes" && <ClipboardList className="w-3.5 h-3.5" />}
                    {tab === "reports" && <FileText className="w-3.5 h-3.5" />}
                    {tab === "chat" ? "Chat" : tab === "prescription" ? "Prescription" : tab === "notes" ? "Clinic Notes" : "Reports"}
                  </button>
                ))}
              </div>

              {/* ─── CHAT TAB ─── */}
              {activeTab === "chat" && (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Pinned message */}
                  {msgs.some(m => m.pinned) && (
                    <div className="shrink-0 flex items-center gap-2 px-5 py-2 bg-blue-50 border-b border-blue-100 text-xs text-blue-700">
                      <Pin className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-semibold">Pinned:</span>
                      <span className="truncate">{msgs.find(m => m.pinned)?.text}</span>
                    </div>
                  )}

                  {/* Messages area */}
                  <ScrollArea className="flex-1 px-6 py-4">
                    <div className="space-y-3 max-w-3xl mx-auto">
                      {msgs.map((msg, idx) => {
                        const isDoctor = msg.from === "doctor";
                        const showAvatar = idx === 0 || msgs[idx - 1].from !== msg.from;
                        return (
                          <div key={msg.id} className={`flex items-end gap-2.5 ${isDoctor ? "flex-row-reverse" : ""}`}>
                            {showAvatar ? (
                              <Avatar className="w-7 h-7 shrink-0 mb-1 border border-border/40">
                                <AvatarImage src={isDoctor ? SHARED_DOCTOR.avatar : selectedPatient.avatar} />
                                <AvatarFallback className="text-[9px] font-bold">{isDoctor ? SHARED_DOCTOR.initials : selectedPatient.initials}</AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="w-7 shrink-0" />
                            )}
                            <div className={`group max-w-[65%] ${isDoctor ? "items-end" : "items-start"} flex flex-col`}>
                              {showAvatar && (
                                <span className={`text-[10px] text-muted-foreground mb-1 font-medium ${isDoctor ? "text-right" : ""}`}>
                                  {isDoctor ? SHARED_DOCTOR.name : selectedPatient.name}
                                </span>
                              )}
                              <div className={`relative rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                                isDoctor
                                  ? "bg-blue-600 text-white rounded-br-sm"
                                  : "bg-card text-foreground rounded-tl-sm border border-border/60"
                              }`}>
                                {msg.pinned && <Pin className="w-3 h-3 absolute -top-1.5 -right-1.5 text-amber-500" />}
                                <p className="leading-snug">{msg.text}</p>
                                <div className={`flex items-center gap-1 mt-1 ${isDoctor ? "justify-end" : ""}`}>
                                  <span className={`text-[10px] ${isDoctor ? "text-blue-200" : "text-muted-foreground"}`}>{msg.time}</span>
                                  {isDoctor && (
                                    msg.read
                                      ? <CheckCheck className="w-3 h-3 text-blue-200" />
                                      : <Check className="w-3 h-3 text-blue-200" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {isTyping && (
                        <div className="flex items-end gap-2.5">
                          <Avatar className="w-7 h-7 border border-border/40 shrink-0">
                            <AvatarImage src={selectedPatient.avatar} />
                            <AvatarFallback className="text-[9px] font-bold">{selectedPatient.initials}</AvatarFallback>
                          </Avatar>
                          <div className="bg-card border border-border/60 rounded-2xl rounded-tl-sm px-4 py-2.5 flex items-center gap-1 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" />
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input area */}
                  <div className="shrink-0 px-5 py-3 border-t border-border/60 bg-card/80">
                    {/* Quick replies */}
                    <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                      {["Continue as prescribed", "Schedule a follow-up", "Please share lab reports", "Call me now"].map(r => (
                        <button
                          key={r}
                          onClick={() => setMsgInput(r)}
                          className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-border/60 bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Button onClick={() => toast.info("File attachment opened")} size="icon" variant="ghost" className="h-8 w-8 rounded-xl text-muted-foreground">
                          <Paperclip className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => toast.info("Image picker opened")} size="icon" variant="ghost" className="h-8 w-8 rounded-xl text-muted-foreground">
                          <Image className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => toast.info("Voice recording started")} size="icon" variant="ghost" className="h-8 w-8 rounded-xl text-muted-foreground">
                          <Mic className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => toast.info("Emoji picker opened")} size="icon" variant="ghost" className="h-8 w-8 rounded-xl text-muted-foreground">
                          <Smile className="w-4 h-4" />
                        </Button>
                      </div>
                      <input
                        type="text"
                        value={msgInput}
                        onChange={e => setMsgInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && sendMessage()}
                        placeholder={`Message ${selectedPatient.name}...`}
                        className="flex-1 text-sm bg-muted/40 border border-border/60 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/50"
                      />
                      <Button onClick={sendMessage} size="icon" className="h-9 w-9 rounded-xl bg-blue-600 hover:bg-blue-700 shrink-0 shadow-md shadow-blue-200/50">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── PRESCRIPTION TAB ─── */}
              {activeTab === "prescription" && (
                <ScrollArea className="flex-1 p-6">
                  <div className="max-w-2xl mx-auto space-y-5">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                      <div className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-1.5"><Pill className="w-3.5 h-3.5" /> Current Active Medications</div>
                      <div className="space-y-1.5">
                        {selectedPatient.activeMeds.map(m => (
                          <div key={m} className="text-xs bg-white border border-blue-100 rounded-xl px-3 py-2 font-medium text-slate-700">{m}</div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
                      <h3 className="text-sm font-bold flex items-center gap-2"><MessageSquarePlus className="w-4 h-4 text-blue-500" /> New Prescription</h3>
                      {(["medicine", "dosage", "duration", "instructions"] as const).map(field => (
                        <div key={field}>
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">{field}</label>
                          {field === "instructions" ? (
                            <textarea
                              value={prescriptionForm[field]}
                              onChange={e => setPrescriptionForm(p => ({ ...p, [field]: e.target.value }))}
                              rows={3}
                              placeholder={field === "instructions" ? "e.g. Take with food. Avoid grapefruit." : ""}
                              className="w-full text-sm border border-border/60 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/20 bg-muted/20 resize-none"
                            />
                          ) : (
                            <input
                              type="text"
                              value={prescriptionForm[field]}
                              onChange={e => setPrescriptionForm(p => ({ ...p, [field]: e.target.value }))}
                              placeholder={field === "medicine" ? "e.g. Amlodipine 5mg" : field === "dosage" ? "e.g. 1 tablet once daily" : "e.g. 30 days"}
                              className="w-full text-sm border border-border/60 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 bg-muted/20"
                            />
                          )}
                        </div>
                      ))}
                      <div className="flex gap-2 pt-2">
                        <Button onClick={() => { toast.success("Prescription saved to EMR!"); }} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">Save to EMR</Button>
                        <Button onClick={() => { toast.success(`Prescription sent to ${selectedPatient.name} and Smart Bottle!`); }} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">Send to Patient</Button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              )}

              {/* ─── CLINIC NOTES TAB ─── */}
              {activeTab === "notes" && (
                <ScrollArea className="flex-1 p-6">
                  <div className="max-w-2xl mx-auto space-y-4">
                    {(["symptoms", "diagnosis", "treatment", "followUp"] as const).map(field => (
                      <div key={field}>
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                          {field === "followUp" ? "Next Follow-up" : field.charAt(0).toUpperCase() + field.slice(1)}
                        </label>
                        <textarea
                          value={clinicNotes[field]}
                          onChange={e => setClinicNotes(p => ({ ...p, [field]: e.target.value }))}
                          rows={3}
                          placeholder={
                            field === "symptoms" ? "Patient complaints, presenting symptoms..." :
                            field === "diagnosis" ? "Clinical diagnosis, ICD codes..." :
                            field === "treatment" ? "Treatment plan, medication changes..." :
                            "Next appointment date and focus areas..."
                          }
                          className="w-full text-sm border border-border/60 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-blue-500/20 bg-muted/10 resize-none"
                        />
                      </div>
                    ))}
                    <div className="flex gap-2 pt-1">
                      <Button onClick={() => toast.success("Notes saved to EMR!")} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">Save to EMR</Button>
                      <Button onClick={() => toast.success("Notes shared with patient!")} variant="outline" className="flex-1 rounded-xl">Notify Patient</Button>
                    </div>
                  </div>
                </ScrollArea>
              )}

              {/* ─── REPORTS TAB ─── */}
              {activeTab === "reports" && (
                <ScrollArea className="flex-1 p-6">
                  <div className="max-w-2xl mx-auto space-y-3">
                    <h3 className="text-sm font-bold mb-4">Patient Reports & Documents</h3>
                    {[
                      { name: "CBC Lab Report — Jul 8, 2026", type: "Lab", size: "1.2 MB", icon: FileText },
                      { name: "Echocardiogram — Jun 20, 2026", type: "Imaging", size: "4.8 MB", icon: Activity },
                      { name: "Prescription — Jun 15, 2026", type: "Rx", size: "320 KB", icon: Pill },
                      { name: "Chest X-Ray — May 10, 2026", type: "Imaging", size: "6.1 MB", icon: Activity },
                    ].map(r => (
                      <div key={r.name} className="flex items-center gap-4 p-4 rounded-2xl border border-border/60 bg-card hover:bg-muted/20 transition-colors">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0"><r.icon className="w-5 h-5" /></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">{r.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{r.type} · {r.size}</div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl" onClick={() => toast.success("Downloading report...")}><Download className="w-3.5 h-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl" onClick={() => toast.success("Report shared with patient!")}><Share2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>
                    ))}
                    <Button onClick={() => toast.success("Generating comprehensive patient report...")} className="w-full mt-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                      <FileText className="w-4 h-4 mr-2" /> Generate Full Report
                    </Button>
                  </div>
                </ScrollArea>
              )}
            </>
          )}
        </div>

        {/* ═══ RIGHT PANEL: AI Patient Insights (25%) ══════════════════ */}
        {selectedPatient && (
          <div className="w-[280px] xl:w-[300px] shrink-0 flex flex-col border-l border-border/60 bg-card/60">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* Patient summary */}
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Patient Summary</h3>
                  <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-4 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-10 h-10 border-2 border-white/30">
                        <AvatarImage src={selectedPatient.avatar} />
                        <AvatarFallback className="text-xs font-bold text-blue-700 bg-blue-100">{selectedPatient.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-sm leading-tight">{selectedPatient.name}</div>
                        <div className="text-blue-100 text-[10px]">{selectedPatient.age} years old</div>
                      </div>
                    </div>
                    <div className="text-xs text-blue-100 mb-1 font-medium">{selectedPatient.disease}</div>
                    <div className="text-[10px] text-blue-200">Under {selectedPatient.doctor}</div>
                  </div>
                </div>

                {/* Adherence ring */}
                <div className="rounded-2xl border border-border/60 p-4 bg-card">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Medication Adherence</h3>
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted/40" />
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5"
                          strokeDasharray={`${selectedPatient.adherence} ${100 - selectedPatient.adherence}`}
                          strokeLinecap="round"
                          className={selectedPatient.adherence >= 80 ? "text-green-500" : selectedPatient.adherence >= 60 ? "text-amber-500" : "text-red-500"}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold">{selectedPatient.adherence}%</span>
                      </div>
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${selectedPatient.adherence >= 80 ? "text-green-600" : selectedPatient.adherence >= 60 ? "text-amber-600" : "text-red-600"}`}>
                        {selectedPatient.adherence >= 80 ? "Good" : selectedPatient.adherence >= 60 ? "Moderate" : "Poor"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">This week</div>
                    </div>
                  </div>
                </div>

                {/* AI Risk Prediction */}
                <div className="rounded-2xl border border-border/60 p-4 bg-card">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-indigo-500" /> AI Risk Prediction
                  </h3>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="rounded-xl p-3 bg-muted/30 text-center">
                      <div className="text-[10px] text-muted-foreground mb-1">Current</div>
                      <Badge className={`text-[10px] font-bold ${riskColor(selectedPatient.risk)}`}>{selectedPatient.risk}</Badge>
                    </div>
                    <div className="rounded-xl p-3 bg-muted/30 text-center">
                      <div className="text-[10px] text-muted-foreground mb-1">Predicted</div>
                      <Badge className={`text-[10px] font-bold ${riskColor(selectedPatient.futureRisk as RiskLevel)}`}>{selectedPatient.futureRisk}</Badge>
                    </div>
                  </div>
                  <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3">
                    <div className="text-[10px] font-bold text-indigo-700 mb-1.5 flex items-center gap-1"><Zap className="w-3 h-3" /> AI Insight</div>
                    <p className="text-[10px] text-indigo-700 leading-relaxed">{selectedPatient.aiNote}</p>
                  </div>
                </div>

                {/* Explainable AI */}
                <div className="rounded-2xl border border-border/60 p-4 bg-card">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-violet-500" /> Risk Factors
                  </h3>
                  <div className="space-y-1.5">
                    {selectedPatient.riskReasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px]">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${i === 0 ? "bg-red-400" : i === 1 ? "bg-amber-400" : "bg-blue-400"}`} />
                        <span className="text-muted-foreground">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Medications */}
                <div className="rounded-2xl border border-border/60 p-4 bg-card">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-500" /> Upcoming Medications
                  </h3>
                  <div className="space-y-2">
                    {selectedPatient.upcomingMeds.map((m, i) => (
                      <div key={i} className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/20">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${m.status === "taken" ? "bg-green-500" : m.status === "missed" ? "bg-red-500" : "bg-amber-500"}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-semibold truncate">{m.name}</div>
                          <div className="text-[10px] text-muted-foreground">{m.time}</div>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${m.status === "taken" ? "bg-green-100 text-green-700" : m.status === "missed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                          {m.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Smart Bottle */}
                <div className="rounded-2xl border border-border/60 p-4 bg-card">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-blue-500" /> Smart Bottle
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-muted/30 p-2">
                      <BatteryMedium className="w-4 h-4 mx-auto mb-1 text-green-500" />
                      <div className="text-[10px] font-bold">72%</div>
                      <div className="text-[9px] text-muted-foreground">Battery</div>
                    </div>
                    <div className="rounded-xl bg-muted/30 p-2">
                      {selectedPatient.bottleStatus === "Online"
                        ? <Wifi className="w-4 h-4 mx-auto mb-1 text-green-500" />
                        : <WifiOff className="w-4 h-4 mx-auto mb-1 text-red-400" />
                      }
                      <div className={`text-[10px] font-bold ${selectedPatient.bottleStatus === "Online" ? "text-green-600" : "text-red-500"}`}>{selectedPatient.bottleStatus}</div>
                      <div className="text-[9px] text-muted-foreground">Status</div>
                    </div>
                    <div className="rounded-xl bg-muted/30 p-2">
                      <Activity className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                      <div className="text-[10px] font-bold">8:02 AM</div>
                      <div className="text-[9px] text-muted-foreground">Last Open</div>
                    </div>
                  </div>
                </div>

                {/* Health Timeline */}
                <div className="rounded-2xl border border-border/60 p-4 bg-card">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-purple-500" /> Health Timeline
                  </h3>
                  <div className="relative border-l-2 border-border/50 ml-2 space-y-4">
                    {selectedPatient.timeline.map((t, i) => (
                      <div key={i} className="relative pl-4">
                        <div className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full border-2 border-card ${t.type === "alert" ? "bg-red-500" : t.type === "appointment" ? "bg-blue-500" : t.type === "report" ? "bg-indigo-500" : "bg-teal-500"}`} />
                        <div className="text-[10px] font-semibold text-muted-foreground">{t.date}</div>
                        <div className="text-[11px] font-medium mt-0.5">{t.event}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-2xl border border-border/60 p-4 bg-card">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    {[
                      { label: "Generate Prescription", icon: Pill, action: () => setActiveTab("prescription") },
                      { label: "Download Report", icon: Download, action: () => toast.success("Downloading patient report...") },
                      { label: "Share Report", icon: Share2, action: () => toast.success("Report shared!") },
                      { label: "Schedule Follow-up", icon: Calendar, action: () => toast.success("Follow-up calendar opened!") },
                      { label: "Notify Caregiver", icon: UserPlus, action: () => toast.success("Caregiver notified!") },
                    ].map(a => (
                      <button
                        key={a.label}
                        onClick={a.action}
                        className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-muted/40 transition-colors text-left group"
                      >
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                          <a.icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-medium">{a.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-auto text-muted-foreground group-hover:text-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* ─── Video Call Modal ─────────────────────────────────────────── */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
          <div className="bg-slate-900 relative" style={{ minHeight: 420 }}>
            {/* Patient video (main) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-28 h-28 border-4 border-white/20 shadow-2xl">
                  <AvatarImage src={selectedPatient?.avatar} />
                  <AvatarFallback className="text-3xl font-bold bg-slate-700 text-white">{selectedPatient?.initials}</AvatarFallback>
                </Avatar>
                <div className="text-white text-center">
                  <div className="font-bold text-lg">{selectedPatient?.name}</div>
                  <div className="text-slate-400 text-sm mt-0.5 flex items-center gap-2 justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Connecting...
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor PiP */}
            <div className="absolute top-4 right-4 w-28 h-20 rounded-2xl bg-slate-700 border-2 border-white/20 overflow-hidden flex items-center justify-center shadow-xl">
              <Avatar className="w-12 h-12">
                <AvatarImage src={SHARED_DOCTOR.avatar} />
                <AvatarFallback className="font-bold bg-blue-700 text-white">{SHARED_DOCTOR.initials}</AvatarFallback>
              </Avatar>
            </div>

            {/* Call info */}
            <div className="absolute top-4 left-4">
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-white text-xs font-semibold">Secure Video Session</span>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-3">
              {[
                { Icon: MicOff, label: "Mute", action: () => toast.info("Microphone muted") },
                { Icon: VideoOff, label: "Camera", action: () => toast.info("Camera off") },
                { Icon: ScreenShare, label: "Screen", action: () => toast.info("Screen share started") },
                { Icon: MessageSquarePlus, label: "Chat", action: () => { setVideoOpen(false); setActiveTab("chat"); } },
              ].map(({ Icon, label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all group-hover:scale-105">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] text-white/70">{label}</span>
                </button>
              ))}
              <button onClick={() => { setVideoOpen(false); toast.success("Call ended"); }} className="flex flex-col items-center gap-1.5 group">
                <div className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all group-hover:scale-105 shadow-lg shadow-red-900/50">
                  <PhoneOff className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] text-white/70">End</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PATIENT: Consult Doctor (unchanged, shared data)
// ═══════════════════════════════════════════════════════════════════════════════

const PATIENT_DOCTOR = {
  name: "Dr. Sarah Chen",
  specialty: "Cardiologist",
  hospital: "Mount Sinai Hospital",
  avatar: "https://i.pravatar.cc/150?u=dr_sarah_chen",
  initials: "SC",
  rating: 4.9,
  reviews: 120,
  exp: "15+ Yrs",
  responseTime: "Avg. 2hr response",
};

const PATIENT_APPOINTMENT = {
  date: "Tomorrow",
  time: "10:30 AM",
  duration: "30 Min",
  type: "Monthly Follow-up & Prescription Review",
  status: "Confirmed",
};

const PATIENT_MEDS = [
  { name: "Lisinopril 10mg", schedule: "1 tablet · Morning (After food)", pills: 20, refills: 2, color: "bg-purple-50 text-purple-600" },
  { name: "Atorvastatin 20mg", schedule: "1 tablet · Night (Before bed)", pills: 45, refills: 0, color: "bg-blue-50 text-blue-600" },
  { name: "Metformin 500mg", schedule: "1 tablet · Lunch", pills: 12, refills: 1, color: "bg-teal-50 text-teal-600" },
];

const PATIENT_MSGS_INIT = [
  { id: 1, from: "me" as const, text: "Hi Dr. Chen, I've been feeling a bit dizzy after taking the morning meds.", time: "Yesterday, 4:30 PM" },
  { id: 2, from: "doctor" as const, text: "Hello John. That might be a mild side effect of the Lisinopril. Make sure you're well hydrated. We'll review it tomorrow.", time: "Yesterday, 5:15 PM" },
  { id: 3, from: "me" as const, text: "Should I skip the evening dose today?", time: "Yesterday, 5:45 PM" },
  { id: 4, from: "doctor" as const, text: "No, please don't skip it. Continue as prescribed and we'll review it tomorrow.", time: "Yesterday, 6:00 PM" },
];

const OTHER_SPECIALISTS = [
  { name: "Dr. Raj Patel", specialty: "General Physician", rating: 4.8, exp: "10 Yrs", available: true, avatar: "RP" },
  { name: "Dr. Amelia Ross", specialty: "Endocrinologist", rating: 4.7, exp: "8 Yrs", available: false, avatar: "AR" },
  { name: "Dr. Kiran Mehta", specialty: "Neurologist", rating: 4.9, exp: "14 Yrs", available: true, avatar: "KM" },
];

const MEDICAL_HISTORY = [
  { id: 1, date: "May 10, 2026", type: "Consultation", desc: "Routine checkup and blood pressure review", doctor: "Dr. Sarah Chen" },
  { id: 2, date: "April 15, 2026", type: "Lab Report", desc: "Complete Blood Count (CBC) - All clear", doctor: "Pathology Lab" },
  { id: 3, date: "March 02, 2026", type: "Prescription", desc: "Started Lisinopril 10mg", doctor: "Dr. Sarah Chen" },
  { id: 4, date: "February 18, 2026", type: "Checkup", desc: "Annual Health Checkup — BMI 24.1", doctor: "Dr. Sarah Chen" },
];

function PatientTelemedicine() {
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState(PATIENT_MSGS_INIT);
  const [activeTab, setActiveTab] = useState<"chat" | "history">("chat");

  const handleSend = () => {
    if (!chatMessage.trim()) return;
    setMessages(prev => [...prev, { id: prev.length + 1, from: "me" as const, text: chatMessage, time: "Just now" }]);
    setChatMessage("");
    setTimeout(() => {
      setMessages(prev => [...prev, { id: prev.length + 1, from: "doctor" as const, text: "Got it, I've noted this. Please make sure to have a light meal before the consultation tomorrow.", time: "Just now" }]);
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Consult Doctor</h1>
          <p className="text-sm text-muted-foreground mt-1">Your personal healthcare team, available virtually 24/7.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 text-xs font-semibold text-green-700">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Clinic Open · 2 Doctors Available
        </div>
      </div>

      {/* Appointment banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary via-blue-600 to-indigo-600 p-5 text-white relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-blue-100 uppercase tracking-widest">Next Appointment</div>
              <div className="text-xl font-bold mt-0.5">{PATIENT_APPOINTMENT.date}, {PATIENT_APPOINTMENT.time}</div>
              <div className="text-sm text-blue-100 flex items-center gap-1.5 mt-1">
                <Clock className="h-3.5 w-3.5" /> {PATIENT_APPOINTMENT.duration} · {PATIENT_APPOINTMENT.type} · <span className="font-semibold">{PATIENT_DOCTOR.name}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:items-end gap-3">
            <div className="flex items-center gap-2 bg-white/15 rounded-full px-3 py-1 text-xs font-semibold border border-white/20">
              <div className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" /> {PATIENT_APPOINTMENT.status}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => toast.success("Joining secure video room...")} size="sm" className="bg-white text-primary hover:bg-blue-50 rounded-xl font-semibold text-xs h-9 px-4 shadow-md">
                <Video className="h-3.5 w-3.5 mr-1.5" /> Join Early
              </Button>
              <Button onClick={() => toast.info("Opening reschedule calendar...")} variant="outline" size="sm" className="bg-transparent border-white/30 text-white hover:bg-white/10 rounded-xl text-xs h-9 px-3">
                <Calendar className="h-3.5 w-3.5 mr-1.5" /> Reschedule
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Doctor card */}
          <div className="rounded-2xl border border-border/60 bg-card shadow-lg overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-card to-transparent" />
            </div>
            <div className="p-6 pt-0 -mt-10 relative">
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end">
                <Avatar className="w-20 h-20 border-4 border-card shadow-lg bg-white shrink-0">
                  <AvatarImage src={PATIENT_DOCTOR.avatar} alt={PATIENT_DOCTOR.name} />
                  <AvatarFallback className="text-xl font-bold">{PATIENT_DOCTOR.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 pb-1">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <h2 className="text-xl font-bold font-display">{PATIENT_DOCTOR.name}</h2>
                      <p className="text-sm text-muted-foreground">{PATIENT_DOCTOR.specialty} · {PATIENT_DOCTOR.hospital}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-0 flex items-center gap-1 py-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Available Now
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {PATIENT_DOCTOR.rating} <span className="font-normal">({PATIENT_DOCTOR.reviews}+ reviews)</span></span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {PATIENT_DOCTOR.exp}</span>
                    <span className="flex items-center gap-1"><MessageSquarePlus className="w-3.5 h-3.5" /> {PATIENT_DOCTOR.responseTime}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <Button onClick={() => toast.success("Joining video session...")} className="col-span-2 sm:col-span-1 w-full bg-primary gap-2 rounded-xl font-semibold">
                  <Video className="w-4 h-4" /> Join Call
                </Button>
                <Button onClick={() => setActiveTab("chat")} variant="outline" className="w-full gap-2 border-indigo-100 text-indigo-700 hover:bg-indigo-50 rounded-xl">
                  <MessageSquarePlus className="w-4 h-4" /> Chat
                </Button>
                <Button onClick={() => toast.success("Initiating voice call...")} variant="outline" className="w-full gap-2 rounded-xl">
                  <Phone className="w-4 h-4" /> Voice
                </Button>
                <Button onClick={() => toast.success("Generating prescription PDF...")} variant="outline" className="w-full gap-2 rounded-xl">
                  <FileText className="w-4 h-4" /> Prescription
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden flex flex-col h-[450px]">
            <div className="flex border-b border-border/60 shrink-0">
              {(["chat", "history"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${activeTab === tab ? "border-b-2 border-primary text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}>
                  {tab === "chat" ? <><MessageSquarePlus className="w-3.5 h-3.5 inline mr-1.5 mb-0.5" />Messages</> : <><Activity className="w-3.5 h-3.5 inline mr-1.5 mb-0.5" />History</>}
                </button>
              ))}
            </div>
            {activeTab === "chat" && (
              <div className="flex-1 min-h-0 flex flex-col">
                <ScrollArea className="flex-1 p-5">
                  <div className="space-y-4">
                    {messages.map(msg => (
                      <div key={msg.id} className={`flex items-end gap-2 ${msg.from === "me" ? "flex-row-reverse" : ""}`}>
                        <Avatar className="w-7 h-7 shrink-0 mb-1 border border-border/40">
                          {msg.from === "doctor" && <AvatarImage src={PATIENT_DOCTOR.avatar} />}
                          <AvatarFallback className="text-[10px] font-bold">{msg.from === "me" ? "JA" : "SC"}</AvatarFallback>
                        </Avatar>
                        <div className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-sm ${msg.from === "me" ? "bg-primary text-white rounded-br-sm" : "bg-muted/60 text-foreground rounded-tl-sm border border-border/40"}`}>
                          <p className="leading-snug">{msg.text}</p>
                          <span className={`block text-[10px] mt-1 ${msg.from === "me" ? "text-blue-100" : "text-muted-foreground"}`}>{msg.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="shrink-0 p-4 border-t border-border/60 flex gap-2 bg-muted/20">
                  <input type="text" value={chatMessage} onChange={e => setChatMessage(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()}
                    placeholder={`Type a message to ${PATIENT_DOCTOR.name}...`}
                    className="flex-1 text-sm bg-background border border-border/60 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20" />
                  <Button onClick={handleSend} size="icon" className="rounded-xl bg-primary w-10 h-10 shrink-0"><Send className="w-4 h-4" /></Button>
                </div>
              </div>
            )}
            {activeTab === "history" && (
              <ScrollArea className="flex-1 p-5">
                <div className="relative border-l-2 border-border/60 ml-3 space-y-6">
                  {MEDICAL_HISTORY.map(item => (
                    <div key={item.id} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-background border-2 border-primary" />
                      <div className="text-xs font-semibold text-primary">{item.date}</div>
                      <div className="font-bold text-sm mt-0.5">{item.type}</div>
                      <div className="text-xs text-muted-foreground mt-1">{item.desc}</div>
                      <div className="text-[10px] font-medium text-muted-foreground mt-1 flex items-center gap-1"><Activity className="w-3 h-3" /> {item.doctor}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-border/60 bg-card">
            <div className="p-4 border-b border-border/40">
              <h3 className="text-base font-bold flex items-center gap-2"><Pill className="w-4 h-4 text-purple-500" /> Current Prescription</h3>
            </div>
            <div className="p-4 space-y-3">
              {PATIENT_MEDS.map(med => (
                <div key={med.name} className="flex items-start gap-3 p-3 border border-border/40 rounded-xl hover:bg-muted/20 transition-colors">
                  <div className={`p-2 ${med.color} rounded-lg shrink-0`}><Pill className="w-4 h-4" /></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm">{med.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{med.schedule}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={`text-[10px] h-4 py-0 ${med.pills <= 15 ? "border-orange-200 text-orange-700 bg-orange-50" : ""}`}>{med.pills} pills left</Badge>
                      {med.refills > 0 && <Badge variant="outline" className="text-[10px] h-4 py-0 border-blue-200 text-blue-700 bg-blue-50">{med.refills} Refill{med.refills > 1 ? "s" : ""}</Badge>}
                    </div>
                    <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${med.pills <= 15 ? "bg-orange-400" : "bg-primary"}`} style={{ width: `${Math.min(100, (med.pills / 60) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
              <Button onClick={() => toast.success("Renewal request sent!")} variant="outline" className="w-full text-primary border-primary/30 hover:bg-primary/5 rounded-xl text-sm font-semibold">Request Renewal</Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card">
            <div className="p-4 border-b border-border/40">
              <h3 className="text-base font-bold flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" /> Other Specialists</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Browse available doctors from our network</p>
            </div>
            <div className="p-4 space-y-3">
              {OTHER_SPECIALISTS.map(doc => (
                <div key={doc.name} className="flex items-center gap-3 p-3 rounded-xl border border-border/40 hover:bg-muted/20 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">{doc.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{doc.name}</div>
                    <div className="text-xs text-muted-foreground">{doc.specialty} · {doc.exp}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-semibold">{doc.rating}</span>
                      <div className={`ml-2 w-1.5 h-1.5 rounded-full ${doc.available ? "bg-green-500" : "bg-gray-300"}`} />
                      <span className="text-[10px] text-muted-foreground">{doc.available ? "Available" : "Unavailable"}</span>
                    </div>
                  </div>
                  <Button onClick={() => toast.success(`Booking with ${doc.name}...`)} disabled={!doc.available} size="sm" variant="outline" className="text-xs h-8 rounded-lg shrink-0">Book</Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
