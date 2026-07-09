import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Phone, MessageSquare, AlertOctagon, MapPin, HeartPulse, Pill, Shield } from "lucide-react";
import { notifications } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/caregiver")({ component: Caregiver });

function Caregiver() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Caregiver Dashboard</h1>
        <p className="text-sm text-muted-foreground">Peace of mind — real-time status of your loved one.</p>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gradient-health p-6 text-white">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white/40"><AvatarFallback className="bg-white/20 text-lg font-semibold">JA</AvatarFallback></Avatar>
            <div className="min-w-0 flex-1">
              <div className="font-display text-2xl font-bold">John Anderson</div>
              <div className="opacity-80">Diabetes · Hypertension · Age 62</div>
            </div>
            <div className="flex gap-2">
              <Button className="rounded-xl bg-white text-primary hover:bg-white/90"><Phone className="mr-1.5 h-4 w-4" />Call</Button>
              <Button className="rounded-xl border border-white/25 bg-white/10 backdrop-blur"><MessageSquare className="mr-1.5 h-4 w-4" />Message</Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { i: Pill, l: "Medication taken", v: "3/4", tone: "text-success" },
          { i: HeartPulse, l: "Current risk", v: "Low", tone: "text-primary" },
          { i: MapPin, l: "Location", v: "At home", tone: "text-accent" },
          { i: Shield, l: "Vitals", v: "Normal", tone: "text-success" },
        ].map((s) => (
          <Card key={s.l}><CardContent className="p-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted"><s.i className={`h-5 w-5 ${s.tone}`} /></div>
            <div><div className="text-xs text-muted-foreground">{s.l}</div><div className="font-display text-xl font-bold">{s.v}</div></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader><CardTitle>Recent alerts</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {notifications.slice(0, 5).map((n, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl border border-border/60 p-3">
                <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${n.type === "danger" ? "bg-destructive" : n.type === "warning" ? "bg-warning" : n.type === "success" ? "bg-success" : "bg-primary"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold">{n.title}</div>
                    <Badge variant="outline" className="rounded-full text-[10px]">{n.channel}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{n.body}</div>
                </div>
                <div className="text-xs text-muted-foreground">{n.time}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader><CardTitle className="text-destructive">Emergency</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">Send instant help to John's phone and notify EMS.</div>
            <Button className="h-14 w-full rounded-2xl bg-destructive text-lg font-bold hover:bg-destructive/90"><AlertOctagon className="mr-2 h-5 w-5" />Emergency Call</Button>
            <div className="rounded-xl bg-card p-3 text-xs">
              <div className="font-semibold">Emergency contact</div>
              <div className="text-muted-foreground">Dr. Priya Patel · +1 (415) 555-0198</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card><CardHeader><CardTitle>Weekly summary</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-4">
        {[
          { l: "Doses taken", v: "26/28" },
          { l: "Missed", v: "2" },
          { l: "Voice reminders", v: "14" },
          { l: "Avg. adherence", v: "93%" },
        ].map((s) => (
          <div key={s.l} className="rounded-xl bg-muted/40 p-4">
            <div className="text-xs text-muted-foreground">{s.l}</div>
            <div className="font-display text-2xl font-bold">{s.v}</div>
          </div>
        ))}
      </CardContent></Card>
    </div>
  );
}
