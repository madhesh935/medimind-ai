import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Camera, ScanLine, Sparkles, Upload } from "lucide-react";

export const Route = createFileRoute("/_app/scanner")({ component: Scanner });

function Scanner() {
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
              <ScanLine className="h-10 w-10" />
            </div>
            <div>
              <div className="font-display text-xl font-bold">Drag & drop prescription</div>
              <div className="text-sm text-muted-foreground">JPG, PNG, PDF — up to 20MB</div>
            </div>
            <div className="flex gap-2">
              <Button className="rounded-xl bg-gradient-primary"><Upload className="mr-1.5 h-4 w-4" />Upload file</Button>
              <Button variant="outline" className="rounded-xl"><Camera className="mr-1.5 h-4 w-4" />Camera capture</Button>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2 text-xs">
              {["JPEG","PNG","PDF"].map(x=><Badge key={x} variant="outline" className="rounded-full">{x}</Badge>)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" />OCR extraction preview</CardTitle>
            <Badge className="rounded-full bg-success/15 text-success">98% confidence</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Doctor name" value="Dr. Priya Patel" />
              <Field label="Hospital" value="Apollo Clinic" />
              <Field label="Medicine name" value="Metformin" />
              <Field label="Dose" value="500mg" />
              <Field label="Frequency" value="2× daily" />
              <Field label="Duration" value="90 days" />
            </div>
            <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
              Detected 3 medications. Review and confirm before saving to your schedule.
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="rounded-xl">Cancel</Button>
              <Button className="rounded-xl bg-gradient-primary">Save schedule</Button>
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
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input defaultValue={value} className="mt-1 h-10 rounded-xl" />
    </div>
  );
}
