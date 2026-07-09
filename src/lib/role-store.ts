import { useSyncExternalStore } from "react";

export type Role = "patient" | "caregiver" | "doctor" | "admin";

const KEY = "medimind.role";
const listeners = new Set<() => void>();
let current: Role = (typeof window !== "undefined" && (localStorage.getItem(KEY) as Role)) || "patient";

function emit() {
  listeners.forEach((l) => l());
}

export function setRole(r: Role) {
  current = r;
  if (typeof window !== "undefined") localStorage.setItem(KEY, r);
  emit();
}

export function getRole(): Role {
  return current;
}

export function useRole(): Role {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => "patient" as Role,
  );
}

export const roleMeta: Record<Role, { label: string; user: string; initials: string; email: string; subtitle: string; accent: string }> = {
  patient: { label: "Patient", user: "John Anderson", initials: "JA", email: "john@medimind.ai", subtitle: "Type 2 Diabetes · Hypertension", accent: "from-blue-500 to-indigo-600" },
  caregiver: { label: "Caregiver", user: "Sarah Anderson", initials: "SA", email: "sarah@medimind.ai", subtitle: "Caring for John Anderson", accent: "from-emerald-500 to-teal-600" },
  doctor: { label: "Doctor", user: "Dr. Priya Patel", initials: "PP", email: "p.patel@medimind.ai", subtitle: "Internal Medicine · 138 patients", accent: "from-purple-500 to-fuchsia-600" },
  admin: { label: "Admin", user: "Alex Morgan", initials: "AM", email: "alex@medimind.ai", subtitle: "System Administrator", accent: "from-rose-500 to-orange-500" },
};
