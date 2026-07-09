import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search, Download, UserPlus, MoreHorizontal, ShieldCheck,
  ShieldOff, Stethoscope, HeartPulse, Settings2, Mail, Phone,
} from "lucide-react";
import { toast } from "sonner";
import { getAdminUsers, updateUserStatus, type AdminUser, MOCK_ADMIN_USERS } from "@/lib/api";
import { roleBadgeClass, statusBadgeClass } from "@/lib/status-colors";

export const Route = createFileRoute("/_app/users")({ component: UsersPage });

function initials(name: string) {
  return name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
}

function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(MOCK_ADMIN_USERS);
  const [loaded, setLoaded] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  useEffect(() => {
    getAdminUsers().then(setUsers).catch(() => setUsers([])).finally(() => setLoaded(true));
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = roleFilter === "All" || u.role.toLowerCase() === roleFilter.toLowerCase();
    return matchSearch && matchRole;
  });

  const stats = {
    total: users.length,
    doctors: users.filter((u) => u.role === "doctor").length,
    patients: users.filter((u) => u.role === "patient").length,
    active: users.filter((u) => u.is_active).length,
  };

  async function toggleStatus(u: AdminUser) {
    try {
      const updated = await updateUserStatus(u.id, !u.is_active);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
      toast.success(updated.is_active ? `${u.name} reactivated` : `${u.name} suspended`);
    } catch {
      toast.error("Couldn't update user status — try again.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all doctors, patients and administrators on the platform.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => toast.success("Exporting user list...")} variant="outline" className="rounded-xl gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button onClick={() => toast.success("Opening add user form...")} className="rounded-xl gap-2 bg-rose-600 hover:bg-rose-700 text-white shadow-md">
            <UserPlus className="w-4 h-4" /> Add User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats.total, icon: Settings2, color: "text-rose-600", bg: "bg-rose-50" },
          { label: "Doctors", value: stats.doctors, icon: Stethoscope, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Patients", value: stats.patients, icon: HeartPulse, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active", value: stats.active, icon: ShieldCheck, color: "text-green-600", bg: "bg-green-50" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/40 bg-card p-4 flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${s.bg}`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-border/60 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 bg-background"
          />
        </div>
        <div className="flex gap-2">
          {["All", "Doctor", "Patient", "Admin"].map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${roleFilter === r ? "bg-rose-600 text-white border-rose-600" : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-muted/70"}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs font-bold text-muted-foreground uppercase tracking-wider bg-muted/30 border-b border-border/40">
              <tr>
                <th className="p-4 text-left">User</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-left">Contact</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loaded && filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">No users found.</td></tr>
              )}
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9 border border-border/40">
                        <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700">{initials(u.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className={`text-xs border font-semibold capitalize ${roleBadgeClass(u.role as "doctor" | "patient" | "admin")}`}>{u.role}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{u.phone ?? "—"}</div>
                  </td>
                  <td className="p-4">
                    <Badge className={`text-xs border font-semibold ${statusBadgeClass(u.is_active ? "active" : "suspended")}`}>{u.is_active ? "Active" : "Suspended"}</Badge>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button onClick={() => toast.success(`Email sent to ${u.name}`)} size="icon" variant="ghost" className="h-8 w-8 rounded-lg"><Mail className="w-3.5 h-3.5" /></Button>
                      <Button onClick={() => toggleStatus(u)} size="icon" variant="ghost" className="h-8 w-8 rounded-lg">
                        {u.is_active ? <ShieldOff className="w-3.5 h-3.5 text-destructive" /> : <ShieldCheck className="w-3.5 h-3.5 text-success" />}
                      </Button>
                      <Button onClick={() => toast.info(`Editing ${u.name}...`)} size="icon" variant="ghost" className="h-8 w-8 rounded-lg"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border/40 text-xs text-muted-foreground">
          Showing {filtered.length} of {users.length} users
        </div>
      </div>
    </div>
  );
}
