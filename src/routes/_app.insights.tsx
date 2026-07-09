import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingDown, Activity, Bell, Lightbulb, AlertCircle } from "lucide-react";
import { behaviorHeatmap, riskPrediction } from "@/lib/mock-data";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_app/insights")({ component: Insights });

function Insights() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold flex items-center gap-2">
          <Brain className="h-8 w-8 text-accent" /> AI Insights
        </h1>
        <p className="text-sm text-muted-foreground">Predictive models trained on your last 90 days of behavior.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { i: TrendingDown, label: "Adherence prediction", value: "91%", hint: "Next 7 days", tone: "success" },
          { i: AlertCircle, label: "Current risk", value: "Low", hint: "Score 24/100", tone: "primary" },
          { i: Activity, label: "Behavior pattern", value: "Stable", hint: "Consistency ↑", tone: "accent" },
          { i: Bell, label: "Reminder effectiveness", value: "87%", hint: "Voice > Push", tone: "warning" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
                <s.i className="h-4 w-4 text-accent" />
              </div>
              <div className="mt-2 font-display text-3xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.hint}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Prediction timeline</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={riskPrediction}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
                <Line dataKey="risk" stroke="hsl(280 75% 55%)" strokeWidth={3} dot={false} />
                <Line dataKey="predicted" stroke="hsl(220 90% 55%)" strokeDasharray="4 4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-accent/40 bg-gradient-to-br from-accent/10 via-card to-primary/10">
          <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-accent" />AI Recommendation</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-2xl bg-card/70 p-4 backdrop-blur">
              <div className="text-xs font-semibold text-accent">Personalized</div>
              <div className="mt-1 font-medium">Send reminder 15 minutes earlier tonight — you tend to miss the 10 PM dose on Fridays.</div>
            </div>
            <div className="rounded-2xl bg-card/70 p-4 backdrop-blur">
              <div className="text-xs font-semibold text-primary">Voice preferred</div>
              <div className="mt-1 font-medium">Switch to voice reminders — 32% higher response rate for you.</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Behavior heatmap</CardTitle>
          <Badge variant="outline" className="rounded-full">7d × 24h</Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="ml-8 mb-1 flex text-[10px] text-muted-foreground">
                {Array.from({ length: 24 }).map((_, h) => (
                  <div key={h} className="w-6 text-center">{h}</div>
                ))}
              </div>
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, r) => (
                <div key={d} className="flex items-center gap-1">
                  <div className="w-8 text-xs text-muted-foreground">{d}</div>
                  {behaviorHeatmap.filter((c) => c.day === r).map((c) => (
                    <div
                      key={c.hour}
                      className="h-6 w-5 rounded"
                      title={`${c.value}%`}
                      style={{ background: `hsl(220 90% 55% / ${Math.min(1, c.value / 90)})` }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Explainable AI — Why am I high risk?</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {[
            { title: "Missed 3 evening medicines", weight: 42, tone: "bg-destructive" },
            { title: "Weekend adherence dropped 12%", weight: 30, tone: "bg-warning" },
            { title: "Ignored 5 push notifications", weight: 18, tone: "bg-accent" },
          ].map((r) => (
            <div key={r.title} className="rounded-2xl border border-border/60 p-4">
              <div className="text-sm font-semibold">{r.title}</div>
              <Progress value={r.weight * 2} className="mt-3" />
              <div className="mt-1 text-xs text-muted-foreground">Weight: {r.weight}%</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
