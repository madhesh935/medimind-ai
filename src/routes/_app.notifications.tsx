import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { notifications } from "@/lib/mock-data";
import {
  Filter, Pill, Bot, Radio, Stethoscope, AlertTriangle, CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/_app/notifications")({ component: NotificationsPage });

const ICON_MAP: Record<string, { icon: LucideIcon; tone: string }> = {
  success: { icon: CheckCircle2, tone: "bg-success/10 text-success" },
  warning: { icon: AlertTriangle, tone: "bg-warning/10 text-warning" },
  danger: { icon: AlertTriangle, tone: "bg-destructive/10 text-destructive" },
  info: { icon: Bot, tone: "bg-primary/10 text-primary" },
};

const GROUPED = [
  {
    day: "Today",
    items: [
      { ...notifications[0], time: "2 mins ago" },
      { ...notifications[3], time: "1 hour ago" },
      { ...notifications[1], time: "3 hours ago" },
      { ...notifications[2], time: "5 hours ago" },
    ],
  },
  {
    day: "Yesterday",
    items: [
      { ...notifications[4], time: "Yesterday" },
      { ...notifications[5], time: "Yesterday" },
    ],
  },
];

function NotificationsPage() {
  const filters = ["All", "Unread", "Critical", "Medication", "AI"];
  return (
    <div className="space-y-8">
      <PageHeader
        title="Notifications"
        subtitle="All your reminders, alerts, and messages in one place"
        action={
          <Button variant="outline" className="h-10 rounded-xl shadow-none">
            <Filter className="mr-2 h-[18px] w-[18px]" strokeWidth={2} />Filters
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {filters.map((f, i) => (
          <button
            key={f}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${i === 0 ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:bg-foreground/[0.04]"}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {GROUPED.map((group) => (
          <div key={group.day}>
            <h2 className="mb-4 text-[22px] font-semibold tracking-tight">{group.day}</h2>
            <Card className="border-border shadow-card">
              <CardContent className="divide-y divide-border p-0">
                {group.items.map((n, i) => {
                  const meta = ICON_MAP[n.type] ?? ICON_MAP.info;
                  const Icon = n.channel === "Device" ? Radio : n.channel === "Clinician" ? Stethoscope : n.title.includes("Medicine") ? Pill : meta.icon;
                  return (
                    <div key={i} className="flex items-start gap-4 px-6 py-5 transition-colors hover:bg-foreground/[0.02]">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${meta.tone}`}>
                        <Icon className="h-[22px] w-[22px]" strokeWidth={2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[15px] font-semibold">{n.title}</span>
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-[12px] text-muted-foreground">{n.channel}</span>
                        </div>
                        <p className="mt-1 text-[15px] text-muted-foreground">{n.body}</p>
                      </div>
                      <span className="shrink-0 text-[13px] text-muted-foreground">{n.time}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
