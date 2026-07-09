import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { PillBottleVisual } from "@/components/health-widgets";
import { inventory } from "@/lib/mock-data";
import { CHART, axisProps, tooltipStyle } from "@/lib/chart-colors";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MapPin, Truck } from "lucide-react";

export const Route = createFileRoute("/_app/refill")({ component: Refill });

const PHARMACIES = [
  { name: "CVS", color: "bg-red-600", letter: "CV", distance: "0.4 mi", stock: "In stock" },
  { name: "Walgreens", color: "bg-red-500", letter: "W", distance: "0.9 mi", stock: "In stock" },
  { name: "Apollo", color: "bg-blue-600", letter: "A", distance: "1.2 mi", stock: "Limited" },
  { name: "HealthPlus", color: "bg-emerald-600", letter: "H+", distance: "1.8 mi", stock: "In stock" },
];

function daysUntil(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.max(0, Math.ceil((d.getTime() - now.getTime()) / 86400000));
}

function Refill() {
  return (
    <div className="space-y-8">
      <PageHeader title="Refill Center" subtitle="Keep your medications stocked — automatic delivery available" />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {inventory.map((m, i) => {
          const days = daysUntil(m.refillDate) || 5 + i;
          return (
            <Card key={m.name} className="border-border shadow-card">
              <CardContent className="p-6">
                <PillBottleVisual remaining={m.remaining} total={m.total} name={m.name} />
                <div className="mt-4 space-y-1 text-center">
                  <div className="text-[13px] text-muted-foreground">Refill in</div>
                  <div className="text-[22px] font-bold tabular-nums">{days} Days</div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl border border-border px-4 py-3 text-[13px]">
                  <span className="font-medium">Auto refill</span>
                  <Switch defaultChecked={i % 2 === 0} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <Card className="rounded-2xl border-border shadow-card">
          <CardHeader><CardTitle className="text-[18px] font-semibold">Inventory over time</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={inventory.map((m) => ({ name: m.name.split(" ")[0], remaining: m.remaining, used: m.total - m.remaining }))}>
                <CartesianGrid vertical={false} stroke={CHART.grid} />
                <XAxis dataKey="name" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="remaining" stackId="i" fill={CHART.blue} radius={[6, 6, 0, 0]} isAnimationActive />
                <Bar dataKey="used" stackId="i" fill={CHART.gray} radius={[6, 6, 0, 0]} isAnimationActive />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[18px] font-semibold">
              <MapPin className="h-[22px] w-[22px] text-primary" strokeWidth={2} />
              Nearby pharmacies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {PHARMACIES.map((p) => (
              <div key={p.name} className="flex items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-foreground/[0.02]">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${p.color} text-[13px] font-bold text-white`}>
                  {p.letter}
                </div>
                <div className="flex-1">
                  <div className="text-[15px] font-semibold">{p.name}</div>
                  <div className="text-[13px] text-muted-foreground">{p.distance}</div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${p.stock === "In stock" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                  {p.stock}
                </span>
              </div>
            ))}
            <Button className="mt-2 h-11 w-full rounded-xl shadow-none">
              <Truck className="mr-2 h-[18px] w-[18px]" strokeWidth={2} />Request delivery
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
