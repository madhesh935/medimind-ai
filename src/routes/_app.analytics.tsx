import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, RadialBar, RadialBarChart,
} from "recharts";
import { monthlyAdherence, weeklyAdherence, reminderPie, platformUsage } from "@/lib/mock-data";
import { StatCard } from "@/components/stat-card";
import { Activity, LineChart as LineIcon, TrendingUp, Users } from "lucide-react";

export const Route = createFileRoute("/_app/analytics")({ component: Analytics });

function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Deep insights across adherence, engagement and outcomes.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={TrendingUp} label="Adherence" value="87%" tone="success" hint="+3% MoM" />
        <StatCard icon={Users} label="Active users" value="9,412" tone="primary" hint="+412 this week" />
        <StatCard icon={Activity} label="Med events / day" value="48.2k" tone="accent" hint="24h" />
        <StatCard icon={LineIcon} label="Retention" value="92%" tone="warning" hint="30-day" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base font-semibold">Adherence trend (12 mo)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyAdherence}>
                <defs><linearGradient id="an1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(280 75% 55%)" stopOpacity={0.5} /><stop offset="100%" stopColor="hsl(280 75% 55%)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
                <Area type="monotone" dataKey="taken" stroke="hsl(280 75% 55%)" strokeWidth={3} fill="url(#an1)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">Notification channel mix</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={reminderPie} innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {reminderPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">Weekly compliance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyAdherence}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} domain={[70, 100]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
                <Bar dataKey="adherence" fill="hsl(220 90% 55%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base font-semibold">Device analytics</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={platformUsage}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
                <Line type="monotone" dataKey="events" stroke="hsl(160 70% 45%)" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="users" stroke="hsl(220 90% 55%)" strokeWidth={2} dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Risk breakdown</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <RadialBarChart innerRadius="25%" outerRadius="90%" data={[
              { name: "Low", value: 78, fill: "hsl(160 70% 45%)" },
              { name: "Medium", value: 44, fill: "hsl(38 90% 55%)" },
              { name: "High", value: 22, fill: "hsl(0 70% 60%)" },
            ]}>
              <RadialBar dataKey="value" background cornerRadius={10} />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
