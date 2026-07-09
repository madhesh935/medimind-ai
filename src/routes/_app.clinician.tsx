import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { patients } from "@/lib/mock-data";
import { Search, Filter, Eye } from "lucide-react";

export const Route = createFileRoute("/_app/clinician")({ component: Clinician });

const riskColor: Record<string, string> = {
  High: "bg-destructive/15 text-destructive",
  Medium: "bg-warning/15 text-warning",
  Low: "bg-success/15 text-success",
};

function Clinician() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Clinician Dashboard</h1>
        <p className="text-sm text-muted-foreground">Monitor your patient roster and intervene early.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { l: "Total patients", v: 128, tone: "text-primary" },
          { l: "High risk", v: 12, tone: "text-destructive" },
          { l: "On track today", v: 96, tone: "text-success" },
          { l: "Interventions", v: 4, tone: "text-accent" },
        ].map((s) => (
          <Card key={s.l}><CardContent className="p-5">
            <div className="text-xs text-muted-foreground">{s.l}</div>
            <div className={`mt-1 font-display text-3xl font-bold ${s.tone}`}>{s.v}</div>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>Patient roster</CardTitle>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search patient…" className="h-9 w-64 rounded-xl pl-9" />
              </div>
              <Button variant="outline" size="sm" className="rounded-xl"><Filter className="mr-1.5 h-3.5 w-3.5" />High</Button>
              <Button variant="outline" size="sm" className="rounded-xl">Medium</Button>
              <Button variant="outline" size="sm" className="rounded-xl">Low</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Today</TableHead>
                <TableHead>Last dose</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((p) => (
                <TableRow key={p.name}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9"><AvatarFallback className="bg-gradient-primary text-white text-xs">{p.name.split(" ").map(n=>n[0]).join("")}</AvatarFallback></Avatar>
                      <div className="font-semibold">{p.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>{p.age}</TableCell>
                  <TableCell className="text-muted-foreground">{p.disease}</TableCell>
                  <TableCell><Badge className={`rounded-full ${riskColor[p.risk]}`}>{p.risk}</Badge></TableCell>
                  <TableCell>{p.status}</TableCell>
                  <TableCell className="text-muted-foreground">{p.lastDose}</TableCell>
                  <TableCell><Button size="sm" variant="outline" className="rounded-lg"><Eye className="mr-1 h-3.5 w-3.5" />View</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-base">Prescription</CardTitle></CardHeader><CardContent className="text-sm space-y-2">
          <div className="flex justify-between"><span className="text-muted-foreground">Metformin</span><span>500mg · 2×/day</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Lisinopril</span><span>10mg · 1×/day</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Atorvastatin</span><span>20mg · 1×/night</span></div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">AI recommendation</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
          <div className="rounded-xl bg-accent/10 p-3 text-accent">Consider evening dose reminder change.</div>
          <div className="rounded-xl bg-primary/10 p-3 text-primary">Add caregiver alert for weekend adherence.</div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Doctor notes</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">
          "Patient responding well to reduced Metformin dosage. Continue current plan and re-evaluate in 2 weeks." — Dr. Patel
        </CardContent></Card>
      </div>
    </div>
  );
}
