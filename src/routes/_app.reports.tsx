import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ArrowRight, Download, FileText, Share2, TrendingUp, Calendar } from "lucide-react";
import { monthlyAdherence, reminderPie, weeklyAdherence } from "@/lib/mock-data";
import { CHART, CHART_SERIES, axisProps, tooltipStyle } from "@/lib/chart-colors";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart } from "recharts";

export const Route = createFileRoute("/_app/reports")({ component: Reports });

const REPORTS = [
  { icon: Calendar, title: "Daily Report", range: "Jul 9, 2026", tone: "bg-primary/10 text-primary" },
  { icon: TrendingUp, title: "Weekly Report", range: "Jul 6–12", tone: "bg-success/10 text-success" },
  { icon: FileText, title: "Monthly Report", range: "July 2026", tone: "bg-warning/10 text-warning" },
];

const pieData = reminderPie.map((e, i) => ({ ...e, color: CHART_SERIES[i % CHART_SERIES.length] }));

function Reports() {
  return (
    <div className="space-y-8">
      <PageHeader title="Reports" subtitle="Professional medication insights" />

      <div className="grid gap-5 md:grid-cols-3">
        {REPORTS.map((r) => (
          <Card key={r.title} className="border-border shadow-card">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${r.tone}`}>
                  <r.icon className="h-[22px] w-[22px]" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[18px] font-semibold tracking-tight">{r.title}</h3>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">Generated</p>
                  <p className="text-[15px] font-medium">{r.range}</p>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2">
                <Button variant="ghost" className="h-9 rounded-lg px-3 text-[13px] font-medium text-primary">
                  View <ArrowRight className="ml-1 h-4 w-4" strokeWidth={2} />
                </Button>
                <Button variant="outline" className="h-9 rounded-lg px-3 text-[13px]">
                  <Download className="mr-1.5 h-[18px] w-[18px]" strokeWidth={2} />Download
                </Button>
                <Button variant="ghost" className="h-9 rounded-lg px-3 text-[13px] text-muted-foreground">
                  <Share2 className="mr-1.5 h-[18px] w-[18px]" strokeWidth={2} />Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        {[
          { l: "Adherence %", v: "94%" },
          { l: "Delay avg", v: "12 min" },
          { l: "Medicine usage", v: "142 pills" },
          { l: "Risk score", v: "24/100" },
        ].map((s) => (
          <Card key={s.l} className="rounded-2xl border-border shadow-card">
            <CardContent className="p-6">
              <div className="text-[13px] text-muted-foreground">{s.l}</div>
              <div className="mt-2 text-[28px] font-bold tabular-nums tracking-tight">{s.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Adherence trend">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={weeklyAdherence}>
              <defs>
                <linearGradient id="r1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART.blue} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={CHART.blue} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={CHART.grid} />
              <XAxis dataKey="day" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area dataKey="adherence" stroke={CHART.blue} strokeWidth={2} fill="url(#r1)" isAnimationActive />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Delay analysis">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={weeklyAdherence.map((w, i) => ({ ...w, delay: 8 + Math.round(Math.abs(Math.sin(i)) * 15) }))}>
              <CartesianGrid vertical={false} stroke={CHART.grid} />
              <XAxis dataKey="day" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line dataKey="delay" stroke={CHART.amber} strokeWidth={2} dot={{ r: 3, fill: CHART.amber }} isAnimationActive />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Medicine usage">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyAdherence.slice(0, 6)}>
              <CartesianGrid vertical={false} stroke={CHART.grid} />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="taken" fill={CHART.green} radius={[6, 6, 0, 0]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Reminder channels">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} innerRadius={50} outerRadius={90} dataKey="value" paddingAngle={4} isAnimationActive>
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Empty state example — hidden when reports exist */}
      <div className="hidden">
        <EmptyState icon={FileText} title="No reports yet" description="Generate your first adherence report to track your progress." actionLabel="Generate report" />
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="rounded-2xl border-border shadow-card">
      <CardHeader><CardTitle className="text-[18px] font-semibold">{title}</CardTitle></CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
