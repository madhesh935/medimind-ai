import { useMemo } from "react";

export interface CalendarLog {
  scheduled_time: string;
  status: "taken" | "missed" | "late" | "pending";
  delay_minutes?: number;
}

export type DayStatus = "green" | "yellow" | "red" | "gray";

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  status: DayStatus;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dayStatusFromLogs(logs: CalendarLog[]): DayStatus {
  if (logs.length === 0) return "gray";
  if (logs.some((l) => l.status === "missed")) return "red";
  if (logs.some((l) => l.status === "late" || (l.delay_minutes ?? 0) > 0)) return "yellow";
  if (logs.every((l) => l.status === "taken")) return "green";
  return "gray";
}

/** Builds a 42-cell month grid with real per-day adherence status derived from
 * MedicationLog rows, replacing the previous `day % 7` fabrication. */
export function useMedicationCalendar(logs: CalendarLog[], year: number, month: number): CalendarDay[] {
  return useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, prevMonthDays - i), isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days.map(({ date, isCurrentMonth }) => ({
      date,
      isCurrentMonth,
      status: dayStatusFromLogs(logs.filter((l) => sameDay(new Date(l.scheduled_time), date))),
    }));
  }, [logs, year, month]);
}
