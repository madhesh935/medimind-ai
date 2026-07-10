import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check, X, Clock } from "lucide-react";
import { getMedicationLogsRange, MOCK_MED_LOGS } from "@/lib/api";
import { useMedicationCalendar, type CalendarLog } from "@/hooks/use-medication-calendar";

export const Route = createFileRoute("/_app/medication-calendar")({ component: FullMedicationCalendar });

const STATUS_DOT: Record<string, string> = {
  green: "bg-success",
  yellow: "bg-warning",
  red: "bg-destructive",
  gray: "bg-muted-foreground/30",
};

interface LogEntry {
  scheduled_time: string;
  status: "taken" | "missed" | "late" | "pending";
  delay_minutes: number;
  medicine_id: number;
}

function FullMedicationCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_MED_LOGS as any);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const start = new Date(year, month, 1).toISOString();
    const end = new Date(year, month + 1, 1).toISOString();
    getMedicationLogsRange(start, end).then((data) => setLogs(data as LogEntry[])).catch((err) => console.warn("Using instant mock data:", err));
  }, [year, month]);

  const days = useMedicationCalendar(logs as CalendarLog[], year, month);

  const monthlyProgress = (() => {
    const withData = logs.length;
    if (withData === 0) return 0;
    const taken = logs.filter((l) => l.status === "taken").length;
    return Math.round((taken / withData) * 100);
  })();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const selectedLogs = selectedDate
    ? logs.filter((l) => {
        const d = new Date(l.scheduled_time);
        return d.getFullYear() === selectedDate.getFullYear() && d.getMonth() === selectedDate.getMonth() && d.getDate() === selectedDate.getDate();
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Medication Calendar</h1>
        <p className="text-sm text-muted-foreground">Visualize and manage your daily medication adherence history.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-semibold">
                {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
              </CardTitle>
            </div>
            <div className="flex items-center gap-1.5">
              <Button size="icon" variant="outline" className="h-9 w-9 rounded-lg" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="h-9 rounded-lg text-xs font-semibold px-3" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button size="icon" variant="outline" className="h-9 w-9 rounded-lg" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-muted-foreground uppercase">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="py-2">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {days.map((item, idx) => {
                const now = new Date();
                const isToday = item.date.getDate() === now.getDate() && item.date.getMonth() === now.getMonth() && item.date.getFullYear() === now.getFullYear();
                const isSelected = selectedDate &&
                                  item.date.getDate() === selectedDate.getDate() &&
                                  item.date.getMonth() === selectedDate.getMonth() &&
                                  item.date.getFullYear() === selectedDate.getFullYear();

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(item.date)}
                    className={`min-h-[72px] flex flex-col justify-between border border-border/40 p-2 rounded-xl transition-all hover:bg-muted/40 relative ${
                      isToday ? "ring-2 ring-primary bg-primary/5" : ""
                    } ${isSelected ? "border-primary bg-primary/10" : "bg-card"} ${
                      !item.isCurrentMonth ? "opacity-35" : ""
                    }`}
                  >
                    <span className={`text-xs font-bold ${isToday ? "text-primary" : "text-foreground"}`}>
                      {item.date.getDate()}
                    </span>
                    <div className="flex justify-end w-full">
                      <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[item.status]}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adherence Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly Progress</span>
                <span className="font-bold text-foreground">{monthlyProgress}%</span>
              </div>
              <Progress value={monthlyProgress} className="h-2" />
            </div>

            {selectedDate && (
              <div className="space-y-4 pt-4 border-t border-border/60">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Doses for {selectedDate.toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Detail view of your intake logging</p>
                </div>
                <div className="space-y-3">
                  {selectedLogs.length === 0 && (
                    <p className="text-xs text-muted-foreground">No scheduled doses logged for this day.</p>
                  )}
                  {selectedLogs.map((log, i) => {
                    const taken = log.status === "taken";
                    const time = new Date(log.scheduled_time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
                    return (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20">
                        <div>
                          <div className="text-sm font-semibold">Scheduled dose</div>
                          <div className="text-xs text-muted-foreground">{time}</div>
                        </div>
                        {taken ? (
                          <Badge className="bg-success/15 text-success border-0 flex gap-1 items-center">
                            <Check className="h-3 w-3" /> Taken
                          </Badge>
                        ) : log.status === "missed" ? (
                          <Badge className="bg-destructive/15 text-destructive border-0 flex gap-1 items-center">
                            <X className="h-3 w-3" /> Missed
                          </Badge>
                        ) : (
                          <Badge className="bg-warning/15 text-warning border-0 flex gap-1 items-center">
                            <Clock className="h-3 w-3" /> {log.status}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
