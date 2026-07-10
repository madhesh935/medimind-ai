import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getMyDevice, getDeviceEvents, getMedicines, type MyDevice, MOCK_MY_DEVICE, MOCK_MEDICINES } from "@/lib/api";
import { Battery, Wifi, Thermometer, Weight, Lock, Move, Cpu, Radio, Activity, Gauge } from "lucide-react";

export const Route = createFileRoute("/_app/smart-bottle")({ component: SmartBottle });

function SmartBottle() {
  const [device, setDevice] = useState<MyDevice | null>(MOCK_MY_DEVICE);
  const [pillCount, setPillCount] = useState<number | null>(
    MOCK_MEDICINES.reduce((sum, m) => sum + m.remaining_pills, 0)
  );
  const [lastOpened, setLastOpened] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getMyDevice()
      .then(async (d) => {
        setDevice(d);
        const events = await getDeviceEvents(d.device_id, 20).catch(() => []);
        const lastOpen = (events as { event_type: string; timestamp: string }[]).find((e) => e.event_type === "open");
        if (lastOpen) setLastOpened(new Date(lastOpen.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
      })
      .catch((err) => console.warn("Using instant mock data:", err))
      .finally(() => setLoaded(true));
      
    getMedicines()
      .then((meds) => setPillCount(meds.reduce((sum, m) => sum + m.remaining_pills, 0)))
      .catch((err) => console.warn("Using instant mock data:", err));
  }, []);

  const connected = device?.wifi_status === "connected";

  if (loaded && !device) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Smart Bottle</h1>
          <p className="text-sm text-muted-foreground">No smart bottle is paired with your account yet.</p>
        </div>
        <Card className="grid min-h-[240px] place-items-center rounded-2xl border-border/60 p-10 text-center text-sm text-muted-foreground">
          Pair a MediMind Smart Bottle from the mobile app to see live telemetry here.
        </Card>
      </div>
    );
  }

  const s = {
    battery: device?.battery ?? 0,
    wifi: connected ? "Connected" : (device?.wifi_status ?? "Unknown"),
    temperature: device?.temperature != null ? `${device.temperature}°C` : "—",
    weight: device?.weight != null ? `${device.weight}g` : "—",
    lid: device?.lid_status ?? "—",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Smart Bottle</h1>
        <p className="text-sm text-muted-foreground">Live telemetry from your MediMind Smart Bottle {device ? `#${device.device_id}` : ""}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero" />
          <CardContent className="relative flex h-[440px] items-center justify-center p-6">
            <div className="absolute h-72 w-72 rounded-full bg-gradient-primary opacity-30 blur-3xl" />
            <div className="relative flex flex-col items-center animate-float">
              <div className="h-8 w-24 rounded-t-xl bg-gradient-to-b from-slate-700 to-slate-900 shadow-lg" />
              <div className="h-3 w-28 rounded-md bg-slate-800" />
              <div className="relative h-64 w-36 overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-b from-white/40 to-white/10 shadow-2xl backdrop-blur-md">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-accent"
                  style={{ height: `${Math.min(100, ((pillCount ?? 0) / 30) * 100)}%` }}
                >
                  <div className="absolute top-0 h-2 w-full animate-pulse bg-white/40" />
                </div>
                <div className="absolute inset-x-3 top-14 rounded-lg bg-white/60 py-3 text-center backdrop-blur">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-primary">MediMind</div>
                  <div className="text-xs font-bold text-slate-800">{device?.device_id ?? "—"}</div>
                </div>
              </div>
              <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${connected ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                <span className="relative flex h-2 w-2">
                  {connected && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />}
                  <span className={`relative inline-flex h-2 w-2 rounded-full ${connected ? "bg-success" : "bg-destructive"}`} />
                </span>
                {connected ? "Connected · Live" : "Disconnected"}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Live status</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {[
                { i: Battery, l: "Battery", v: `${s.battery}%` },
                { i: Wifi, l: "WiFi", v: s.wifi },
                { i: Thermometer, l: "Temperature", v: s.temperature },
                { i: Weight, l: "Weight", v: s.weight },
                { i: Lock, l: "Lid", v: s.lid },
                { i: Move, l: "Firmware", v: device?.firmware_version ?? "—" },
              ].map((x) => (
                <div key={x.l} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                    <x.i className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">{x.l}</div>
                    <div className="text-sm font-semibold">{x.v}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-3">
            <Card><CardContent className="p-5">
              <div className="text-xs text-muted-foreground">Pills remaining (all meds)</div>
              <div className="mt-1 font-display text-3xl font-bold">{pillCount ?? "—"}</div>
              <Progress value={Math.min(100, ((pillCount ?? 0) / 30) * 100)} className="mt-2" />
            </CardContent></Card>
            <Card><CardContent className="p-5">
              <div className="text-xs text-muted-foreground">Last opened</div>
              <div className="mt-1 font-display text-2xl font-bold">{lastOpened ?? "No data yet"}</div>
              <div className="text-xs text-muted-foreground">From bottle event log</div>
            </CardContent></Card>
            <Card><CardContent className="p-5">
              <div className="text-xs text-muted-foreground">Last sync</div>
              <div className="mt-1 font-display text-2xl font-bold">
                {device?.last_sync ? new Date(device.last_sync).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "—"}
              </div>
              <div className="text-xs text-muted-foreground">{connected ? "All systems normal" : "Check connection"}</div>
            </CardContent></Card>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sensor modules</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { i: Gauge, name: "Hall Sensor", status: s.lid === "closed" ? "OK" : "Open", detail: "Lid magnet detected" },
            { i: Weight, name: "Load Cell", status: s.weight, detail: "±0.2g precision" },
            { i: Activity, name: "Accelerometer", status: "OK", detail: "6-axis MPU-6050" },
            { i: Battery, name: "Battery Pack", status: `${s.battery}%`, detail: "3.7V Li-Po · 1200mAh" },
            { i: Cpu, name: "ESP32", status: connected ? "Online" : "Offline", detail: `Firmware ${device?.firmware_version ?? "—"}` },
            { i: Radio, name: "MQTT Broker", status: connected ? "Connected" : "Disconnected", detail: "mqtts://medimind.io" },
          ].map((x) => (
            <div key={x.name} className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-white">
                    <x.i className="h-4 w-4" />
                  </div>
                  <div className="font-semibold">{x.name}</div>
                </div>
                <Badge className="rounded-full bg-success/15 text-success">{x.status}</Badge>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">{x.detail}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
