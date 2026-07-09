import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Smartphone, Radio, Watch, Save } from "lucide-react";
import { currentUser as mockUser } from "@/lib/mock-data";
import { toast } from "sonner";
import { apiLogout } from "@/lib/api";

export const Route = createFileRoute("/_app/settings")({ component: Settings });

function Settings() {
  const nav = useNavigate();
  const [user, setUser] = useState(mockUser);
  const [fullName, setFullName] = useState(mockUser.name);
  const [email, setEmail] = useState(mockUser.email);
  const [age, setAge] = useState(String(mockUser.age));
  const [condition, setCondition] = useState(mockUser.condition);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUser((prev) => ({
      ...prev,
      name: fullName,
      email: email,
      age: Number(age),
      condition: condition,
    }));
    toast.success("Profile updated successfully!");
  };

  const handleToggle = (settingName: string, enabled: boolean) => {
    toast.success(`${settingName} has been ${enabled ? "enabled" : "disabled"}.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile, devices and preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-primary text-white text-lg">
                    {user.avatar || user.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-display text-xl font-bold">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
                <Button type="button" variant="outline" className="ml-auto rounded-xl">Change photo</Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Full name</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 h-10 rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 h-10 rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Age</Label>
                  <Input value={age} onChange={(e) => setAge(e.target.value)} className="mt-1 h-10 rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Condition</Label>
                  <Input value={condition} onChange={(e) => setCondition(e.target.value)} className="mt-1 h-10 rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Emergency contact</Label>
                  <Input defaultValue="Dr. Priya Patel · +1 (415) 555-0198" className="mt-1 h-10 rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Language</Label>
                  <Input defaultValue="English (US)" className="mt-1 h-10 rounded-xl" />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" className="rounded-xl bg-gradient-primary">
                  <Save className="mr-2 h-4 w-4" /> Save Profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { name: "Push notifications", defaultVal: true },
                { name: "SMS reminders", defaultVal: false },
                { name: "Voice reminders", defaultVal: true },
                { name: "Caregiver alerts", defaultVal: true },
                { name: "Weekly AI report", defaultVal: true },
                { name: "Dark mode", defaultVal: false },
              ].map((p) => (
                <div key={p.name} className="flex items-center justify-between rounded-xl bg-muted/40 p-3">
                  <span>{p.name}</span>
                  <Switch
                    defaultChecked={p.defaultVal}
                    onCheckedChange={(checked) => handleToggle(p.name, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Connected devices</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
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
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          className="rounded-xl text-destructive"
          onClick={() => {
            apiLogout();
            nav({ to: "/" });
          }}
        >
          <LogOut className="mr-1.5 h-4 w-4" />Log out
        </Button>
      </div>
    </div>
  );
}
