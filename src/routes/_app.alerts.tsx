import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Bell, Phone, MessageCircle, Stethoscope } from "lucide-react";
import { notifications } from "@/lib/mock-data";

import { toast } from "sonner";

export const Route = createFileRoute("/_app/alerts")({ component: Alerts });

const critical = [
  { title: "Missed evening dose", body: "John did not take Atorvastatin last night", severity: "danger", time: "12h ago", patient: "John Anderson" },
  { title: "Bottle offline", body: "Smart Bottle #A2 hasn't reported in 6h", severity: "warning", time: "6h ago", patient: "John Anderson" },
  { title: "Risk score rose", body: "Weekly risk moved from Low → Medium", severity: "warning", time: "2h ago", patient: "John Anderson" },
];

function Alerts() {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-rose-500 to-orange-500 p-6 text-white shadow-lg sm:p-8">
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur"><AlertTriangle className="h-7 w-7" /></div>
          <div>
            <div className="text-[10px] uppercase tracking-widest opacity-80">Live monitoring</div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">3 alerts need your attention</h1>
            <p className="mt-1 text-sm text-white/85">Real-time critical & warning events for John Anderson.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {critical.map((a) => (
          <Card key={a.title} className="overflow-hidden">
            <div className={`h-1 ${a.severity === "danger" ? "bg-destructive" : "bg-warning"}`} />
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{a.patient} · {a.time}</div>
                </div>
                <Badge className={`rounded-full ${a.severity === "danger" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"}`}>{a.severity}</Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{a.body}</p>
              <div className="mt-4 flex gap-2">
                <Button onClick={() => toast.info(`Initiating call to ${a.patient}...`)} size="sm" className="rounded-xl bg-gradient-primary"><Phone className="mr-1.5 h-3.5 w-3.5" />Call</Button>
                <Button onClick={() => toast.info(`Opening messaging screen for ${a.patient}...`)} size="sm" variant="outline" className="rounded-xl"><MessageCircle className="mr-1.5 h-3.5 w-3.5" />Message</Button>
                <Button onClick={() => toast.success(`Dr. Priya Patel has been notified regarding ${a.patient}.`)} size="sm" variant="outline" className="rounded-xl"><Stethoscope className="mr-1.5 h-3.5 w-3.5" />Notify doctor</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">All notifications</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {notifications.map((n, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
              <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg ${n.type === "danger" ? "bg-destructive/15 text-destructive" : n.type === "warning" ? "bg-warning/15 text-warning" : n.type === "success" ? "bg-success/15 text-success" : "bg-primary/15 text-primary"}`}>
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1"><div className="text-sm font-semibold">{n.title}</div><div className="text-xs text-muted-foreground">{n.body}</div></div>
              <span className="text-xs text-muted-foreground">{n.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
