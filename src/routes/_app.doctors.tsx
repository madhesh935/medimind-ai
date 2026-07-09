import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search, Download, UserPlus, Users, Mail,
} from "lucide-react";
import { toast } from "sonner";
import { getDoctorsList, type DoctorSummary, MOCK_DOCTORS } from "@/lib/api";
import { statusBadgeClass } from "@/lib/status-colors";

export const Route = createFileRoute("/_app/doctors")({ component: DoctorsPage });

function initials(name: string) {
  return name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
}

function DoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorSummary[]>(MOCK_DOCTORS);
  const [loaded, setLoaded] = useState(true);
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    getDoctorsList().then(setDoctors).catch(() => setDoctors([])).finally(() => setLoaded(true));
  }, []);

  const filtered = doctors.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = d.name.toLowerCase().includes(q) || (d.specialization ?? "").toLowerCase().includes(q) || (d.hospital ?? "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || d.status === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const avgPatients = doctors.length ? Math.round(doctors.reduce((s, d) => s + d.patients_count, 0) / doctors.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Doctors</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage registered doctors, their specialties and patient assignments.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => toast.success("Exporting doctor list...")} variant="outline" className="rounded-xl gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button onClick={() => toast.success("Opening add doctor form...")} className="rounded-xl gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-md">
            <UserPlus className="w-4 h-4" /> Add Doctor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Doctors", value: doctors.length, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Active", value: doctors.filter((d) => d.status === "active").length, color: "text-green-600", bg: "bg-green-50" },
          { label: "Avg Patients", value: avgPatients, color: "text-blue-600", bg: "bg-blue-50" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/40 bg-card p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, specialty or hospital..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-border/60 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 bg-background" />
        </div>
        {["All", "Active", "Suspended"].map((f) => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${statusFilter === f ? "bg-purple-600 text-white border-purple-600" : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-muted/70"}`}>
            {f}
          </button>
        ))}
      </div>

      {loaded && filtered.length === 0 && (
        <div className="rounded-2xl border border-border/50 bg-card p-10 text-center text-sm text-muted-foreground">No doctors found.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((d) => (
          <div key={d.id} className="rounded-2xl border border-border/50 bg-card p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border border-border/40">
                  <AvatarFallback className="text-sm font-bold">{initials(d.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold">{d.name}</div>
                  <div className="text-xs text-muted-foreground">{d.specialization ?? "General Medicine"}</div>
                </div>
              </div>
              <Badge className={`text-[10px] border font-semibold capitalize ${statusBadgeClass(d.status as "active" | "suspended")}`}>{d.status}</Badge>
            </div>
            <div className="text-xs text-muted-foreground mb-3">{d.hospital ?? "Unaffiliated"}</div>
            <div className="grid grid-cols-2 gap-2 text-center mb-4">
              <div className="rounded-xl bg-muted/30 p-2">
                <div className="text-sm font-bold text-blue-600">{d.patients_count}</div>
                <div className="text-[10px] text-muted-foreground">Patients</div>
              </div>
              <div className="rounded-xl bg-muted/30 p-2">
                <div className="text-sm font-bold text-purple-600 flex items-center justify-center gap-1"><Users className="w-3 h-3" />{d.status}</div>
                <div className="text-[10px] text-muted-foreground">Status</div>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button onClick={() => toast.success(`Email sent to ${d.name}`)} variant="outline" size="sm" className="flex-1 rounded-xl gap-1 text-xs"><Mail className="w-3.5 h-3.5" />Email</Button>
              <Button onClick={() => toast.success(`Viewing ${d.name}'s profile...`)} size="sm" className="flex-1 rounded-xl gap-1 text-xs bg-purple-600 hover:bg-purple-700 text-white"><Users className="w-3.5 h-3.5" />View</Button>
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground text-center">Showing {filtered.length} of {doctors.length} doctors</div>
    </div>
  );
}
