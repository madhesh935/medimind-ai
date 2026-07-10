import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMedicines, updateMedicine, type Medicine, MOCK_MEDICINES } from "@/lib/api";
import { inventory as mockInventory } from "@/lib/mock-data";
import { chartColors } from "@/lib/chart-colors";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MapPin, Truck, Download, Clock, Pill } from "lucide-react";

import { toast } from "sonner";

export const Route = createFileRoute("/_app/refill")({ component: Refill });

const CAPACITY = 30; // Medicine has no capacity/total field — 30-pill bottles are the assumed standard fill.

function dosesPerDay(frequency: string): number {
  const f = frequency.toLowerCase();
  if (f.includes("three") || f.includes("thrice")) return 3;
  if (f.includes("twice") || f.includes("two")) return 2;
  if (f.includes("four")) return 4;
  return 1;
}

const CapsuleProgress = ({ pct }: { pct: number }) => {
  return (
    <div className="relative w-[64px] h-[110px] flex flex-col items-center">
      <div className="w-[48px] h-[16px] bg-[#dbeafe] border border-[#bfdbfe] border-b-0 rounded-t-xl flex flex-col justify-between overflow-hidden shrink-0">
        <div className="w-full h-1 bg-[#3b82f6] opacity-80" />
        <div className="w-full h-2 bg-[#dbeafe]" />
      </div>
      <div className="relative w-[48px] h-[84px] border border-slate-200 border-t-0 rounded-b-xl bg-slate-50 overflow-hidden flex flex-col justify-end shadow-sm">
        <div
          className="w-full bg-gradient-to-t from-[#2563eb] to-[#3b82f6] transition-all duration-500 ease-out"
          style={{ height: `${pct}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`p-1.5 rounded-full transition-all duration-300 ${pct >= 50 ? 'text-white' : 'text-[#2563eb] bg-white shadow-xs'}`}>
            <Pill className="h-[18px] w-[18px] stroke-[2.5]" />
          </div>
        </div>
      </div>
    </div>
  );
};

function Refill() {
  const [medicines, setMedicines] = useState<Medicine[] | null>(MOCK_MEDICINES);
  const [pending, setPending] = useState<Set<number>>(new Set());

  useEffect(() => {
    getMedicines()
      .then((meds) => { if (meds.length) setMedicines(meds); })
      .catch((err) => console.warn("Using instant mock data:", err));
  }, []);

  const rows = medicines ?? null;

  async function toggleAutoRefill(id: number, checked: boolean) {
    setPending((p) => new Set(p).add(id));
    try {
      const updated = await updateMedicine(id, { auto_refill: checked });
      setMedicines((prev) => (prev ? prev.map((m) => (m.id === id ? updated : m)) : prev));
      toast.success(`Auto-refill ${checked ? "enabled" : "disabled"}`);
    } catch {
      toast.error("Couldn't update auto-refill — try again.");
    } finally {
      setPending((p) => {
        const next = new Set(p);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold">Refill Center</h1>
          <p className="text-sm text-muted-foreground">Keep your medications stocked — automatic delivery available.</p>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 border border-border/40 px-3 py-1 text-xs text-muted-foreground font-medium shadow-xs">
            <Clock className="h-3.5 w-3.5" />
            Live inventory
          </div>
        </div>
        <Button onClick={() => toast.success("Refill data exported successfully!")} variant="outline" className="rounded-xl h-10 px-4 text-sm font-semibold flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {rows ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {rows.map((m) => {
            const pct = Math.min(100, (m.remaining_pills / CAPACITY) * 100);
            const refillDays = Math.max(1, Math.round(m.remaining_pills / dosesPerDay(m.frequency)));
            return (
              <Card key={m.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4 pt-8">
                  <CapsuleProgress pct={pct} />
                  <div className="space-y-1">
                    <div className="text-3xl font-extrabold tracking-tight text-foreground">{m.remaining_pills}</div>
                    <div className="text-xs text-muted-foreground font-semibold">Pills Left</div>
                    <div className="text-sm font-bold text-foreground mt-1">{m.medicine_name}</div>
                  </div>
                  <div className="w-full pt-1">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Refill in</div>
                    <div className="text-lg font-extrabold text-foreground mt-0.5">{refillDays} Days</div>
                  </div>
                  <div className="w-full border border-border/40 bg-muted/10 rounded-xl p-3 flex items-center justify-between text-xs font-bold">
                    <span className="text-muted-foreground">Auto refill</span>
                    <Switch
                      checked={m.auto_refill ?? false}
                      disabled={pending.has(m.id)}
                      onCheckedChange={(checked) => toggleAutoRefill(m.id, checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="grid min-h-[200px] place-items-center rounded-2xl border-border/60 p-10 text-center text-sm text-muted-foreground">
          No medications on file yet — add one from the Medication page to see it here.
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader><CardTitle>Inventory over time</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={(rows ?? mockInventory).map((m) => {
                const remaining = "remaining_pills" in m ? m.remaining_pills : m.remaining;
                const name = "medicine_name" in m ? m.medicine_name : m.name;
                return { name, remaining, used: Math.max(0, CAPACITY - remaining) };
              })}>
                <CartesianGrid strokeDasharray="3 3" opacity={.2} />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
                <Bar dataKey="remaining" stackId="i" fill={chartColors.primary} radius={[6,6,0,0]} />
                <Bar dataKey="used" stackId="i" fill={chartColors.muted} radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-4 w-4" />Nearby pharmacies</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { n: "Walgreens", d: "0.4 mi", t: "In stock" },
              { n: "CVS Pharmacy", d: "0.9 mi", t: "In stock" },
              { n: "Apollo Pharmacy", d: "1.2 mi", t: "Limited" },
            ].map((p) => (
              <div key={p.n} className="flex items-center justify-between rounded-xl border border-border/60 p-3">
                <div>
                  <div className="text-sm font-semibold">{p.n}</div>
                  <div className="text-xs text-muted-foreground">{p.d}</div>
                </div>
                <Badge className="rounded-full bg-success/15 text-success">{p.t}</Badge>
              </div>
            ))}
            <Button onClick={() => toast.success("Refill delivery request dispatched successfully!")} className="w-full rounded-xl bg-gradient-primary h-11"><Truck className="mr-1.5 h-4 w-4" />Request delivery</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
