import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HardDrive, Wifi, WifiOff, Battery, RefreshCcw } from "lucide-react";
import { devices, platformStats } from "@/lib/mock-data";
import { StatCard } from "@/components/stat-card";

import { toast } from "sonner";

export const Route = createFileRoute("/_app/devices")({ component: Devices });

function Devices() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Devices</h1>
        <p className="text-sm text-muted-foreground">Every Smart Bottle connected to your MediMind hospital.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={HardDrive} label="Total devices" value={platformStats.bottlesConnected.toLocaleString()} tone="primary" />
        <StatCard icon={Wifi} label="Online" value={platformStats.activeDevices.toLocaleString()} tone="success" />
        <StatCard icon={WifiOff} label="Offline" value={platformStats.offlineDevices} tone="danger" />
        <StatCard icon={RefreshCcw} label="Firmware pending" value="128" tone="warning" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Device fleet</CardTitle>
          <Button size="sm" onClick={() => toast.success("Device synchronization triggered successfully!")} className="rounded-xl bg-gradient-primary"><RefreshCcw className="mr-2 h-4 w-4" />Sync all</Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr className="border-b border-border/60"><th className="p-3 text-left">Device</th><th className="p-3 text-left">Type</th><th className="p-3 text-left">Owner</th><th className="p-3 text-left">Battery</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Firmware</th></tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr key={d.id} className="border-b border-border/40 last:border-0 hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs font-semibold">{d.id}</td>
                  <td className="p-3">{d.type}</td>
                  <td className="p-3 text-muted-foreground">{d.owner}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Battery className={`h-4 w-4 ${d.battery < 25 ? "text-destructive" : d.battery < 50 ? "text-warning" : "text-success"}`} />
                      <Progress value={d.battery} className="h-1.5 w-20" />
                      <span className="text-xs font-semibold">{d.battery}%</span>
                    </div>
                  </td>
                  <td className="p-3"><Badge className={`rounded-full ${d.status === "Offline" ? "bg-destructive/15 text-destructive" : d.status === "Low battery" ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>{d.status}</Badge></td>
                  <td className="p-3 text-muted-foreground">v{d.firmware}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
