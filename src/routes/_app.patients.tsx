import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Search, Filter, Download, ChevronRight } from "lucide-react";
import { patients } from "@/lib/mock-data";
import { useRole } from "@/lib/role-store";

export const Route = createFileRoute("/_app/patients")({ component: Patients });

function Patients() {
  const role = useRole();
  const title = role === "caregiver" ? "Assigned patients" : role === "admin" ? "All patients" : "Patient roster";
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">Live adherence, risk and status across your patient population.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl"><Filter className="mr-2 h-4 w-4" />Filters</Button>
          <Button className="rounded-xl bg-gradient-primary shadow-glow"><Download className="mr-2 h-4 w-4" />Export</Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { k: "Total", v: patients.length, c: "bg-primary/10 text-primary" },
          { k: "High risk", v: patients.filter((p) => p.risk === "High").length, c: "bg-destructive/10 text-destructive" },
          { k: "Medium risk", v: patients.filter((p) => p.risk === "Medium").length, c: "bg-warning/10 text-warning" },
          { k: "Low risk", v: patients.filter((p) => p.risk === "Low").length, c: "bg-success/10 text-success" },
        ].map((s) => (
          <Card key={s.k} className="p-4">
            <div className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${s.c}`}>{s.k}</div>
            <div className="mt-2 font-display text-3xl font-bold">{s.v}</div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Patients ({patients.length})</CardTitle>
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search patients…" className="h-9 rounded-xl pl-9" />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr className="border-b border-border/60"><th className="p-3 text-left">Patient</th><th className="p-3 text-left">Disease</th><th className="p-3 text-left">Medication</th><th className="p-3 text-left">Risk</th><th className="p-3 text-left">Adherence</th><th className="p-3 text-left">Last dose</th><th className="p-3 text-left">Status</th><th className="p-3" /></tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.name} className="border-b border-border/40 last:border-0 hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-xs font-bold text-white">{p.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}</div>
                      <div><div className="font-semibold">{p.name}</div><div className="text-xs text-muted-foreground">Age {p.age}</div></div>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{p.disease}</td>
                  <td className="p-3 text-muted-foreground">{p.medication}</td>
                  <td className="p-3"><Badge className={`rounded-full ${p.risk === "High" ? "bg-destructive/15 text-destructive" : p.risk === "Medium" ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>{p.risk}</Badge></td>
                  <td className="p-3"><div className="flex items-center gap-2"><Progress value={p.adherence} className="h-1.5 w-24" /><span className="text-xs font-semibold">{p.adherence}%</span></div></td>
                  <td className="p-3 text-muted-foreground">{p.lastDose}</td>
                  <td className="p-3"><Badge variant="outline" className="rounded-full">{p.status}</Badge></td>
                  <td className="p-3 text-right"><Button size="icon" variant="ghost" className="rounded-xl"><ChevronRight className="h-4 w-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
