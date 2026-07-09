import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Printer, Sheet, TrendingUp, Calendar } from "lucide-react";
import { monthlyAdherence, reminderPie, weeklyAdherence } from "@/lib/mock-data";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart } from "recharts";

import { toast } from "sonner";

export const Route = createFileRoute("/_app/reports")({ component: Reports });

function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground">Generate professional adherence and risk reports.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => toast.success("PDF report generated!")} variant="outline" className="rounded-xl"><FileText className="mr-1.5 h-4 w-4" />PDF</Button>
          <Button onClick={() => toast.success("Excel report exported!")} variant="outline" className="rounded-xl"><Sheet className="mr-1.5 h-4 w-4" />Excel</Button>
          <Button onClick={() => toast.success("CSV download started!")} variant="outline" className="rounded-xl"><Download className="mr-1.5 h-4 w-4" />CSV</Button>
          <Button onClick={() => toast.info("Sending report to printer...")} className="rounded-xl bg-gradient-primary"><Printer className="mr-1.5 h-4 w-4" />Print</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { i: Calendar, t: "Daily report", d: "Aug 12, 2025", tone: "bg-gradient-primary" },
          { i: TrendingUp, t: "Weekly report", d: "Aug 6–12", tone: "bg-gradient-health" },
          { i: FileText, t: "Monthly report", d: "August 2025", tone: "bg-gradient-ai" },
        ].map((r) => (
          <Card key={r.t} className="overflow-hidden">
            <div className={`h-24 ${r.tone} relative`}>
              <r.i className="absolute right-4 top-4 h-8 w-8 text-white/70" />
            </div>
            <CardContent className="p-5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{r.d}</div>
              <div className="font-display text-lg font-bold">{r.t}</div>
              <div className="mt-3 flex gap-2">
                <Button onClick={() => toast.info(`Opening ${r.t}...`)} size="sm" variant="outline" className="rounded-lg">View</Button>
                <Button onClick={() => toast.success(`Downloading ${r.t}...`)} size="sm" className="rounded-lg bg-gradient-primary">Download</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { l: "Adherence %", v: "94%" },
          { l: "Delay avg", v: "12 min" },
          { l: "Medicine usage", v: "142 pills" },
          { l: "Risk score", v: "24/100" },
        ].map((s) => (
          <Card key={s.l}><CardContent className="p-5">
            <div className="text-xs text-muted-foreground">{s.l}</div>
            <div className="mt-1 font-display text-2xl font-bold">{s.v}</div>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Adherence trend</CardTitle></CardHeader><CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={weeklyAdherence}>
              <defs><linearGradient id="r1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(220 90% 55%)" stopOpacity={.4}/><stop offset="100%" stopColor="hsl(220 90% 55%)" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" opacity={.2}/>
              <XAxis dataKey="day" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
              <Area dataKey="adherence" stroke="hsl(220 90% 55%)" strokeWidth={3} fill="url(#r1)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent></Card>

        <Card><CardHeader><CardTitle>Delay analysis</CardTitle></CardHeader><CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={weeklyAdherence.map((w,i)=>({ ...w, delay: 8 + Math.round(Math.abs(Math.sin(i))*15) }))}>
              <CartesianGrid strokeDasharray="3 3" opacity={.2}/>
              <XAxis dataKey="day" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
              <Line dataKey="delay" stroke="hsl(280 75% 55%)" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent></Card>

        <Card><CardHeader><CardTitle>Medicine usage</CardTitle></CardHeader><CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyAdherence.slice(0,6)}>
              <CartesianGrid strokeDasharray="3 3" opacity={.2}/>
              <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
              <Bar dataKey="taken" fill="hsl(160 70% 45%)" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent></Card>

        <Card><CardHeader><CardTitle>Risk analysis</CardTitle></CardHeader><CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={reminderPie} innerRadius={50} outerRadius={90} dataKey="value" paddingAngle={4}>
                {reminderPie.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent></Card>
      </div>
    </div>
  );
}
