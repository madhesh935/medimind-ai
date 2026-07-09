import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { inventory, medications } from "@/lib/mock-data";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MapPin, Truck } from "lucide-react";

export const Route = createFileRoute("/_app/refill")({ component: Refill });

function Refill() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Refill Center</h1>
        <p className="text-sm text-muted-foreground">Keep your medications stocked — automatic delivery available.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {inventory.map((m, i) => {
          const pct = (m.remaining / m.total) * 100;
          const grad = medications[i]?.color ?? "from-primary to-accent";
          return (
            <Card key={m.name}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{m.name}</div>
                  <Badge variant="outline" className="rounded-full text-xs">{m.remaining}/{m.total}</Badge>
                </div>
                {/* progress ring */}
                <div className="mt-4 flex items-center justify-center">
                  <div className="relative h-28 w-28">
                    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                      <circle cx="50" cy="50" r="42" strokeWidth="10" className="fill-none stroke-muted" />
                      <circle
                        cx="50" cy="50" r="42" strokeWidth="10" strokeLinecap="round"
                        className={`fill-none stroke-current bg-gradient-to-r ${grad}`}
                        style={{ color: `hsl(220 90% 55%)` }}
                        strokeDasharray={`${(pct / 100) * 264} 264`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="font-display text-2xl font-bold">{Math.round(pct)}%</div>
                      <div className="text-[10px] text-muted-foreground">stocked</div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center text-xs text-muted-foreground">Refill by {m.refillDate}</div>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/40 p-3 text-xs">
                  <span>Auto refill</span>
                  <Switch defaultChecked={i % 2 === 0} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader><CardTitle>Inventory over time</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={inventory.map(m=>({ name: m.name, remaining: m.remaining, used: m.total - m.remaining }))}>
                <CartesianGrid strokeDasharray="3 3" opacity={.2} />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
                <Bar dataKey="remaining" stackId="i" fill="hsl(220 90% 55%)" radius={[6,6,0,0]} />
                <Bar dataKey="used" stackId="i" fill="hsl(0 0% 80%)" radius={[6,6,0,0]} />
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
            <Button className="w-full rounded-xl bg-gradient-primary"><Truck className="mr-1.5 h-4 w-4" />Request delivery</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
