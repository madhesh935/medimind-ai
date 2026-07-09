import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

import {
  Calendar, Clock, Video, Phone, MessageSquarePlus, FileText, Search,
  Plus, Bell, ChevronLeft, ChevronRight, AlertTriangle, Activity,
  Pill, Download, User, X, CheckCircle2, RefreshCcw, Stethoscope,
  Wifi, WifiOff, Check, Star, MoreHorizontal, Filter,
  CalendarDays, TrendingUp, Users, Zap, UserCheck, XCircle, Bot,
  MapPin, Radio,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/appointments")({ component: AppointmentsPage });

// ─── Types ─────────────────────────────────────────────────────────────────────

type ApptType = "Video" | "In-Person" | "Follow-up" | "Urgent" | "Telemedicine";
type ApptStatus = "Scheduled" | "Completed" | "Cancelled" | "In Progress" | "Waiting";
type RiskLevel = "High" | "Medium" | "Low";
type CalView = "day" | "week" | "month";
type FilterKey = "all" | "today" | "tomorrow" | "week" | "month" | "completed" | "cancelled" | "telemedicine" | "in-person" | "high-risk";

interface Appointment {
  id: string;
  patientId: number;
  patientName: string;
  patientAge: number;
  patientAvatar: string;
  patientInitials: string;
  disease: string;
  type: ApptType;
  status: ApptStatus;
  date: string; // "2026-07-09"
  time: string; // "09:00 AM"
  duration: number; // minutes
  risk: RiskLevel;
  adherence: number;
  online: boolean;
  bottleStatus: "Online" | "Offline";
  currentMeds: string[];
  reason: string;
  notes: string;
  doctorNote: string;
  allergies: string;
  lastVisit: string;
  gender: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const TODAY = "2026-07-09";
const TOMORROW = "2026-07-10";

function typeColor(type: ApptType) {
  if (type === "Video" || type === "Telemedicine") return { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" };
  if (type === "Follow-up") return { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" };
  if (type === "Urgent") return { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" };
  return { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" };
}

function statusBadge(status: ApptStatus) {
  if (status === "Completed") return "bg-green-100 text-green-700 border-green-200";
  if (status === "Cancelled") return "bg-red-100 text-red-700 border-red-200";
  if (status === "In Progress") return "bg-blue-100 text-blue-700 border-blue-200";
  if (status === "Waiting") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function riskBadge(risk: RiskLevel) {
  if (risk === "High") return "bg-red-100 text-red-700 border-red-200";
  if (risk === "Medium") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-green-100 text-green-700 border-green-200";
}

// ─── 25 Patients / 15 Today Appointments ─────────────────────────────────────

const APPOINTMENTS: Appointment[] = [
  {
    id: "APT001", patientId: 1, patientName: "John Anderson", patientAge: 42,
    patientAvatar: "https://i.pravatar.cc/150?u=john_anderson", patientInitials: "JA",
    disease: "Type 2 Diabetes • Hypertension", type: "Video", status: "Scheduled",
    date: TODAY, time: "09:00 AM", duration: 30, risk: "Low", adherence: 94,
    online: true, bottleStatus: "Online", gender: "Male",
    currentMeds: ["Lisinopril 10mg", "Metformin 500mg", "Atorvastatin 20mg"],
    reason: "Monthly follow-up and prescription review", notes: "Patient reports mild dizziness on mornings.",
    doctorNote: "Review Lisinopril dosage. Check HbA1c trend.", allergies: "Penicillin", lastVisit: "Jun 10, 2026",
  },
  {
    id: "APT002", patientId: 2, patientName: "Sarah Connor", patientAge: 35,
    patientAvatar: "https://i.pravatar.cc/150?u=sarah_connor", patientInitials: "SC",
    disease: "Asthma • Allergies", type: "In-Person", status: "Waiting",
    date: TODAY, time: "09:30 AM", duration: 20, risk: "Medium", adherence: 76,
    online: true, bottleStatus: "Online", gender: "Female",
    currentMeds: ["Albuterol Inhaler", "Montelukast 10mg"],
    reason: "Prescription review — inhaler ran out", notes: "Wheezing episodes increased this week.",
    doctorNote: "Authorize refill. Evaluate step-up therapy.", allergies: "NSAIDs", lastVisit: "Jun 20, 2026",
  },
  {
    id: "APT003", patientId: 3, patientName: "Michael Torres", patientAge: 58,
    patientAvatar: "https://i.pravatar.cc/150?u=michael_torres", patientInitials: "MT",
    disease: "Cardiac Arrhythmia", type: "Urgent", status: "In Progress",
    date: TODAY, time: "10:00 AM", duration: 45, risk: "High", adherence: 61,
    online: false, bottleStatus: "Offline", gender: "Male",
    currentMeds: ["Amiodarone 200mg", "Lisinopril 5mg", "Warfarin 5mg"],
    reason: "Palpitations and missed Warfarin doses — urgent review",
    notes: "Missed Warfarin for 4 days. Palpitations since morning.",
    doctorNote: "URGENT: Check INR immediately. Consider hospitalization.", allergies: "Sulfa drugs", lastVisit: "Jul 3, 2026",
  },
  {
    id: "APT004", patientId: 4, patientName: "Priya Patel", patientAge: 29,
    patientAvatar: "https://i.pravatar.cc/150?u=priya_patel", patientInitials: "PP",
    disease: "Hypothyroidism", type: "Telemedicine", status: "Scheduled",
    date: TODAY, time: "10:30 AM", duration: 15, risk: "Low", adherence: 98,
    online: false, bottleStatus: "Online", gender: "Female",
    currentMeds: ["Levothyroxine 50mcg"],
    reason: "TSH results review — all normal", notes: "TSH within range. Patient doing well.",
    doctorNote: "Maintain current regimen. Next check in 3 months.", allergies: "None", lastVisit: "Jun 10, 2026",
  },
  {
    id: "APT005", patientId: 5, patientName: "Robert Kim", patientAge: 67,
    patientAvatar: "https://i.pravatar.cc/150?u=robert_kim", patientInitials: "RK",
    disease: "COPD • Heart Failure", type: "Urgent", status: "Waiting",
    date: TODAY, time: "11:00 AM", duration: 60, risk: "High", adherence: 54,
    online: true, bottleStatus: "Offline", gender: "Male",
    currentMeds: ["Furosemide 40mg", "Carvedilol 12.5mg", "Spironolactone 25mg"],
    reason: "Worsening breathlessness at night", notes: "Nocturnal dyspnea worsening. Oxygen saturation dropped.",
    doctorNote: "Assess for decompensation. Consider IV Furosemide.", allergies: "Aspirin", lastVisit: "Jul 2, 2026",
  },
  {
    id: "APT006", patientId: 6, patientName: "Linda Foster", patientAge: 44,
    patientAvatar: "https://i.pravatar.cc/150?u=linda_foster", patientInitials: "LF",
    disease: "Rheumatoid Arthritis", type: "Follow-up", status: "Scheduled",
    date: TODAY, time: "11:30 AM", duration: 20, risk: "Medium", adherence: 82,
    online: false, bottleStatus: "Online", gender: "Female",
    currentMeds: ["Methotrexate 15mg", "Folic Acid 5mg", "Hydroxychloroquine 200mg"],
    reason: "Monthly Methotrexate follow-up — CBC review", notes: "Morning stiffness improving.",
    doctorNote: "Check CBC for MTX toxicity. Patient improving.", allergies: "Sulfonamides", lastVisit: "Jun 25, 2026",
  },
  {
    id: "APT007", patientId: 7, patientName: "James Murphy", patientAge: 51,
    patientAvatar: "https://i.pravatar.cc/150?u=james_murphy", patientInitials: "JM",
    disease: "Chronic Kidney Disease", type: "In-Person", status: "Scheduled",
    date: TODAY, time: "12:00 PM", duration: 30, risk: "High", adherence: 69,
    online: true, bottleStatus: "Online", gender: "Male",
    currentMeds: ["Epoetin Alfa", "Sodium Bicarbonate", "Calcium Carbonate"],
    reason: "GFR decline — nephrology consultation", notes: "Nausea after afternoon tablets. GFR declining.",
    doctorNote: "Discuss dialysis readiness. Refer to nephrology.", allergies: "Ibuprofen", lastVisit: "Jul 5, 2026",
  },
  {
    id: "APT008", patientId: 8, patientName: "Emily Watson", patientAge: 38,
    patientAvatar: "https://i.pravatar.cc/150?u=emily_watson", patientInitials: "EW",
    disease: "Bipolar Disorder", type: "Telemedicine", status: "Completed",
    date: TODAY, time: "12:30 PM", duration: 25, risk: "Medium", adherence: 88,
    online: false, bottleStatus: "Online", gender: "Female",
    currentMeds: ["Lithium Carbonate 300mg", "Quetiapine 50mg", "Escitalopram 10mg"],
    reason: "Mood stabilizer monitoring", notes: "Patient feeling stable. No mood episodes this month.",
    doctorNote: "Continue current regimen. Lithium level therapeutic.", allergies: "None", lastVisit: "Jun 20, 2026",
  },
  {
    id: "APT009", patientId: 9, patientName: "David Chen", patientAge: 63,
    patientAvatar: "https://i.pravatar.cc/150?u=david_chen", patientInitials: "DC",
    disease: "Parkinson's Disease", type: "Follow-up", status: "Scheduled",
    date: TODAY, time: "01:00 PM", duration: 30, risk: "Medium", adherence: 79,
    online: false, bottleStatus: "Online", gender: "Male",
    currentMeds: ["Levodopa 100mg", "Carbidopa 25mg", "Pramipexole 0.5mg"],
    reason: "Motor function review", notes: "Tremor control adequate.",
    doctorNote: "Consider morning dose timing adjustment.", allergies: "None", lastVisit: "Jun 28, 2026",
  },
  {
    id: "APT010", patientId: 10, patientName: "Maria Gonzalez", patientAge: 47,
    patientAvatar: "https://i.pravatar.cc/150?u=maria_gonzalez", patientInitials: "MG",
    disease: "Lupus • Hypertension", type: "Urgent", status: "Scheduled",
    date: TODAY, time: "01:30 PM", duration: 30, risk: "High", adherence: 85,
    online: true, bottleStatus: "Online", gender: "Female",
    currentMeds: ["Hydroxychloroquine 200mg", "Prednisone 10mg", "Amlodipine 5mg"],
    reason: "Possible lupus flare — butterfly rash", notes: "Butterfly rash on cheeks. 2 missed HCQ doses.",
    doctorNote: "Order ANA panel + dsDNA. Possible flare.", allergies: "Sulfa", lastVisit: "Jun 15, 2026",
  },
  {
    id: "APT011", patientId: 11, patientName: "Alex Thompson", patientAge: 33,
    patientAvatar: "https://i.pravatar.cc/150?u=alex_thompson", patientInitials: "AT",
    disease: "Type 1 Diabetes", type: "Video", status: "Scheduled",
    date: TODAY, time: "02:00 PM", duration: 20, risk: "Low", adherence: 96,
    online: true, bottleStatus: "Online", gender: "Male",
    currentMeds: ["Insulin Glargine 20U", "Insulin Lispro"],
    reason: "CGM review — HbA1c check", notes: "CGM readings excellent. Patient very compliant.",
    doctorNote: "Continue current insulin regimen.", allergies: "None", lastVisit: "Jun 10, 2026",
  },
  {
    id: "APT012", patientId: 12, patientName: "Susan Park", patientAge: 56,
    patientAvatar: "https://i.pravatar.cc/150?u=susan_park", patientInitials: "SP",
    disease: "Osteoporosis", type: "In-Person", status: "Completed",
    date: TODAY, time: "02:30 PM", duration: 15, risk: "Low", adherence: 91,
    online: false, bottleStatus: "Online", gender: "Female",
    currentMeds: ["Alendronate 70mg", "Calcium 500mg", "Vitamin D3 2000IU"],
    reason: "DEXA scan results review", notes: "Bone density improving.",
    doctorNote: "Maintain current supplementation.", allergies: "None", lastVisit: "Jun 15, 2026",
  },
  {
    id: "APT013", patientId: 14, patientName: "Rachel Adams", patientAge: 26,
    patientAvatar: "https://i.pravatar.cc/150?u=rachel_adams", patientInitials: "RA",
    disease: "Epilepsy", type: "Urgent", status: "Scheduled",
    date: TODAY, time: "03:00 PM", duration: 45, risk: "High", adherence: 80,
    online: true, bottleStatus: "Online", gender: "Female",
    currentMeds: ["Levetiracetam 500mg", "Lamotrigine 100mg"],
    reason: "Seizure episode this morning — emergency review",
    notes: "Mild seizure at 7 AM. Missed 2 morning doses.",
    doctorNote: "URGENT: Assess seizure triggers. Adjust dose.", allergies: "Carbamazepine", lastVisit: "Jun 20, 2026",
  },
  {
    id: "APT014", patientId: 17, patientName: "George Harrison", patientAge: 74,
    patientAvatar: "https://i.pravatar.cc/150?u=george_harrison", patientInitials: "GH",
    disease: "Alzheimer's • HTN", type: "Follow-up", status: "Scheduled",
    date: TODAY, time: "04:00 PM", duration: 30, risk: "High", adherence: 48,
    online: false, bottleStatus: "Offline", gender: "Male",
    currentMeds: ["Donepezil 10mg", "Memantine 10mg", "Amlodipine 5mg"],
    reason: "Cognitive assessment + caregiver consultation",
    notes: "Caregiver reports multiple missed doses. Bottle offline.",
    doctorNote: "Consider automated dispenser. Review with caregiver.", allergies: "None", lastVisit: "Jul 2, 2026",
  },
  {
    id: "APT015", patientId: 18, patientName: "Fatima Al-Hassan", patientAge: 39,
    patientAvatar: "https://i.pravatar.cc/150?u=fatima_hassan", patientInitials: "FA",
    disease: "Crohn's Disease", type: "Telemedicine", status: "Scheduled",
    date: TODAY, time: "04:30 PM", duration: 20, risk: "Medium", adherence: 87,
    online: true, bottleStatus: "Online", gender: "Female",
    currentMeds: ["Adalimumab 40mg", "Mesalazine 800mg", "Budesonide 9mg"],
    reason: "Flare follow-up — CRP response", notes: "Flare settling with new dose.",
    doctorNote: "Monitor CRP. Continue biologic therapy.", allergies: "None", lastVisit: "Jul 1, 2026",
  },
  // Tomorrow + future
  {
    id: "APT016", patientId: 15, patientName: "Kevin Nguyen", patientAge: 45,
    patientAvatar: "https://i.pravatar.cc/150?u=kevin_nguyen", patientInitials: "KN",
    disease: "HIV (managed)", type: "In-Person", status: "Scheduled",
    date: TOMORROW, time: "10:00 AM", duration: 20, risk: "Low", adherence: 97,
    online: false, bottleStatus: "Online", gender: "Male",
    currentMeds: ["Biktarvy", "Rosuvastatin 10mg"],
    reason: "Quarterly viral load review", notes: "Viral load undetectable.",
    doctorNote: "Continue current ART.", allergies: "None", lastVisit: "Jun 5, 2026",
  },
  {
    id: "APT017", patientId: 16, patientName: "Anna Kowalski", patientAge: 52,
    patientAvatar: "https://i.pravatar.cc/150?u=anna_kowalski", patientInitials: "AK",
    disease: "Breast Cancer (post-chemo)", type: "Follow-up", status: "Scheduled",
    date: TOMORROW, time: "11:00 AM", duration: 30, risk: "Medium", adherence: 83,
    online: false, bottleStatus: "Online", gender: "Female",
    currentMeds: ["Tamoxifen 20mg"],
    reason: "Post-chemotherapy follow-up", notes: "Tumor markers negative. Recovery on track.",
    doctorNote: "Schedule 6-month mammogram.", allergies: "None", lastVisit: "Jul 3, 2026",
  },
  {
    id: "APT018", patientId: 13, patientName: "Thomas Wright", patientAge: 71,
    patientAvatar: "https://i.pravatar.cc/150?u=thomas_wright", patientInitials: "TW",
    disease: "Prostate Cancer (remission)", type: "Video", status: "Scheduled",
    date: "2026-07-11", time: "09:00 AM", duration: 20, risk: "Low", adherence: 89,
    online: false, bottleStatus: "Offline", gender: "Male",
    currentMeds: ["Enzalutamide 160mg"],
    reason: "PSA monitoring — remission check", notes: "PSA stable.",
    doctorNote: "Continue therapy. Next PSA in 3 months.", allergies: "None", lastVisit: "Jun 1, 2026",
  },
  {
    id: "APT019", patientId: 19, patientName: "Marcus Johnson", patientAge: 49,
    patientAvatar: "https://i.pravatar.cc/150?u=marcus_johnson", patientInitials: "MJ",
    disease: "Type 2 Diabetes", type: "Follow-up", status: "Scheduled",
    date: "2026-07-11", time: "10:30 AM", duration: 30, risk: "Medium", adherence: 71,
    online: false, bottleStatus: "Online", gender: "Male",
    currentMeds: ["Metformin 1000mg", "Glipizide 5mg"],
    reason: "HbA1c review — suboptimal control", notes: "Patient struggling with dietary compliance.",
    doctorNote: "Consider adding GLP-1 agonist.", allergies: "None", lastVisit: "Jun 15, 2026",
  },
  {
    id: "APT020", patientId: 20, patientName: "Diana Prince", patientAge: 36,
    patientAvatar: "https://i.pravatar.cc/150?u=diana_prince", patientInitials: "DP",
    disease: "PCOS • Hypothyroidism", type: "Telemedicine", status: "Scheduled",
    date: "2026-07-12", time: "11:00 AM", duration: 25, risk: "Low", adherence: 92,
    online: true, bottleStatus: "Online", gender: "Female",
    currentMeds: ["Levothyroxine 75mcg", "Metformin 500mg", "Spironolactone 25mg"],
    reason: "Hormonal panel review", notes: "TSH improving. AMH normal.",
    doctorNote: "Maintain current regimen. PCOS controlled.", allergies: "None", lastVisit: "Jun 20, 2026",
  },
  {
    id: "APT021", patientId: 21, patientName: "Victor Singh", patientAge: 55,
    patientAvatar: "https://i.pravatar.cc/150?u=victor_singh", patientInitials: "VS",
    disease: "Hypertension • CAD", type: "In-Person", status: "Scheduled",
    date: "2026-07-12", time: "03:00 PM", duration: 30, risk: "High", adherence: 68,
    online: false, bottleStatus: "Offline", gender: "Male",
    currentMeds: ["Amlodipine 10mg", "Atenolol 50mg", "Aspirin 75mg"],
    reason: "BP uncontrolled — medication review", notes: "BP 160/100. Missed doses frequently.",
    doctorNote: "Intensify therapy. Add Losartan.", allergies: "ACE inhibitors", lastVisit: "Jun 20, 2026",
  },
  {
    id: "APT022", patientId: 22, patientName: "Nora Ahmed", patientAge: 43,
    patientAvatar: "https://i.pravatar.cc/150?u=nora_ahmed", patientInitials: "NA",
    disease: "Fibromyalgia • Depression", type: "Telemedicine", status: "Scheduled",
    date: "2026-07-13", time: "10:00 AM", duration: 30, risk: "Medium", adherence: 80,
    online: true, bottleStatus: "Online", gender: "Female",
    currentMeds: ["Duloxetine 60mg", "Pregabalin 75mg"],
    reason: "Pain management review", notes: "Pain scores improving.",
    doctorNote: "Continue current regimen. Consider physio.", allergies: "None", lastVisit: "Jun 10, 2026",
  },
  {
    id: "APT023", patientId: 23, patientName: "Elijah Brown", patientAge: 28,
    patientAvatar: "https://i.pravatar.cc/150?u=elijah_brown", patientInitials: "EB",
    disease: "Schizophrenia", type: "Follow-up", status: "Scheduled",
    date: "2026-07-13", time: "01:00 PM", duration: 40, risk: "Medium", adherence: 75,
    online: false, bottleStatus: "Online", gender: "Male",
    currentMeds: ["Olanzapine 10mg", "Benztropine 1mg"],
    reason: "Antipsychotic monitoring", notes: "No psychotic episodes. Some weight gain.",
    doctorNote: "Monitor metabolic parameters. AIMS assessment.", allergies: "None", lastVisit: "Jun 15, 2026",
  },
  {
    id: "APT024", patientId: 24, patientName: "Mei Lin", patientAge: 61,
    patientAvatar: "https://i.pravatar.cc/150?u=mei_lin", patientInitials: "ML",
    disease: "Stroke (recovery)", type: "In-Person", status: "Scheduled",
    date: "2026-07-14", time: "09:30 AM", duration: 45, risk: "High", adherence: 72,
    online: false, bottleStatus: "Online", gender: "Female",
    currentMeds: ["Aspirin 100mg", "Clopidogrel 75mg", "Atorvastatin 40mg"],
    reason: "Post-stroke recovery assessment", notes: "Mild aphasia improving. Physiotherapy ongoing.",
    doctorNote: "Assess BP control. Continue dual antiplatelet.", allergies: "None", lastVisit: "Jun 25, 2026",
  },
  {
    id: "APT025", patientId: 25, patientName: "Carlos Reyes", patientAge: 38,
    patientAvatar: "https://i.pravatar.cc/150?u=carlos_reyes", patientInitials: "CR",
    disease: "Anxiety • Panic Disorder", type: "Video", status: "Scheduled",
    date: "2026-07-14", time: "02:00 PM", duration: 20, risk: "Low", adherence: 93,
    online: true, bottleStatus: "Online", gender: "Male",
    currentMeds: ["Sertraline 50mg", "Alprazolam 0.25mg (PRN)"],
    reason: "Monthly mental health check-in", notes: "Panic attacks reduced significantly.",
    doctorNote: "Consider tapering Alprazolam. Good progress.", allergies: "None", lastVisit: "Jun 10, 2026",
  },
];



// ─── Mini Calendar ─────────────────────────────────────────────────────────────

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function MiniCalendar({ selectedDate, onSelect }: { selectedDate: Date; onSelect: (d: Date) => void }) {
  const [viewDate, setViewDate] = useState(new Date(2026, 6, 1)); // July 2026
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const apptDays = new Set(
    APPOINTMENTS.map(a => {
      const d = new Date(a.date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="h-7 w-7 rounded-lg hover:bg-muted/60 flex items-center justify-center transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold">{viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="h-7 w-7 rounded-lg hover:bg-muted/60 flex items-center justify-center transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {WEEKDAYS.map(d => <div key={d} className="text-center text-[10px] font-bold text-muted-foreground py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const key = `${year}-${month}-${day}`;
          const hasAppt = apptDays.has(key);
          const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
          const isToday = day === 9 && month === 6 && year === 2026;
          return (
            <button
              key={i}
              onClick={() => onSelect(new Date(year, month, day))}
              className={`relative h-7 w-7 mx-auto rounded-full text-xs font-medium flex items-center justify-center transition-all
                ${isSelected ? "bg-blue-600 text-white shadow-md" : isToday ? "border-2 border-blue-500 text-blue-600 font-bold" : "hover:bg-muted/60 text-foreground"}`}
            >
              {day}
              {hasAppt && !isSelected && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Appointment Detail Modal ──────────────────────────────────────────────────

function AppointmentModal({ appt, onClose }: { appt: Appointment; onClose: () => void }) {
  const tc = typeColor(appt.type);
  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-0 shadow-2xl p-0">
      {/* Header banner */}
      <div className={`h-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden rounded-t-3xl`}>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
        <div className="relative z-10 flex items-center justify-between h-full px-6">
          <div className="flex items-center gap-3">
            <Avatar className="w-14 h-14 border-3 border-white/40 shadow-lg">
              <AvatarFallback className="text-xl font-bold bg-blue-700 text-white">{appt.patientInitials}</AvatarFallback>
            </Avatar>
            <div className="text-white">
              <div className="font-bold text-xl">{appt.patientName}</div>
              <div className="text-blue-100 text-sm">{appt.patientAge}y · {appt.gender} · {appt.disease.split("•")[0].trim()}</div>
            </div>
          </div>
          <Badge className={`${tc.bg} ${tc.text} border ${tc.border} font-semibold`}>{appt.type}</Badge>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Appointment info row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Date & Time", value: `${appt.date} · ${appt.time}`, icon: Clock },
            { label: "Duration", value: `${appt.duration} minutes`, icon: CalendarDays },
            { label: "Status", value: appt.status, icon: CheckCircle2 },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl bg-muted/30 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                <Icon className="w-3.5 h-3.5" /> {label}
              </div>
              <div className="text-sm font-semibold">{value}</div>
            </div>
          ))}
        </div>

        {/* Patient metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border/50 p-3 text-center">
            <div className="text-2xl font-bold text-primary">{appt.adherence}%</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Adherence</div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${appt.adherence}%` }} />
            </div>
          </div>
          <div className="rounded-xl border border-border/50 p-3 text-center">
            <div className={`text-2xl font-bold ${appt.risk === "High" ? "text-red-600" : appt.risk === "Medium" ? "text-amber-600" : "text-green-600"}`}>{appt.risk}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Risk Level</div>
            <Badge className={`mt-2 text-[9px] ${riskBadge(appt.risk)}`}>{appt.risk} Risk</Badge>
          </div>
          <div className="rounded-xl border border-border/50 p-3 text-center">
            <div className={`text-2xl font-bold ${appt.bottleStatus === "Online" ? "text-green-600" : "text-red-500"}`}>{appt.bottleStatus}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Smart Bottle</div>
            <div className="flex items-center gap-1 justify-center mt-2 text-[10px] text-muted-foreground">
              {appt.bottleStatus === "Online" ? <Wifi className="w-3.5 h-3.5 text-green-500" /> : <WifiOff className="w-3.5 h-3.5 text-red-400" />}
              Live sync
            </div>
          </div>
        </div>

        {/* Reason & Notes */}
        <div className="space-y-3">
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
            <div className="text-xs font-bold text-blue-700 mb-1">Reason for Visit</div>
            <div className="text-sm text-blue-800">{appt.reason}</div>
          </div>
          {appt.notes && (
            <div className="rounded-xl bg-muted/30 p-4">
              <div className="text-xs font-bold text-muted-foreground mb-1">Patient Notes</div>
              <div className="text-sm">{appt.notes}</div>
            </div>
          )}
          {appt.doctorNote && (
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
              <div className="text-xs font-bold text-amber-700 mb-1 flex items-center gap-1.5"><Stethoscope className="w-3.5 h-3.5" /> Doctor Note</div>
              <div className="text-sm text-amber-800">{appt.doctorNote}</div>
            </div>
          )}
        </div>

        {/* Current Meds */}
        <div>
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><Pill className="w-3.5 h-3.5" /> Current Medications</div>
          <div className="flex flex-wrap gap-2">
            {appt.currentMeds.map(m => (
              <span key={m} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1 font-medium">{m}</span>
            ))}
          </div>
        </div>

        {/* Allergies + Last Visit */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-red-100 bg-red-50 p-3">
            <div className="text-[10px] font-bold text-red-600 mb-1">⚠ Allergies</div>
            <div className="text-sm font-semibold text-red-800">{appt.allergies}</div>
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
            <div className="text-[10px] font-bold text-muted-foreground mb-1">Last Visit</div>
            <div className="text-sm font-semibold">{appt.lastVisit}</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
          <Button onClick={() => toast.success("Launching video call...")} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 text-sm">
            <Video className="w-4 h-4" /> Start Video
          </Button>
          <Button onClick={() => toast.success("Calling patient...")} variant="outline" className="rounded-xl gap-2 text-sm">
            <Phone className="w-4 h-4" /> Call Patient
          </Button>
          <Button onClick={() => toast.success("Opening chat...")} variant="outline" className="rounded-xl gap-2 text-sm">
            <MessageSquarePlus className="w-4 h-4" /> Open Chat
          </Button>
          <Button onClick={() => toast.success("Generating prescription...")} variant="outline" className="rounded-xl gap-2 text-sm">
            <FileText className="w-4 h-4" /> Prescription
          </Button>
          <Button onClick={() => toast.success("Opening reschedule...")} variant="outline" className="rounded-xl gap-2 text-sm">
            <RefreshCcw className="w-4 h-4" /> Reschedule
          </Button>
          <Button onClick={() => toast.success("Appointment cancelled!")} variant="outline" className="rounded-xl gap-2 text-sm border-red-200 text-red-600 hover:bg-red-50">
            <XCircle className="w-4 h-4" /> Cancel
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

// ─── Book Appointment Modal ────────────────────────────────────────────────────

function BookModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ patient: "", date: "", time: "", type: "Video" as ApptType, reason: "", priority: "Medium", notes: "", mode: "Telemedicine" });

  return (
    <DialogContent className="max-w-lg rounded-3xl border-0 shadow-2xl">
      <DialogHeader className="pb-4 border-b border-border/40">
        <DialogTitle className="text-xl font-bold flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-500" /> New Appointment
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 pt-2">
        {[
          { label: "Patient Name", field: "patient", type: "text", placeholder: "Search patient..." },
          { label: "Date", field: "date", type: "date", placeholder: "" },
          { label: "Reason for Appointment", field: "reason", type: "text", placeholder: "e.g. Monthly follow-up" },
          { label: "Notes", field: "notes", type: "text", placeholder: "Additional notes..." },
        ].map(({ label, field, type, placeholder }) => (
          <div key={field}>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">{label}</label>
            <input type={type} value={(form as Record<string, string>)[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
              placeholder={placeholder}
              className="w-full text-sm border border-border/60 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 bg-muted/20" />
          </div>
        ))}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Time</label>
            <select value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
              className="w-full text-sm border border-border/60 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 bg-muted/20">
              {["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Type</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as ApptType }))}
              className="w-full text-sm border border-border/60 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 bg-muted/20">
              {["Video", "In-Person", "Follow-up", "Urgent", "Telemedicine"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Priority</label>
            <div className="flex gap-2">
              {["Low", "Medium", "High"].map(p => (
                <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))}
                  className={`flex-1 text-xs font-semibold py-2 rounded-xl border transition-colors ${form.priority === p ? (p === "High" ? "bg-red-100 text-red-700 border-red-200" : p === "Medium" ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-green-100 text-green-700 border-green-200") : "bg-muted/30 text-muted-foreground border-border/40 hover:bg-muted/50"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Mode</label>
            <div className="flex gap-2">
              {[{ v: "Telemedicine", icon: Video }, { v: "In-Person", icon: MapPin }].map(({ v, icon: Icon }) => (
                <button key={v} onClick={() => setForm(f => ({ ...f, mode: v }))}
                  className={`flex-1 text-xs font-semibold py-2 rounded-xl border flex items-center justify-center gap-1 transition-colors ${form.mode === v ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-muted/30 text-muted-foreground border-border/40 hover:bg-muted/50"}`}>
                  <Icon className="w-3.5 h-3.5" /> {v.split("-")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 flex items-start gap-2">
          <Zap className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-blue-700">AI Suggestion</div>
            <div className="text-xs text-blue-600 mt-0.5">Best available slots: <span className="font-semibold">10:00 AM, 2:30 PM, 4:00 PM</span> tomorrow</div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={() => { toast.success("Appointment booked! Patient notified."); onClose(); }} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
            Save Appointment
          </Button>
          <Button onClick={onClose} variant="outline" className="rounded-xl">Cancel</Button>
        </div>
      </div>
    </DialogContent>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

function AppointmentsPage() {
  const [calView, setCalView] = useState<CalView>("day");
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 6, 9));
  const [activeFilter, setActiveFilter] = useState<FilterKey>("today");
  const [search, setSearch] = useState("");
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [bookOpen, setBookOpen] = useState(false);

  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

  const filteredAppts = useMemo(() => {
    return APPOINTMENTS.filter(a => {
      const matchesSearch = !search ||
        a.patientName.toLowerCase().includes(search.toLowerCase()) ||
        a.disease.toLowerCase().includes(search.toLowerCase()) ||
        a.id.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === "today") return a.date === TODAY;
      if (activeFilter === "tomorrow") return a.date === TOMORROW;
      if (activeFilter === "week") return a.date >= TODAY && a.date <= "2026-07-15";
      if (activeFilter === "month") return a.date >= TODAY && a.date <= "2026-07-31";
      if (activeFilter === "completed") return a.status === "Completed";
      if (activeFilter === "cancelled") return a.status === "Cancelled";
      if (activeFilter === "telemedicine") return a.type === "Telemedicine" || a.type === "Video";
      if (activeFilter === "in-person") return a.type === "In-Person";
      if (activeFilter === "high-risk") return a.risk === "High";
      return true;
    });
  }, [activeFilter, search]);

  const todayAppts = APPOINTMENTS.filter(a => a.date === TODAY);
  const urgentAppts = APPOINTMENTS.filter(a => a.risk === "High");
  const followUps = APPOINTMENTS.filter(a => a.type === "Follow-up");
  const completedToday = todayAppts.filter(a => a.status === "Completed").length;
  const cancelledToday = todayAppts.filter(a => a.status === "Cancelled").length;
  const avgDuration = Math.round(todayAppts.reduce((s, a) => s + a.duration, 0) / todayAppts.length);

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: "today", label: "Today" }, { key: "tomorrow", label: "Tomorrow" },
    { key: "week", label: "This Week" }, { key: "month", label: "This Month" },
    { key: "completed", label: "Completed" }, { key: "cancelled", label: "Cancelled" },
    { key: "telemedicine", label: "Telemedicine" }, { key: "in-person", label: "In-Person" },
    { key: "high-risk", label: "High Risk" },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* ── Page Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage consultations, follow-ups and patient scheduling.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search appointments..."
              className="pl-9 pr-4 py-2 text-sm border border-border/60 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 bg-background w-52" />
          </div>
          {/* Calendar view toggle */}
          <div className="flex bg-muted/60 rounded-xl border border-border/40 p-0.5">
            {(["day", "week", "month"] as CalView[]).map(v => (
              <button key={v} onClick={() => setCalView(v)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${calView === v ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>
                {v}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date(2026, 6, 9))} className="rounded-xl text-xs font-semibold">
            Today
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
          <Button onClick={() => setBookOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-semibold shadow-md shadow-blue-200/50">
            <Plus className="w-4 h-4" /> New Appointment
          </Button>
        </div>
      </div>

      {/* ── Summary Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "Today's", value: todayAppts.length.toString(), sub: "appointments", icon: CalendarDays, color: "from-blue-500 to-blue-600", text: "text-blue-600", bg: "bg-blue-50" },
          { label: "Upcoming", value: "24", sub: "this month", icon: Clock, color: "from-indigo-500 to-indigo-600", text: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Completed", value: completedToday.toString(), sub: "today", icon: CheckCircle2, color: "from-green-500 to-green-600", text: "text-green-600", bg: "bg-green-50" },
          { label: "Cancelled", value: cancelledToday.toString(), sub: "today", icon: XCircle, color: "from-red-500 to-red-600", text: "text-red-600", bg: "bg-red-50" },
          { label: "Avg. Duration", value: `${avgDuration}m`, sub: "per session", icon: Activity, color: "from-teal-500 to-teal-600", text: "text-teal-600", bg: "bg-teal-50" },
          { label: "High Risk", value: urgentAppts.length.toString(), sub: "today", icon: AlertTriangle, color: "from-orange-500 to-orange-600", text: "text-orange-600", bg: "bg-orange-50" },
          { label: "Follow-ups", value: followUps.length.toString(), sub: "pending", icon: RefreshCcw, color: "from-violet-500 to-violet-600", text: "text-violet-600", bg: "bg-violet-50" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-border/40 bg-card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
              <div className={`p-1.5 rounded-lg ${s.bg}`}>
                <s.icon className={`w-3.5 h-3.5 ${s.text}`} />
              </div>
            </div>
            <div className="text-2xl font-bold font-display">{s.value}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setActiveFilter(f.key)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors border ${activeFilter === f.key ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-muted/40 text-muted-foreground border-border/40 hover:text-foreground hover:bg-muted/70"}`}>
            {f.label}
          </button>
        ))}
        {search && (
          <div className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1.5 font-semibold">
            "{search}" <button onClick={() => setSearch("")}><X className="w-3 h-3" /></button>
          </div>
        )}
      </div>

      {/* ── Main Layout: Left 70% + Right 30% ───────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">

        {/* ═══ LEFT PANEL (70%) ════════════════════════════════════════ */}
        <div className="xl:col-span-7 space-y-6">

          {/* Day/Week Header navigation */}
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedDate(d => { const nd = new Date(d); nd.setDate(nd.getDate() - 1); return nd; })}
              className="h-9 w-9 rounded-xl border border-border/60 hover:bg-muted/50 flex items-center justify-center transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="font-bold text-lg">
              {selectedDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
            <button onClick={() => setSelectedDate(d => { const nd = new Date(d); nd.setDate(nd.getDate() + 1); return nd; })}
              className="h-9 w-9 rounded-xl border border-border/60 hover:bg-muted/50 flex items-center justify-center transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            {selectedDateStr !== TODAY && (
              <button onClick={() => setSelectedDate(new Date(2026, 6, 9))} className="text-xs text-blue-600 font-semibold hover:underline">← Back to Today</button>
            )}
          </div>

          {/* Timeline */}
          {filteredAppts.length === 0 ? (
            <div className="rounded-3xl border border-border/40 bg-card p-16 text-center">
              <CalendarDays className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-bold mb-2">No appointments scheduled</h3>
              <p className="text-muted-foreground text-sm mb-6">No appointments match your current filters.</p>
              <Button onClick={() => setBookOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2">
                <Plus className="w-4 h-4" /> Create Appointment
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAppts.map((appt, idx) => {
                const tc = typeColor(appt.type);
                return (
                  <div
                    key={appt.id}
                    onClick={() => setSelectedAppt(appt)}
                    className={`group relative rounded-2xl border bg-card hover:shadow-lg transition-all cursor-pointer overflow-hidden ${
                      appt.risk === "High" ? "border-red-200/60" : appt.status === "Completed" ? "border-green-200/60" : "border-border/50"
                    }`}
                  >
                    {/* Left color bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${tc.dot}`} />

                    <div className="pl-5 pr-5 py-4 flex items-center gap-4">
                      {/* Time column */}
                      <div className="w-16 shrink-0 text-center">
                        <div className="text-sm font-bold text-foreground">{appt.time}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{appt.duration}m</div>
                      </div>

                      {/* Divider line */}
                      <div className="relative w-px self-stretch bg-border/50 shrink-0">
                        <div className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-card ${tc.dot}`} />
                      </div>

                      {/* Patient info */}
                      <div className="relative shrink-0">
                        <Avatar className="w-11 h-11 border border-border/40">
                          <AvatarImage src={appt.patientAvatar} alt={appt.patientName} />
                          <AvatarFallback className="text-xs font-bold">{appt.patientInitials}</AvatarFallback>
                        </Avatar>
                        {appt.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm">{appt.patientName}</span>
                          <span className="text-xs text-muted-foreground">{appt.patientAge}y</span>
                          <Badge className={`text-[9px] font-bold border ${riskBadge(appt.risk)} h-4 py-0 px-1.5`}>{appt.risk}</Badge>
                          {appt.status === "In Progress" && (
                            <Badge className="text-[9px] bg-blue-100 text-blue-700 border-blue-200 h-4 py-0 px-1.5 animate-pulse">● Live</Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">{appt.disease}</div>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${tc.bg} ${tc.text} border ${tc.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`} />{appt.type}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge(appt.status)}`}>{appt.status}</span>
                          <span className="text-[10px] text-muted-foreground">{appt.reason.substring(0, 45)}...</span>
                        </div>
                      </div>

                      {/* Adherence */}
                      <div className="hidden sm:block w-20 shrink-0">
                        <div className="text-xs text-muted-foreground text-center mb-1">Adherence</div>
                        <div className="text-sm font-bold text-center text-primary">{appt.adherence}%</div>
                        <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${appt.adherence >= 80 ? "bg-green-500" : appt.adherence >= 60 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${appt.adherence}%` }} />
                        </div>
                      </div>

                      {/* Bottle status */}
                      <div className="hidden lg:flex flex-col items-center gap-1 w-14 shrink-0">
                        {appt.bottleStatus === "Online"
                          ? <Wifi className="w-4 h-4 text-green-500" />
                          : <WifiOff className="w-4 h-4 text-red-400" />}
                        <div className={`text-[9px] font-semibold ${appt.bottleStatus === "Online" ? "text-green-600" : "text-red-500"}`}>{appt.bottleStatus}</div>
                      </div>

                      {/* Quick actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={e => e.stopPropagation()}>
                        <Button onClick={() => toast.success("Launching video...")} size="icon" className="h-8 w-8 rounded-xl bg-blue-600 hover:bg-blue-700">
                          <Video className="w-3.5 h-3.5" />
                        </Button>
                        <Button onClick={() => toast.success("Calling...")} size="icon" variant="outline" className="h-8 w-8 rounded-xl">
                          <Phone className="w-3.5 h-3.5" />
                        </Button>
                        <Button onClick={() => setSelectedAppt(appt)} size="icon" variant="outline" className="h-8 w-8 rounded-xl">
                          <FileText className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Urgent highlight */}
                    {appt.risk === "High" && (
                      <div className="bg-red-50 border-t border-red-100 px-5 py-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span className="text-xs text-red-600 font-medium">{appt.doctorNote}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* ═══ RIGHT PANEL (30%) ═══════════════════════════════════════ */}
        <div className="xl:col-span-3 space-y-5">
          {/* Mini Calendar */}
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <MiniCalendar selectedDate={selectedDate} onSelect={d => { setSelectedDate(d); setActiveFilter("all"); }} />
          </div>

          {/* Today's Queue */}
          <div className="rounded-2xl border border-border/50 bg-card">
            <div className="p-4 border-b border-border/40 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2"><Users className="w-4 h-4 text-blue-500" /> Today's Queue</h3>
              <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px]">{todayAppts.filter(a => a.status !== "Completed").length} waiting</Badge>
            </div>
            <div className="divide-y divide-border/30">
              {todayAppts.slice(0, 6).map((appt, i) => (
                <div key={appt.id} onClick={() => setSelectedAppt(appt)} className="flex items-center gap-3 p-3 hover:bg-muted/20 cursor-pointer transition-colors">
                  <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</div>
                  <Avatar className="w-8 h-8 border border-border/40 shrink-0">
                    <AvatarImage src={appt.patientAvatar} />
                    <AvatarFallback className="text-[9px] font-bold">{appt.patientInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate">{appt.patientName}</div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {appt.time}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${statusBadge(appt.status)}`}>{appt.status}</span>
                    {appt.risk === "High" && <AlertTriangle className="w-3 h-3 text-red-500" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Urgent / High Risk Patients */}
          <div className="rounded-2xl border border-red-100 bg-red-50/40">
            <div className="p-4 border-b border-red-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-red-700 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Urgent Cases</h3>
              <Badge className="bg-red-100 text-red-700 border-0 text-[10px]">{urgentAppts.length} patients</Badge>
            </div>
            <div className="divide-y divide-red-100">
              {urgentAppts.slice(0, 4).map(appt => (
                <div key={appt.id} onClick={() => setSelectedAppt(appt)} className="flex items-start gap-3 p-3.5 hover:bg-red-50 cursor-pointer transition-colors">
                  <Avatar className="w-9 h-9 border border-red-100 shrink-0">
                    <AvatarImage src={appt.patientAvatar} />
                    <AvatarFallback className="text-[9px] font-bold text-red-700 bg-red-100">{appt.patientInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-red-800">{appt.patientName}</div>
                    <div className="text-[10px] text-red-600 truncate">{appt.disease.split("•")[0].trim()}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-[9px] font-semibold text-red-700">{appt.adherence}% adh</div>
                      <div className="text-[9px] text-red-600 truncate">{appt.time}</div>
                    </div>
                    <div className="text-[10px] text-red-600 mt-1 flex items-start gap-1">
                      <Bot className="w-3 h-3 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{appt.doctorNote}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Follow-ups */}
          <div className="rounded-2xl border border-border/50 bg-card">
            <div className="p-4 border-b border-border/40 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2"><RefreshCcw className="w-4 h-4 text-orange-500" /> Follow-ups</h3>
              <Badge className="bg-orange-100 text-orange-700 border-0 text-[10px]">{followUps.length} pending</Badge>
            </div>
            <div className="divide-y divide-border/30">
              {followUps.slice(0, 5).map(appt => (
                <div key={appt.id} onClick={() => setSelectedAppt(appt)} className="flex items-center gap-3 p-3 hover:bg-muted/20 cursor-pointer transition-colors">
                  <Avatar className="w-8 h-8 border border-border/40 shrink-0">
                    <AvatarImage src={appt.patientAvatar} />
                    <AvatarFallback className="text-[9px] font-bold">{appt.patientInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate">{appt.patientName}</div>
                    <div className="text-[10px] text-muted-foreground">Last: {appt.lastVisit}</div>
                    <div className="text-[10px] text-orange-600 font-medium">Next: {appt.date} {appt.time}</div>
                  </div>
                  <Badge className={`text-[9px] border shrink-0 ${riskBadge(appt.risk)}`}>{appt.risk}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* AI Smart Scheduling */}
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
            <h3 className="text-sm font-bold text-indigo-800 flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-indigo-500" /> AI Schedule Assistant
            </h3>
            <div className="space-y-2.5">
              {[
                { text: "Michael Torres missed Warfarin — urgent follow-up recommended today.", icon: AlertTriangle, color: "text-red-600" },
                { text: "Rachel Adams seizure episode — schedule immediate consultation.", icon: Zap, color: "text-orange-600" },
                { text: "George Harrison: 3 open slots at 2 PM optimal for caregiver visit.", icon: CalendarDays, color: "text-blue-600" },
                { text: "2 scheduling conflicts detected. Tap to resolve.", icon: RefreshCcw, color: "text-violet-600" },
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-indigo-700">
                  <s.icon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${s.color}`} />
                  <span>{s.text}</span>
                </div>
              ))}
            </div>
            <Button onClick={() => toast.success("AI schedule optimized! 3 conflicts resolved.")}
              className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold">
              Optimize Schedule
            </Button>
          </div>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <Dialog open={!!selectedAppt} onOpenChange={o => !o && setSelectedAppt(null)}>
        {selectedAppt && <AppointmentModal appt={selectedAppt} onClose={() => setSelectedAppt(null)} />}
      </Dialog>

      <Dialog open={bookOpen} onOpenChange={setBookOpen}>
        <BookModal onClose={() => setBookOpen(false)} />
      </Dialog>
    </div>
  );
}
