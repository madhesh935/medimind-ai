import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search, HardDrive, Wifi, WifiOff, Battery,
  BatteryMedium, BatteryLow, RefreshCcw, AlertTriangle, Plus,
} from "lucide-react";
import { toast } from "sonner";
import { getAdminDevices, updateDeviceStatus, type AdminDevice, MOCK_ADMIN_DEVICES } from "@/lib/api";
import { statusBadgeClass, statusDotClass } from "@/lib/status-colors";

export const Route = createFileRoute("/_app/devices")({ component: DevicesPage });

const LATEST_FIRMWARE = "v2.4.1";

function statusOf(d: AdminDevice): "online" | "offline" | "needs_update" {
  if (d.wifi_status !== "connected") return "offline";
  if (d.firmware_version && d.firmware_version !== LATEST_FIRMWARE) return "needs_update";
  return "online";
}

const STATUS_LABEL: Record<string, string> = { online: "Online", offline: "Offline", needs_update: "Needs Update" };

function BatteryIcon({ level }: { level: number }) {
  if (level > 60) return <Battery className="w-4 h-4 text-success" />;
  if (level > 25) return <BatteryMedium className="w-4 h-4 text-warning" />;
  return <BatteryLow className="w-4 h-4 text-destructive" />;
}

function DevicesPage() {
  const [devices, setDevices] = useState<AdminDevice[]>(MOCK_ADMIN_DEVICES);
  const [loaded, setLoaded] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    getAdminDevices().then(setDevices).catch(() => setDevices([])).finally(() => setLoaded(true));
  }, []);

  const filtered = devices.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = (d.patient_name ?? "").toLowerCase().includes(q) || d.device_id.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || STATUS_LABEL[statusOf(d)] === statusFilter;
    return matchSearch && matchStatus;
  });

  const online = devices.filter((d) => statusOf(d) === "online").length;
  const offline = devices.filter((d) => statusOf(d) === "offline").length;
  const needsUpdate = devices.filter((d) => statusOf(d) === "needs_update").length;
  const avgBattery = devices.length ? Math.round(devices.reduce((s, d) => s + d.battery, 0) / devices.length) : 0;

  async function ping(deviceId: string) {
    try {
      const updated = await updateDeviceStatus(deviceId, {});
      setDevices((prev) => prev.map((d) => (d.device_id === deviceId ? { ...d, last_sync: (updated as { last_sync?: string }).last_sync ?? d.last_sync } : d)));
      toast.success(`Pinged ${deviceId} — last sync updated.`);
    } catch {
      toast.error(`Couldn't reach ${deviceId}.`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Smart Bottles</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor all connected smart medication dispensers across the platform.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => toast.success("Refreshing device status...")} variant="outline" className="rounded-xl gap-2">
            <RefreshCcw className="w-4 h-4" /> Refresh
          </Button>
          <Button onClick={() => toast.success("Opening device registration form...")} className="rounded-xl gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
            <Plus className="w-4 h-4" /> Register Device
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Devices", value: devices.length, icon: HardDrive, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Online", value: online, icon: Wifi, color: "text-green-600", bg: "bg-green-50" },
          { label: "Offline", value: offline, icon: WifiOff, color: "text-red-600", bg: "bg-red-50" },
          { label: "Avg Battery", value: `${avgBattery}%`, icon: Battery, color: "text-amber-600", bg: "bg-amber-50" },
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
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient or device ID..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-border/60 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 bg-background" />
        </div>
        {["All", "Online", "Offline", "Needs Update"].map((f) => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${statusFilter === f ? "bg-blue-600 text-white border-blue-600" : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-muted/70"}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs font-bold text-muted-foreground uppercase tracking-wider bg-muted/30 border-b border-border/40">
              <tr>
                <th className="p-4 text-left">Device ID</th>
                <th className="p-4 text-left">Patient</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Battery</th>
                <th className="p-4 text-left">Last Sync</th>
                <th className="p-4 text-left">Firmware</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loaded && filtered.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">No devices found.</td></tr>
              )}
              {filtered.map((d) => {
                const status = statusOf(d);
                return (
                  <tr key={d.device_id} className="hover:bg-muted/20 transition-colors group">
                    <td className="p-4 font-mono text-xs font-semibold text-primary">{d.device_id}</td>
                    <td className="p-4 font-semibold">{d.patient_name ?? "Unassigned"}</td>
                    <td className="p-4">
                      <Badge className={`text-[10px] border font-semibold ${statusBadgeClass(status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1 inline-block ${statusDotClass(status)}`} />
                        {STATUS_LABEL[status]}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <BatteryIcon level={d.battery} />
                        <span className="text-sm font-semibold">{d.battery}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">{d.last_sync ? new Date(d.last_sync).toLocaleString() : "Never"}</td>
                    <td className="p-4">
                      <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${d.firmware_version === LATEST_FIRMWARE ? "bg-success/15 text-success border border-success/20" : "bg-warning/15 text-warning border border-warning/20"}`}>
                        {d.firmware_version ?? "unknown"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {status === "needs_update" && (
                          <Button onClick={() => toast.success(`Firmware update pushed to ${d.device_id}`)} size="sm" variant="outline" className="h-7 rounded-lg text-xs gap-1 text-warning border-warning/30">
                            <RefreshCcw className="w-3 h-3" /> Update
                          </Button>
                        )}
                        <Button onClick={() => ping(d.device_id)} size="sm" variant="outline" className="h-7 rounded-lg text-xs">
                          Ping
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {filtered.length} of {devices.length} devices</span>
          {needsUpdate > 0 && (
            <div className="flex items-center gap-1.5 text-warning font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" /> {needsUpdate} device(s) need firmware update
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
