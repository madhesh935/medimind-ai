import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { sensorReadings } from "@/lib/mock-data";
import {
  Battery, Wifi, Thermometer, Weight, Lock, Move, Cpu, Radio, Activity, Gauge,
} from "lucide-react";

export const Route = createFileRoute("/_app/smart-bottle")({ component: SmartBottle });

const STATUS_ROWS = (s: typeof sensorReadings) => [
  { i: Battery, l: "Battery", v: `${s.battery}%` },
  { i: Wifi, l: "WiFi", v: s.wifi },
  { i: Thermometer, l: "Temperature", v: s.temperature },
  { i: Weight, l: "Weight", v: s.weight },
  { i: Lock, l: "Lid", v: s.lid },
  { i: Move, l: "Motion", v: s.motion },
];

const MODULES = [
  { i: Gauge, name: "Hall Sensor", status: "OK", detail: "Lid magnet detected" },
  { i: Weight, name: "Load Cell", status: "OK", detail: "±0.2g precision" },
  { i: Activity, name: "Accelerometer", status: "OK", detail: "6-axis MPU-6050" },
  { i: Battery, name: "Battery Pack", status: "82%", detail: "3.7V Li-Po · 1200mAh" },
  { i: Cpu, name: "ESP32", status: "Online", detail: "Firmware v2.4.1" },
  { i: Radio, name: "MQTT Broker", status: "Connected", detail: "mqtts://medimind.io" },
];

function SmartBottle() {
  const s = sensorReadings;
  const pillPct = (s.pillCount / 30) * 100;

  return (
    <div className="space-y-8">
      <PageHeader title="Smart Bottle" subtitle="Live telemetry from your MediMind Smart Bottle #A2" />

      <div className="grid gap-5 lg:grid-cols-[460px_1fr]">
        {/* Hero device card */}
        <Card className="overflow-hidden rounded-2xl border-border bg-card shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition-shadow duration-200 hover:shadow-[0_12px_30px_rgba(15,23,42,0.1)]">
          <CardContent
            className="relative flex h-[520px] items-center justify-center p-8"
            style={{ background: "radial-gradient(ellipse at 50% 40%, #FFFFFF 0%, #F8FAFC 70%)" }}
          >
            <div className="relative flex flex-col items-center animate-float">
              <div className="h-10 w-28 rounded-t-xl bg-gradient-to-b from-slate-600 to-slate-800 shadow-md" />
              <div className="h-3.5 w-32 rounded-md bg-slate-700" />
              <div className="relative h-80 w-44 overflow-hidden rounded-[28px] border border-border/60 bg-gradient-to-b from-white/70 to-white/20 shadow-[0_8px_32px_rgba(15,23,42,0.12)]">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-primary/60"
                  style={{ height: "60%" }}
                >
                  <div className="absolute top-0 h-1.5 w-full bg-white/30" />
                </div>
                <div className="absolute inset-x-4 top-16 rounded-xl border border-white/50 bg-white/70 py-3 text-center backdrop-blur-sm">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-primary">MediMind</div>
                  <div className="text-sm font-bold text-slate-800">A2</div>
                </div>
              </div>
              <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#ECFDF5] px-3.5 py-1.5 text-[13px] font-medium text-[#15803D]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#15803D] opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#15803D]" />
                </span>
                Connected · Live
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="rounded-2xl border-border bg-card shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition-shadow duration-200 hover:shadow-[0_12px_30px_rgba(15,23,42,0.1)]">
            <CardContent className="p-6">
              <h2 className="text-[20px] font-semibold tracking-tight">Live status</h2>
              <p className="mt-0.5 text-[13px] text-muted-foreground">Real-time sensor readings</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {STATUS_ROWS(s).map((x) => (
                  <div key={x.l} className="flex items-center gap-3.5 rounded-xl border border-border bg-card p-4">
                    <x.i className="h-6 w-6 shrink-0 text-primary" strokeWidth={2} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] text-muted-foreground">{x.l}</div>
                      <div className="text-[15px] font-semibold tabular-nums">{x.v}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Current pill count", value: String(s.pillCount), sub: null, pct: pillPct },
              { label: "Last opened", value: s.lastOpened, sub: "Today", pct: null },
              { label: "Sensor health", value: `${s.sensorHealth}%`, sub: "All systems normal", pct: s.sensorHealth, ring: true },
            ].map((m) => (
              <Card
                key={m.label}
                className="rounded-2xl border-border bg-card shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition-shadow duration-200 hover:shadow-[0_12px_30px_rgba(15,23,42,0.1)]"
              >
                <CardContent className="p-5">
                  <div className="text-[13px] text-muted-foreground">{m.label}</div>
                  <div className="mt-1 flex items-center gap-3">
                    {m.ring ? (
                      <div className="relative flex h-14 w-14 items-center justify-center">
                        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56">
                          <circle cx="28" cy="28" r="24" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                          <circle
                            cx="28" cy="28" r="24" fill="none" stroke="#15803D" strokeWidth="4"
                            strokeDasharray={`${(m.pct! / 100) * 150.8} 150.8`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="text-[18px] font-bold tabular-nums text-[#15803D]">{m.value}</span>
                      </div>
                    ) : (
                      <div className="text-[32px] font-bold leading-none tabular-nums tracking-tight">{m.value}</div>
                    )}
                  </div>
                  {m.pct !== null && !m.ring && (
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                        style={{ width: `${m.pct}%` }}
                      />
                    </div>
                  )}
                  {m.sub && <div className="mt-2 text-[12px] text-muted-foreground">{m.sub}</div>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-[20px] font-semibold tracking-tight">Sensor modules</h2>
        <p className="mt-0.5 text-[13px] text-muted-foreground">Hardware components and connectivity</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((x) => (
            <Card
              key={x.name}
              className="rounded-2xl border-border bg-card p-5 shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition-shadow duration-200 hover:shadow-[0_12px_30px_rgba(15,23,42,0.1)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <x.i className="h-5 w-5 text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold">{x.name}</div>
                    <div className="mt-1 text-[13px] text-muted-foreground">{x.detail}</div>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[12px] font-medium text-[#15803D]">
                  {x.status}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
