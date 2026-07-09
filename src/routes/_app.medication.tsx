import { createFileRoute } from "@tanstack/react-router";
import { medications } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import {
  AlertTriangle,
  Clock,
  Pause,
  Pencil,
  Pill,
  Utensils,
  Eye,
  Search,
  Plus,
  Package,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/_app/medication")({ component: MedicationPage });

// Restrained per-medication accent — colour lives only in the small icon (no purple).
const MED_TONE: Record<number, { chip: string; dot: string }> = {
  1: { chip: "bg-primary/10 text-primary", dot: "bg-primary" },
  2: { chip: "bg-success/10 text-success", dot: "bg-success" },
  3: { chip: "bg-warning/10 text-warning", dot: "bg-warning" },
  4: { chip: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
};

const HISTORY = [
  { t: "Today · 8:02 AM", m: "Metformin 500mg", ok: true },
  { t: "Today · 9:00 AM", m: "Lisinopril 10mg", ok: true },
  { t: "Yesterday · 10:00 PM", m: "Atorvastatin 20mg", ok: false },
  { t: "Yesterday · 8:00 PM", m: "Metformin 500mg", ok: true },
  { t: "2d ago · 8:00 AM", m: "Metformin 500mg", ok: true },
  { t: "2d ago · 9:00 AM", m: "Lisinopril 10mg", ok: true },
];

function MedicationPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Medication" subtitle="Your active prescriptions and schedule" showMeta={false} />

      {/* Toolbar: Spotlight-style search + Apple primary button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
          <Input
            placeholder="Search medications..."
            className="h-11 rounded-xl border-border bg-white pl-10 text-[15px] shadow-none focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-card"
          />
        </div>
        <Button className="h-[44px] rounded-xl bg-primary px-5 text-[15px] font-medium shadow-none transition-colors hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" strokeWidth={2} /> Add medication
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {medications.map((m) => {
          const tone = MED_TONE[m.id] ?? MED_TONE[1];
          return (
            <Card
              key={m.id}
              className="border-border p-6 shadow-card"
            >
              <CardContent className="p-0">
                <div className="flex items-start gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone.chip}`}>
                    <Pill className="h-[22px] w-[22px]" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[18px] font-semibold tracking-tight">{m.name}</h3>
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[12px] font-medium text-muted-foreground">
                        {m.dosage}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[15px] text-muted-foreground">{m.purpose}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[12px] font-medium text-[#15803D]">Active</span>
                </div>

                <div className="mt-5 space-y-2.5 text-[14px]">
                  <InfoRow icon={Clock} text={m.schedule} />
                  <InfoRow icon={Utensils} text={m.food} />
                  <InfoRow icon={Package} text={`${m.remaining} pills remaining`} />
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-[13px] text-muted-foreground">Side effects</span>
                  {m.sideEffects.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-border bg-card px-2.5 py-0.5 text-[12px] text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {m.warnings.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 rounded-full bg-[#FFF7ED] px-2.5 py-0.5 text-[12px] font-medium text-[#B45309]"
                    >
                      <AlertTriangle className="h-3 w-3" strokeWidth={2} /> {s}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-2">
                  <Button className="h-9 rounded-lg bg-primary px-3.5 text-[13px] font-medium shadow-none hover:bg-primary/90">
                    <Eye className="mr-1.5 h-4 w-4" strokeWidth={2} />View
                  </Button>
                  <Button
                    variant="outline"
                    className="h-9 rounded-lg border-border bg-card px-3.5 text-[13px] font-medium shadow-none hover:bg-foreground/[0.04]"
                  >
                    <Pencil className="mr-1.5 h-4 w-4" strokeWidth={2} />Edit
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-9 rounded-lg px-3.5 text-[13px] font-medium text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
                  >
                    <Pause className="mr-1.5 h-4 w-4" strokeWidth={2} />Pause
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* History — Apple Health style compact list */}
      <div>
        <h2 className="text-[22px] font-semibold tracking-tight">History</h2>
        <Card className="border-border shadow-card">
          <div className="divide-y divide-border">
            {HISTORY.map((h, i) => (
              <div key={i} className="flex items-center gap-3.5 px-4 py-3.5">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    h.ok ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {h.ok ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : <span className="h-1.5 w-1.5 rounded-full bg-destructive" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-medium">{h.m}</div>
                  <div className="text-[13px] text-muted-foreground">{h.t}</div>
                </div>
                {h.ok ? (
                  <span className="rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[12px] font-medium text-[#15803D]">Taken</span>
                ) : (
                  <span className="text-[13px] font-medium text-destructive">Missed</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, text }: { icon: typeof Clock; text: string }) {
  return (
    <div className="flex items-center gap-2.5 text-muted-foreground">
      <Icon className="h-[18px] w-[18px] shrink-0 text-foreground/50" strokeWidth={2} />
      <span className="text-foreground/80">{text}</span>
    </div>
  );
}
