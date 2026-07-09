import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Smartphone, Radio, Watch } from "lucide-react";
import { currentUser } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/settings")({ component: Settings });

function Settings() {
  const nav = useNavigate();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile, devices and preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16"><AvatarFallback className="bg-gradient-primary text-white text-lg">{currentUser.avatar}</AvatarFallback></Avatar>
              <div>
                <div className="font-display text-xl font-bold">{currentUser.name}</div>
                <div className="text-sm text-muted-foreground">{currentUser.email}</div>
              </div>
              <Button variant="outline" className="ml-auto rounded-xl">Change photo</Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <F label="Full name" v={currentUser.name} />
              <F label="Email" v={currentUser.email} />
              <F label="Age" v={String(currentUser.age)} />
              <F label="Condition" v={currentUser.condition} />
              <F label="Emergency contact" v="Dr. Priya Patel · +1 (415) 555-0198" />
              <F label="Language" v="English (US)" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card><CardHeader><CardTitle className="text-base">Preferences</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
            {[
              ["Push notifications", true],
              ["SMS reminders", false],
              ["Voice reminders", true],
              ["Caregiver alerts", true],
              ["Weekly AI report", true],
              ["Dark mode", false],
            ].map(([l, v]) => (
              <div key={l as string} className="flex items-center justify-between rounded-xl bg-muted/40 p-3">
                <span>{l as string}</span>
                <Switch defaultChecked={v as boolean} />
              </div>
            ))}
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base">Connected devices</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
            {[
              { i: Radio, n: "Smart Bottle A2", s: "Online" },
              { i: Watch, n: "Apple Watch", s: "Synced" },
              { i: Smartphone, n: "iPhone 15 Pro", s: "Active" },
            ].map((d) => (
              <div key={d.n} className="flex items-center gap-3 rounded-xl border border-border/60 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted"><d.i className="h-4 w-4" /></div>
                <div className="flex-1"><div className="font-semibold">{d.n}</div><div className="text-xs text-muted-foreground">{d.s}</div></div>
                <Badge className="rounded-full bg-success/15 text-success">Paired</Badge>
              </div>
            ))}
          </CardContent></Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" className="rounded-xl text-destructive" onClick={() => nav({ to: "/" })}><LogOut className="mr-1.5 h-4 w-4" />Log out</Button>
      </div>
    </div>
  );
}

function F({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input defaultValue={v} className="mt-1 h-10 rounded-xl" />
    </div>
  );
}
