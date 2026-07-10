import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FileText, Search, Sparkles, CheckCircle2 } from "lucide-react";
import { getPatientsList, getAIPrediction, applyAIRecommendation, type PatientSummary, type AIRecommendation, MOCK_PATIENTS } from "@/lib/api";

import { toast } from "sonner";

export const Route = createFileRoute("/_app/prescriptions")({ component: Prescriptions });

type Suggestion = AIRecommendation & { patientName: string };

function Prescriptions() {
  const [search, setSearch] = useState("");
  const [live, setLive] = useState<PatientSummary[]>(MOCK_PATIENTS);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);

  useEffect(() => {
    getPatientsList().then(setLive).catch((err) => console.warn("Using instant mock data:", err));
  }, []);

  useEffect(() => {
    if (live.length === 0) return;
    Promise.all(
      live.slice(0, 6).map((p) =>
        getAIPrediction(p.user_id)
          .then((res) => res.details.map((d) => ({ ...d, patientName: p.name })))
          .catch(() => [] as Suggestion[])
      )
    ).then((lists) => setSuggestions(lists.flat().filter((s) => !s.applied).slice(0, 4)));
  }, [live]);

  const prescriptions = live.filter((p) => p.medications.length > 0).map((p) => ({
    name: p.name,
    disease: p.risk === "High" ? "High risk" : p.status,
    medicine: p.medications[0],
    dosage: "500mg", // Hardcoded mock display since PatientSummary doesn't have dosages
    refills: p.medications.length,
    date: p.last_dose ? new Date(p.last_dose).toLocaleDateString() : "—",
  }));

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const q = search.toLowerCase();
    return rx.name.toLowerCase().includes(q) || rx.medicine.toLowerCase().includes(q) || rx.disease.toLowerCase().includes(q);
  });

  async function handleAccept(id: number) {
    try {
      await applyAIRecommendation(id);
      setSuggestions((prev) => prev?.filter((s) => s.id !== id) ?? prev);
      toast.success("AI recommendation applied.");
    } catch {
      toast.error("Couldn't apply recommendation — try again.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Prescriptions</h1>
          <p className="text-sm text-muted-foreground">Issue, review and manage every active prescription in your care.</p>
        </div>
        <Button onClick={() => toast.info("Opening new prescription sheet...")} className="rounded-xl bg-gradient-primary shadow-glow"><Plus className="mr-2 h-4 w-4" />New prescription</Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent prescriptions</CardTitle>
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 rounded-xl pl-9" />
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-2">
          {filteredPrescriptions.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground lg:col-span-2">No prescriptions found.</p>
          )}
          {filteredPrescriptions.map((rx) => (
            <div key={rx.name + rx.medicine} className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-sm font-bold text-white">
                {rx.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 truncate font-semibold">{rx.name} <Badge variant="outline" className="rounded-full text-[10px]">{rx.disease}</Badge></div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="h-3 w-3" /> {rx.medicine}{rx.dosage ? ` · ${rx.dosage}` : ""} · {rx.refills} active med{rx.refills === 1 ? "" : "s"}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground/80">Last dose {rx.date}</div>
              </div>
              <Button onClick={() => toast.success(`Prescription renewal request submitted for ${rx.name}!`)} size="sm" variant="outline" className="rounded-xl">Renew</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>AI-suggested changes</CardTitle>
          <Badge className="rounded-full bg-gradient-ai text-white border-0"><Sparkles className="mr-1 h-3 w-3" />AI</Badge>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {suggestions === null && (
            <p className="py-6 text-center text-sm text-muted-foreground sm:col-span-2">Loading AI recommendations…</p>
          )}
          {suggestions !== null && suggestions.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground sm:col-span-2">
              No pending AI recommendations. Recalculate a patient's risk from Reports to generate one.
            </p>
          )}
          {suggestions?.map((s) => (
            <div key={s.id} className="rounded-2xl border border-border/60 bg-muted/30 p-4">
              <div className="text-sm font-semibold">{s.patientName}</div>
              <div className="mt-1 text-sm text-primary">{s.text}</div>
              <div className="mt-2 flex gap-2">
                <Button onClick={() => handleAccept(s.id)} size="sm" className="rounded-xl bg-gradient-primary gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />Accept
                </Button>
                <Button onClick={() => toast.info(`Reviewing recommendation for ${s.patientName}...`)} size="sm" variant="outline" className="rounded-xl">Review</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
