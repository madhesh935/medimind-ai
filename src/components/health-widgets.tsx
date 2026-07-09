import { Link } from "@tanstack/react-router";
import {
  AlertTriangle, Calendar, Flame, HeartPulse, Mic, Phone, Pill, Radio, Shield,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/progress-ring";
import { dashboardStats, sensorReadings } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

function WidgetShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Card className={cn("min-h-[128px] border-border shadow-card", className)}>
      <CardContent className="flex h-full flex-col justify-center p-5">{children}</CardContent>
    </Card>
  );
}

export function HealthScoreWidget() {
  const score = dashboardStats.adherence;
  return (
    <WidgetShell>
      <div className="flex items-center gap-4">
        <ProgressRing value={score} size={72} color="#2563EB">
          <span className="text-[18px] font-bold tabular-nums">{score}</span>
        </ProgressRing>
        <div>
          <div className="text-[13px] text-muted-foreground">Daily Health Score</div>
          <div className="text-[18px] font-semibold">Excellent</div>
          <div className="text-[13px] text-success">+6% vs yesterday</div>
        </div>
      </div>
    </WidgetShell>
  );
}

export function InteractionCheckerWidget() {
  return (
    <WidgetShell>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/10">
          <AlertTriangle className="h-[22px] w-[22px] text-warning" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <div className="text-[15px] font-semibold">Interaction Checker</div>
          <div className="mt-1 text-[13px] text-muted-foreground">1 mild interaction detected</div>
          <div className="mt-2.5 rounded-lg border border-warning/20 bg-warning/10 px-3 py-2 text-[13px] text-warning">
            Metformin + Alcohol — avoid excess
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}

export function SmartBottleWidget() {
  return (
    <WidgetShell>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Radio className="h-[22px] w-[22px] text-primary" strokeWidth={2} />
          </div>
          <div>
            <div className="text-[15px] font-semibold">Smart Bottle #A2</div>
            <div className="text-[13px] text-muted-foreground">{sensorReadings.pillCount} pills · {sensorReadings.battery}% battery</div>
          </div>
        </div>
        <span className="status-live shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#15803D] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#15803D]" />
          </span>
          Live
        </span>
      </div>
    </WidgetShell>
  );
}

export function EmergencyContactWidget() {
  return (
    <WidgetShell>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
          <Phone className="h-[22px] w-[22px] text-destructive" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <div className="text-[15px] font-semibold">Emergency Contact</div>
          <div className="text-[13px] text-muted-foreground">Sarah Anderson · Daughter</div>
        </div>
        <Button variant="destructive" className="h-9 rounded-lg px-3 text-[13px]">Call</Button>
      </div>
    </WidgetShell>
  );
}

export function StreakCalendarWidget() {
  const days = Array.from({ length: 14 }, (_, i) => ({ day: i + 1, taken: i !== 5 && i !== 9 }));
  return (
    <WidgetShell>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-[22px] w-[22px] text-warning" strokeWidth={2} />
          <span className="text-[15px] font-semibold">{dashboardStats.weeklyStreak}-day streak</span>
        </div>
        <Calendar className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={2} />
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {days.map((d) => (
          <div
            key={d.day}
            className={cn("h-6 rounded-md transition-colors", d.taken ? "bg-success/25 ring-1 ring-success/20" : "bg-muted")}
            title={`Day ${d.day}`}
          />
        ))}
      </div>
    </WidgetShell>
  );
}

export function VoiceAssistantWidget() {
  return (
    <WidgetShell>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Mic className="h-[22px] w-[22px] text-primary" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <div className="text-[15px] font-semibold">Ask MediMind</div>
          <div className="text-[13px] text-muted-foreground">Voice assistant — hands-free</div>
        </div>
        <Button asChild variant="outline" className="h-9 rounded-lg px-3 text-[13px] shadow-none">
          <Link to="/ai-assistant">Try</Link>
        </Button>
      </div>
    </WidgetShell>
  );
}

export function WeeklyInsightsWidget({ className }: { className?: string }) {
  return (
    <WidgetShell className={className}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <HeartPulse className="h-[22px] w-[22px] text-primary" strokeWidth={2} />
        </div>
        <div>
          <div className="text-[15px] font-semibold">AI Insights · This Week</div>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            Evening doses are your weakest window. Setting a 7:45 PM reminder could boost adherence by ~8%.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[12px] text-muted-foreground">
            <Shield className="h-3.5 w-3.5" strokeWidth={2} /> HIPAA-compliant analysis
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}

export function PillBottleVisual({ remaining, total, name }: { remaining: number; total: number; name: string }) {
  const pct = (remaining / total) * 100;
  const fillHeight = Math.max(15, Math.min(85, pct));
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex flex-col items-center">
        <div className="h-3.5 w-11 rounded-t-lg bg-slate-300 shadow-sm" />
        <div className="relative h-24 w-16 overflow-hidden rounded-b-2xl border border-border bg-white shadow-card">
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-primary/60 transition-all duration-1000 ease-out"
            style={{ height: `${fillHeight}%` }}
          />
          <Pill className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-white/95" strokeWidth={2} />
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-[26px] font-bold tabular-nums tracking-tight">{remaining}</div>
        <div className="text-[13px] text-muted-foreground">Pills Left</div>
        <div className="mt-1 text-[12px] font-medium text-muted-foreground">{name}</div>
      </div>
    </div>
  );
}
