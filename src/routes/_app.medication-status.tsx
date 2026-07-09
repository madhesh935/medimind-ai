import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { medications, todaysSchedule } from "@/lib/mock-data";
import { Pill, Clock, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_app/medication-status")({ component: MedStatus });

function MedStatus() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Medication status</h1>
        <p className="text-sm text-muted-foreground">Live status of John Anderson's medications today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {medications.map((m) => (
          <Card key={m.id} className="overflow-hidden">
            <div className={`h-1 bg-gradient-to-r ${m.color}`} />
            <CardContent className="p-5">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white ${m.color}`}><Pill className="h-5 w-5" /></div>
              <div className="mt-3 font-semibold">{m.name}</div>
              <div className="text-xs text-muted-foreground">{m.dosage} · {m.schedule}</div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-bold">{m.remaining} pills</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Today's timeline</CardTitle></CardHeader>
        <CardContent>
          <ol className="relative space-y-3 border-l-2 border-border/70 pl-5">
            {todaysSchedule.map((s, i) => (
              <li key={i} className="relative">
                <span className={`absolute -left-[26px] top-1.5 flex h-3.5 w-3.5 rounded-full ring-4 ring-background ${s.status === "taken" ? "bg-success" : "bg-primary animate-pulse"}`} />
                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-3">
                  <div>
                    <div className="text-sm font-semibold">{s.name} · {s.dosage}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="h-3 w-3" />{s.time}</div>
                  </div>
                  <Badge className={`rounded-full ${s.status === "taken" ? "bg-success/15 text-success" : "bg-primary/15 text-primary"}`}>
                    {s.status === "taken" ? <><CheckCircle2 className="mr-1 h-3 w-3" />Taken</> : "Upcoming"}
                  </Badge>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
