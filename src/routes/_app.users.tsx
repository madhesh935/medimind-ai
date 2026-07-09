import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, UserPlus, Shield, MoreVertical } from "lucide-react";
import { patients, doctors, platformStats } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/users")({ component: Users });

const users = [
  ...doctors.slice(0, 3).map((d) => ({ name: d.name, role: "Doctor", email: d.name.toLowerCase().replace(/[^a-z]/g, ".") + "@medimind.ai", status: d.status, joined: "Jan 2024" })),
  ...patients.slice(0, 4).map((p) => ({ name: p.name, role: "Patient", email: p.name.toLowerCase().replace(" ", ".") + "@mail.com", status: p.status === "Missed" ? "Attention" : "Active", joined: "Mar 2024" })),
  { name: "Sarah Anderson", role: "Caregiver", email: "sarah@mail.com", status: "Active", joined: "Feb 2024" },
  { name: "Alex Morgan", role: "Admin", email: "alex@medimind.ai", status: "Active", joined: "Sep 2023" },
];

const roleColors: Record<string, string> = {
  Doctor: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  Patient: "bg-primary/15 text-primary",
  Caregiver: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Admin: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

function Users() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">User management</h1>
          <p className="text-sm text-muted-foreground">All patients, doctors, caregivers and admins across the platform.</p>
        </div>
        <Button className="rounded-xl bg-gradient-primary shadow-glow"><UserPlus className="mr-2 h-4 w-4" />Invite user</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { k: "Total", v: platformStats.totalUsers.toLocaleString() },
          { k: "Doctors", v: platformStats.doctors },
          { k: "Patients", v: platformStats.patients.toLocaleString() },
          { k: "Caregivers", v: platformStats.caregivers.toLocaleString() },
        ].map((s) => (
          <Card key={s.k} className="p-5">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.k}</div>
            <div className="mt-1 font-display text-3xl font-bold">{s.v}</div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">All users</CardTitle>
          <div className="flex gap-2">
            <div className="relative w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search users…" className="h-9 rounded-xl pl-9" />
            </div>
            <Button variant="outline" className="rounded-xl"><Shield className="mr-2 h-4 w-4" />Roles</Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr className="border-b border-border/60"><th className="p-3 text-left">User</th><th className="p-3 text-left">Role</th><th className="p-3 text-left">Email</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Joined</th><th className="p-3" /></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email} className="border-b border-border/40 last:border-0 hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9"><AvatarFallback className="bg-gradient-primary text-xs font-bold text-white">{u.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}</AvatarFallback></Avatar>
                      <span className="font-semibold">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-3"><Badge className={`rounded-full ${roleColors[u.role]}`}>{u.role}</Badge></td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="p-3"><Badge variant="outline" className="rounded-full">{u.status}</Badge></td>
                  <td className="p-3 text-muted-foreground">{u.joined}</td>
                  <td className="p-3 text-right"><Button size="icon" variant="ghost" className="rounded-xl"><MoreVertical className="h-4 w-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
