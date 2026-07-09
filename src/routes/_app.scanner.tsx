import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Camera, Loader2, ScanLine, Sparkles, Upload } from "lucide-react";

import { toast } from "sonner";
import { scanPrescription, createMedicine, type ScannedPrescription } from "@/lib/api";

export const Route = createFileRoute("/_app/scanner")({ component: Scanner });

function Scanner() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<ScannedPrescription | null>(null);

  async function handleFile(file: File) {
    setScanning(true);
    setResult(null);
    try {
      const extracted = await scanPrescription(file);
      setResult(extracted);
      if (extracted.confidence === 0) {
        toast.warning("Couldn't read this prescription clearly — review the fields below before saving.");
      } else {
        toast.success("Prescription scanned — review and confirm the fields below.");
      }
    } catch {
      toast.error("Scan failed — check your connection and try again.");
    } finally {
      setScanning(false);
    }
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    try {
      await createMedicine({
        medicine_name: result.medicine_name || "Unnamed medication",
        dosage: result.dosage || "",
        frequency: result.frequency || "Once a day",
        schedule: [],
        instructions: result.duration ? `Duration: ${result.duration}` : undefined,
        remaining_pills: 0,
      });
      toast.success("Saved to your medication schedule.");
      setResult(null);
    } catch {
      toast.error("Couldn't save this medication — try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Prescription Scanner</h1>
        <p className="text-sm text-muted-foreground">Snap or upload — our AI extracts every medication automatically.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="border-dashed border-2 border-primary/40 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="flex flex-col items-center justify-center gap-4 p-10 text-center min-h-[420px]">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-primary text-white shadow-glow">
              {scanning ? <Loader2 className="h-10 w-10 animate-spin" /> : <ScanLine className="h-10 w-10" />}
            </div>
            <div>
              <div className="font-display text-xl font-bold">{scanning ? "Analyzing prescription…" : "Drag & drop prescription"}</div>
              <div className="text-sm text-muted-foreground">JPG or PNG — up to 20MB</div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
            <div className="flex gap-2">
              <Button onClick={() => fileInputRef.current?.click()} disabled={scanning} className="rounded-xl bg-gradient-primary"><Upload className="mr-1.5 h-4 w-4" />Upload file</Button>
              <Button onClick={() => fileInputRef.current?.click()} disabled={scanning} variant="outline" className="rounded-xl"><Camera className="mr-1.5 h-4 w-4" />Camera capture</Button>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
              {["JPEG", "PNG"].map((x) => <Badge key={x} variant="outline" className="rounded-full">{x}</Badge>)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" />OCR extraction preview</CardTitle>
            {result && (
              <Badge className={`rounded-full ${result.confidence >= 60 ? "bg-success/15 text-success" : result.confidence > 0 ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"}`}>
                {result.confidence}% confidence
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {!result ? (
              <div className="grid min-h-[280px] place-items-center text-center text-sm text-muted-foreground">
                Upload or capture a prescription to see extracted fields here.
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Doctor name" value={result.doctor_name} onChange={(v) => setResult({ ...result, doctor_name: v })} />
                  <Field label="Hospital" value={result.hospital} onChange={(v) => setResult({ ...result, hospital: v })} />
                  <Field label="Medicine name" value={result.medicine_name} onChange={(v) => setResult({ ...result, medicine_name: v })} />
                  <Field label="Dose" value={result.dosage} onChange={(v) => setResult({ ...result, dosage: v })} />
                  <Field label="Frequency" value={result.frequency} onChange={(v) => setResult({ ...result, frequency: v })} />
                  <Field label="Duration" value={result.duration} onChange={(v) => setResult({ ...result, duration: v })} />
                </div>
                <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
                  {result.confidence === 0
                    ? "Extraction was low-confidence — please fill in or correct the fields above before saving."
                    : "Review the extracted fields, then confirm before saving to your schedule."}
                </div>
                <div className="flex justify-end gap-2">
                  <Button onClick={() => setResult(null)} variant="outline" className="rounded-xl">Cancel</Button>
                  <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-gradient-primary">
                    {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}Save schedule
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 h-10 rounded-xl" />
    </div>
  );
}
