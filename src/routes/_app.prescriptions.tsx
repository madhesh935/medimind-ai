import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FileText, Search, Sparkles } from "lucide-react";
import { medications, patients } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/prescriptions")({ component: Prescriptions });

const prescriptions = patients.slice(0, 6).map((p, i) => ({
  ...p,
  medicine: medications[i % medications.length].name,
  dosage: medications[i % medications.length].dosage,
  refills: [3, 2, 5, 1, 4, 2][i],
  date: ["Nov 2", "Oct 30", "Oct 28", "Oct 25", "Oct 22", "Oct 18"][i],
}));

function Prescriptions() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Prescriptions</h1>
          <p className="text-sm text-muted-foreground">Issue, review and manage every active prescription in your care.</p>
        </div>
        <Button className="rounded-xl bg-gradient-primary shadow-glow"><Plus className="mr-2 h-4 w-4" />New prescription</Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent prescriptions</CardTitle>
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search…" className="h-9 rounded-xl pl-9" />
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-2">
          {prescriptions.map((rx) => (
            <div key={rx.name + rx.medicine} className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-sm font-bold text-white">
                {rx.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 truncate font-semibold">{rx.name} <Badge variant="outline" className="rounded-full text-[10px]">{rx.disease}</Badge></div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="h-3 w-3" /> {rx.medicine} · {rx.dosage} · {rx.refills} refills left
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground/80">Issued {rx.date} · Dr. Priya Patel</div>
              </div>
              <Button size="sm" variant="outline" className="rounded-xl">Renew</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">AI-suggested changes</CardTitle>
          <Badge className="rounded-full bg-gradient-ai text-white border-0"><Sparkles className="mr-1 h-3 w-3" />AI</Badge>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {[
            { p: "Emma Wilson", s: "Switch Metformin IR → XR", r: "Reduces morning nausea; expected +14% adherence." },
            { p: "Robert Kim", s: "Add Tiotropium daily", r: "COPD exacerbation risk decreased in similar cohort." },
            { p: "James Carter", s: "Reduce Amlodipine to 5mg", r: "Latest BP trend supports lower dose." },
            { p: "Priya Menon", s: "Extend Atorvastatin 3 mo", r: "Cholesterol stable, no adverse events." },
          ].map((s) => (
            <div key={s.p} className="rounded-2xl border border-border/60 bg-muted/30 p-4">
              <div className="text-sm font-semibold">{s.p}</div>
              <div className="mt-1 text-sm text-primary">{s.s}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.r}</div>
              <div className="mt-2 flex gap-2">
                <Button size="sm" className="rounded-xl bg-gradient-primary">Accept</Button>
                <Button size="sm" variant="outline" className="rounded-xl">Review</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
