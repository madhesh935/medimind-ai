import { createFileRoute } from "@tanstack/react-router";
import { medications } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Pause, Pencil, Pill, Utensils, Eye } from "lucide-react";

export const Route = createFileRoute("/_app/medication")({ component: MedicationPage });

function MedicationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Medication</h1>
          <p className="text-sm text-muted-foreground">Your active prescriptions and schedule.</p>
        </div>
        <Button className="rounded-xl bg-gradient-primary">Add medication</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
        {medications.map((m) => (
          <Card key={m.id} className="overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${m.color}`} />
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${m.color} text-white shadow-lg`}>
                  <Pill className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-xl font-bold">{m.name}</h3>
                    <Badge variant="outline" className="rounded-full">{m.dosage}</Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{m.purpose}</p>
                </div>
                <Badge className="rounded-full bg-success/15 text-success">Active</Badge>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">{m.schedule}</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-3">
                  <Utensils className="h-4 w-4 text-accent" />
                  <span className="text-muted-foreground">{m.food}</span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-muted-foreground">Side effects:</span>
                  {m.sideEffects.map((s) => (
                    <span key={s} className="rounded-full bg-muted px-2 py-0.5">{s}</span>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <AlertTriangle className="h-3 w-3 text-warning" />
                  <span className="text-muted-foreground">Interaction:</span>
                  {m.warnings.map((s) => (
                    <span key={s} className="rounded-full bg-warning/15 px-2 py-0.5 text-warning">{s}</span>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="rounded-lg"><Eye className="mr-1.5 h-3.5 w-3.5" />View</Button>
                <Button size="sm" variant="outline" className="rounded-lg"><Pencil className="mr-1.5 h-3.5 w-3.5" />Edit</Button>
                <Button size="sm" variant="outline" className="rounded-lg"><Pause className="mr-1.5 h-3.5 w-3.5" />Pause</Button>
                <div className="ml-auto text-xs text-muted-foreground">
                  {m.remaining} pills left
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>History timeline</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { t: "Today · 8:02 AM", m: "Metformin 500mg", ok: true },
              { t: "Today · 9:00 AM", m: "Lisinopril 10mg", ok: true },
              { t: "Yesterday · 10:00 PM", m: "Atorvastatin 20mg", ok: false },
              { t: "Yesterday · 8:00 PM", m: "Metformin 500mg", ok: true },
              { t: "2d ago · 8:00 AM", m: "Metformin 500mg", ok: true },
              { t: "2d ago · 9:00 AM", m: "Lisinopril 10mg", ok: true },
            ].map((h, i) => (
              <div key={i} className={`rounded-xl border p-3 ${h.ok ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
                <div className="text-xs text-muted-foreground">{h.t}</div>
                <div className="text-sm font-semibold">{h.m}</div>
                <div className={`mt-1 text-xs ${h.ok ? "text-success" : "text-destructive"}`}>{h.ok ? "Taken" : "Missed"}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
