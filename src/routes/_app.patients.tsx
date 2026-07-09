import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, Download, ChevronRight } from "lucide-react";
import { patients as mockPatients } from "@/lib/mock-data";
import { useRole } from "@/lib/role-store";
import { getPatientsList, getDoctorsList, type PatientSummary, type DoctorSummary, MOCK_PATIENTS } from "@/lib/api";

import { toast } from "sonner";

export const Route = createFileRoute("/_app/patients")({ component: Patients });

function age(dob: string | null): string {
  if (!dob) return "—";
  const diff = Date.now() - new Date(dob).getTime();
  return String(Math.floor(diff / (365.25 * 24 * 3600 * 1000)));
}

function toCsv(rows: PatientSummary[]): string {
  const header = "Name,Email,Risk,Adherence,Status,Medications\n";
  const body = rows.map((p) => `"${p.name}","${p.email}","${p.risk}",${p.adherence},"${p.status}","${p.medications.join("; ")}"`).join("\n");
  return header + body;
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function Patients() {
  const role = useRole();
  const isAdmin = role === "admin";
  const title = isAdmin ? "All patients" : "Patient roster";
  const description = isAdmin
    ? "Live adherence, risk and status across every patient in the hospital network."
    : "Live adherence, risk and status across your patient panel.";

  const [live, setLive] = useState<PatientSummary[]>(MOCK_PATIENTS);
  const [doctorsByUser, setDoctorsByUser] = useState<Record<number, string>>({});
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<"All" | "High" | "Medium" | "Low">("All");

  useEffect(() => {
    getPatientsList().then(setLive).catch(() => setLive([]));
    if (isAdmin) {
      getDoctorsList().then((docs: DoctorSummary[]) => {
        const map: Record<number, string> = {};
        docs.forEach((d) => { map[d.id] = d.name; });
        setDoctorsByUser(map);
      }).catch(() => {});
    }
  }, [isAdmin]);

  const usingLive = live !== null;
  const rows = usingLive ? live : [];

  const filtered = useMemo(() => {
    if (!usingLive) {
      const q = search.toLowerCase();
      return mockPatients.filter((p) =>
        (p.name.toLowerCase().includes(q) || p.disease.toLowerCase().includes(q) || p.medication.toLowerCase().includes(q) || p.doctor.toLowerCase().includes(q)) &&
        (riskFilter === "All" || p.risk === riskFilter)
      );
    }
    const q = search.toLowerCase();
    return rows.filter((p) =>
      (p.name.toLowerCase().includes(q) || p.medications.join(" ").toLowerCase().includes(q)) &&
      (riskFilter === "All" || p.risk === riskFilter)
    );
  }, [usingLive, rows, search, riskFilter]);

  const counts = usingLive
    ? {
        total: rows.length,
        high: rows.filter((p) => p.risk === "High").length,
        medium: rows.filter((p) => p.risk === "Medium").length,
        low: rows.filter((p) => p.risk === "Low").length,
      }
    : {
        total: mockPatients.length,
        high: mockPatients.filter((p) => p.risk === "High").length,
        medium: mockPatients.filter((p) => p.risk === "Medium").length,
        low: mockPatients.filter((p) => p.risk === "Low").length,
      };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-xl"><Filter className="mr-2 h-4 w-4" />{riskFilter === "All" ? "Filters" : `Risk: ${riskFilter}`}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {(["All", "High", "Medium", "Low"] as const).map((r) => (
                <DropdownMenuItem key={r} onClick={() => setRiskFilter(r)}>{r} risk</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={() => {
              if (usingLive) downloadCsv(toCsv(filtered as PatientSummary[]), "patients.csv");
              toast.success("Exporting patient list to CSV...");
            }}
            className="rounded-xl bg-gradient-primary shadow-glow"
          >
            <Download className="mr-2 h-4 w-4" />Export
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { k: "Total", v: counts.total, c: "bg-primary/10 text-primary" },
          { k: "High risk", v: counts.high, c: "bg-destructive/10 text-destructive" },
          { k: "Medium risk", v: counts.medium, c: "bg-warning/10 text-warning" },
          { k: "Low risk", v: counts.low, c: "bg-success/10 text-success" },
        ].map((s) => (
          <Card key={s.k} className="p-4">
            <div className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${s.c}`}>{s.k}</div>
            <div className="mt-2 font-display text-3xl font-bold">{s.v}</div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Patients ({filtered.length} of {usingLive ? rows.length : mockPatients.length})</CardTitle>
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search patients…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 rounded-xl pl-9" />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr className="border-b border-border/60"><th className="p-3 text-left">Patient</th><th className="p-3 text-left">Medication</th>{isAdmin && <th className="p-3 text-left">Doctor</th>}<th className="p-3 text-left">Risk</th><th className="p-3 text-left">Adherence</th><th className="p-3 text-left">Last dose</th><th className="p-3 text-left">Status</th><th className="p-3" /></tr>
            </thead>
            <tbody>
              {usingLive ? (filtered as PatientSummary[]).map((p) => (
                <tr key={p.id} className="border-b border-border/40 last:border-0 hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-xs font-bold text-white">{p.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}</div>
                      <div><div className="font-semibold">{p.name}</div><div className="text-xs text-muted-foreground">Age {age(p.dob)}</div></div>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{p.medications.join(", ") || "—"}</td>
                  {isAdmin && <td className="p-3 text-muted-foreground">{p.doctor_id ? doctorsByUser[p.doctor_id] ?? "—" : "—"}</td>}
                  <td className="p-3"><Badge className={`rounded-full ${p.risk === "High" ? "bg-destructive/15 text-destructive" : p.risk === "Medium" ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>{p.risk}</Badge></td>
                  <td className="p-3"><div className="flex items-center gap-2"><Progress value={p.adherence} className="h-1.5 w-24" /><span className="text-xs font-semibold">{p.adherence}%</span></div></td>
                  <td className="p-3 text-muted-foreground">{p.last_dose ? new Date(p.last_dose).toLocaleDateString() : "—"}</td>
                  <td className="p-3"><Badge variant="outline" className="rounded-full">{p.status}</Badge></td>
                  <td className="p-3 text-right"><Button onClick={() => toast.info(`Opening file details for ${p.name}...`)} size="icon" variant="ghost" className="rounded-xl"><ChevronRight className="h-4 w-4" /></Button></td>
                </tr>
              )) : (filtered as typeof mockPatients).map((p) => (
                <tr key={p.name} className="border-b border-border/40 last:border-0 hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-xs font-bold text-white">{p.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}</div>
                      <div><div className="font-semibold">{p.name}</div><div className="text-xs text-muted-foreground">Age {p.age}</div></div>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{p.medication}</td>
                  {isAdmin && <td className="p-3 text-muted-foreground">{p.doctor}</td>}
                  <td className="p-3"><Badge className={`rounded-full ${p.risk === "High" ? "bg-destructive/15 text-destructive" : p.risk === "Medium" ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>{p.risk}</Badge></td>
                  <td className="p-3"><div className="flex items-center gap-2"><Progress value={p.adherence} className="h-1.5 w-24" /><span className="text-xs font-semibold">{p.adherence}%</span></div></td>
                  <td className="p-3 text-muted-foreground">{p.lastDose}</td>
                  <td className="p-3"><Badge variant="outline" className="rounded-full">{p.status}</Badge></td>
                  <td className="p-3 text-right"><Button onClick={() => toast.info(`Opening file details for ${p.name}...`)} size="icon" variant="ghost" className="rounded-xl"><ChevronRight className="h-4 w-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
