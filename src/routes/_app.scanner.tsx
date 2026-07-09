import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { ProgressRing } from "@/components/progress-ring";
import { Camera, FileText, Pill, Calendar, Sparkles, Upload, ArrowDown } from "lucide-react";

export const Route = createFileRoute("/_app/scanner")({ component: Scanner });

const FLOW = [
  { icon: FileText, label: "Prescription" },
  { icon: Sparkles, label: "AI OCR" },
  { icon: Pill, label: "Medication" },
  { icon: Calendar, label: "Schedule" },
];

function Scanner() {
  return (
    <div className="space-y-8">
      <PageHeader title="Prescription Scanner" subtitle="Snap or upload — AI extracts every medication automatically" />

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card className="rounded-2xl border-border shadow-card">
          <CardContent className="p-8">
            {/* Flow illustration */}
            <div className="flex items-center justify-center gap-2 py-6">
              {FLOW.map((step, i) => (
                <div key={step.label} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                      <step.icon className="h-[22px] w-[22px] text-primary" strokeWidth={2} />
                    </div>
                    <span className="text-[13px] font-medium">{step.label}</span>
                  </div>
                  {i < FLOW.length - 1 && <ArrowDown className="mx-1 h-4 w-4 rotate-[-90deg] text-muted-foreground" strokeWidth={2} />}
                </div>
              ))}
            </div>

            {/* Upload zone with scan animation */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-border bg-secondary/30 p-10 text-center">
              <div className="absolute inset-x-0 h-0.5 animate-scan-line bg-primary/40" />
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Upload className="h-[22px] w-[22px] text-primary" strokeWidth={2} />
              </div>
              <div className="mt-4 text-[18px] font-semibold">Drag & drop prescription</div>
              <div className="mt-1 text-[15px] text-muted-foreground">JPG, PNG, PDF — up to 20MB</div>
              <div className="mt-6 flex justify-center gap-3">
                <Button className="h-10 rounded-xl shadow-none"><Upload className="mr-2 h-[18px] w-[18px]" strokeWidth={2} />Upload file</Button>
                <Button variant="outline" className="h-10 rounded-xl shadow-none"><Camera className="mr-2 h-[18px] w-[18px]" strokeWidth={2} />Camera</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[18px] font-semibold">OCR extraction preview</CardTitle>
            <div className="flex items-center gap-2">
              <ProgressRing value={98} size={48} stroke={4} color="#22C55E">
                <span className="text-[11px] font-bold">98%</span>
              </ProgressRing>
              <span className="text-[13px] text-muted-foreground">confidence</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Doctor name" value="Dr. Priya Patel" />
              <Field label="Hospital" value="Apollo Clinic" />
              <Field label="Medicine name" value="Metformin" />
              <Field label="Dose" value="500mg" />
              <Field label="Frequency" value="2× daily" />
              <Field label="Duration" value="90 days" />
            </div>
            <div className="rounded-xl bg-secondary/50 p-4 text-[13px] text-muted-foreground">
              Detected 3 medications. Review and confirm before saving to your schedule.
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="rounded-xl shadow-none">Cancel</Button>
              <Button className="rounded-xl shadow-none">Save schedule</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="text-[13px] text-muted-foreground">{label}</Label>
      <Input defaultValue={value} className="mt-1.5 h-11 rounded-xl text-[15px]" />
    </div>
  );
}
