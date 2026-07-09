import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { medications as mockMedications } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Pause, Pencil, Pill, Utensils, Eye, Trash2, Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMedicines, createMedicine } from "@/lib/api";

export const Route = createFileRoute("/_app/medication")({ component: MedicationPage });

interface MedType {
  id: number;
  name: string;
  purpose: string;
  dosage: string;
  schedule: string;
  food: string;
  sideEffects: string[];
  warnings: string[];
  remaining: number;
  color: string;
}

function MedicationPage() {
  const [meds, setMeds] = useState<MedType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form fields
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [purpose, setPurpose] = useState("");
  const [schedule, setSchedule] = useState("8:00 AM");
  const [food, setFood] = useState("With meals");
  const [remaining, setRemaining] = useState(30);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getMedicines();
        if (data && data.length > 0) {
          const formatted: MedType[] = data.map((m: any) => ({
            id: m.id,
            name: m.medicine_name,
            purpose: m.instructions || m.frequency || "Prescription",
            dosage: m.dosage,
            schedule: m.schedule ? m.schedule.join(" · ") : "8:00 AM",
            food: "With meals",
            sideEffects: ["None reported"],
            warnings: [],
            remaining: m.remaining_pills,
            color: "from-blue-500 to-indigo-600"
          }));
          setMeds(formatted);
        } else {
          setMeds(mockMedications);
        }
      } catch (err) {
        console.warn("Could not load medicines from backend, falling back to mock data:", err);
        setMeds(mockMedications);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dosage) return;
    setSaving(true);
    try {
      const payload = {
        medicine_name: name,
        dosage: dosage,
        frequency: food,
        schedule: [schedule],
        instructions: purpose,
        remaining_pills: remaining,
        status: "active"
      };
      
      const res = await createMedicine(payload);
      const newMed: MedType = {
        id: res.id,
        name: res.medicine_name,
        purpose: res.instructions || "Prescription",
        dosage: res.dosage,
        schedule: res.schedule ? res.schedule.join(" · ") : schedule,
        food: food,
        sideEffects: ["None reported"],
        warnings: [],
        remaining: res.remaining_pills,
        color: "from-blue-500 to-indigo-600"
      };
      setMeds((prev) => [newMed, ...prev]);
      
      // Reset form
      setName("");
      setDosage("");
      setPurpose("");
      setSchedule("8:00 AM");
      setFood("With meals");
      setRemaining(30);
      setDialogOpen(false);
    } catch (err) {
      console.error("Error creating medicine:", err);
      // Fallback local creation
      const fallbackMed: MedType = {
        id: Date.now(),
        name,
        purpose,
        dosage,
        schedule,
        food,
        sideEffects: ["None"],
        warnings: [],
        remaining,
        color: "from-purple-500 to-fuchsia-600"
      };
      setMeds((prev) => [fallbackMed, ...prev]);
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    setMeds((prev) => prev.filter((m) => m.id !== id));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Medication</h1>
          <p className="text-sm text-muted-foreground">Your active prescriptions and schedule.</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" /> Add medication
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Medication</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="name">Medicine Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Metformin" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input id="dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g. 500mg" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remaining">Pill Count</Label>
                  <Input id="remaining" type="number" value={remaining} onChange={(e) => setRemaining(Number(e.target.value))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose / Instructions</Label>
                <Input id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Blood sugar control" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule Time</Label>
                  <Input id="schedule" value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="e.g. 8:00 AM" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="food">Food Instruction</Label>
                  <Input id="food" value={food} onChange={(e) => setFood(e.target.value)} placeholder="e.g. With meals" />
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Add Medication"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
        {meds.map((m) => (
          <Card key={m.id} className="overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${m.color || "from-blue-500 to-indigo-600"}`} />
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${m.color || "from-blue-500 to-indigo-600"} text-white shadow-lg`}>
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
                {m.sideEffects && m.sideEffects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-muted-foreground">Side effects:</span>
                    {m.sideEffects.map((s) => (
                      <span key={s} className="rounded-full bg-muted px-2 py-0.5">{s}</span>
                    ))}
                  </div>
                )}
                {m.warnings && m.warnings.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <AlertTriangle className="h-3 w-3 text-warning" />
                    <span className="text-muted-foreground">Interaction:</span>
                    {m.warnings.map((s) => (
                      <span key={s} className="rounded-full bg-warning/15 px-2 py-0.5 text-warning">{s}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2 items-center">
                <Button size="sm" variant="outline" className="rounded-lg"><Eye className="mr-1.5 h-3.5 w-3.5" />View</Button>
                <Button size="sm" variant="outline" className="rounded-lg"><Pencil className="mr-1.5 h-3.5 w-3.5" />Edit</Button>
                <Button size="sm" variant="outline" className="rounded-lg"><Pause className="mr-1.5 h-3.5 w-3.5" />Pause</Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(m.id)} className="rounded-lg text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
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
