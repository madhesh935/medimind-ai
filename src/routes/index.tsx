import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Activity, Mail, Lock, Sparkles, HeartPulse, Stethoscope, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setRole, type Role } from "@/lib/role-store";
import { apiLogin } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediMind AI — Intelligent Medication Adherence Platform" },
      { name: "description", content: "AI-powered medication adherence for patients, caregivers, doctors and hospitals." },
      { property: "og:title", content: "MediMind AI" },
      { property: "og:description", content: "Never miss a dose. Live better with MediMind." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});

const roles: { id: Role; label: string; desc: string; Icon: typeof User; grad: string; email: string }[] = [
  { id: "patient", label: "Patient", desc: "Track my medicine", Icon: User, grad: "from-blue-500 to-indigo-600", email: "patient@medimind.ai" },
  { id: "caregiver", label: "Caregiver", desc: "Care for a loved one", Icon: HeartPulse, grad: "from-emerald-500 to-teal-600", email: "caregiver@medimind.ai" },
  { id: "doctor", label: "Doctor", desc: "Manage patients", Icon: Stethoscope, grad: "from-purple-500 to-fuchsia-600", email: "doctor@medimind.ai" },
  { id: "admin", label: "Admin", desc: "Hospital control center", Icon: Shield, grad: "from-rose-500 to-orange-500", email: "admin@medimind.ai" },
];

function Login() {
  const nav = useNavigate();
  const [selected, setSelected] = useState<Role>("patient");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleRoleSelect = (role: Role) => {
    setSelected(role);
    setError(null);
    const roleData = roles.find((r) => r.id === role);
    if (emailRef.current && roleData) {
      emailRef.current.value = roleData.email;
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";

    try {
      const data = await apiLogin(email, password);
      const serverRole = (data.user.role as Role) || selected;
      setRole(serverRole);
      nav({ to: "/dashboard" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-gradient-hero lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:flex">
        <div className="absolute inset-0 bg-gradient-primary opacity-95" />
        <div className="absolute -left-24 top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-accent/40 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between p-14 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Activity className="h-6 w-6" />
            </div>
            <span className="font-display text-xl font-bold">MediMind AI</span>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> AI-powered adherence
            </div>
            <h1 className="max-w-md font-display text-5xl font-bold leading-[1.05] tracking-tight">
              Never miss a dose. <br />
              <span className="opacity-80">Live better with MediMind.</span>
            </h1>
            <p className="max-w-sm text-white/80">
              One platform for patients, caregivers, doctors and hospitals — trusted by 50,000+ users worldwide.
            </p>
            <div className="grid max-w-md grid-cols-3 gap-3 pt-4">
              {[
                { k: "94%", v: "Avg. adherence" },
                { k: "12k+", v: "Clinicians" },
                { k: "24/7", v: "AI care" },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <div className="font-display text-2xl font-bold">{s.k}</div>
                  <div className="text-[11px] uppercase tracking-wider opacity-70">{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs opacity-70">HIPAA compliant · SOC 2 · End-to-end encrypted</div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6 rounded-3xl border border-border/60 bg-card/80 p-8 shadow-2xl backdrop-blur-xl">
          <div>
            <h2 className="font-display text-3xl font-bold">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to your health dashboard</p>
          </div>

          <div>
            <Label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Sign in as</Label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((r) => {
                const active = selected === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleSelect(r.id)}
                    className={`group relative flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${active ? "border-primary bg-primary/5 shadow-glow" : "border-border/60 hover:border-primary/40 hover:bg-muted/40"}`}
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${r.grad} text-white`}>
                      <r.Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{r.label}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{r.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" ref={emailRef} type="email" defaultValue="patient@medimind.ai" className="h-11 rounded-xl pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" ref={passwordRef} type="password" defaultValue="password123" className="h-11 rounded-xl pl-10" />
              </div>
            </div>
            {error && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl bg-gradient-primary text-base font-semibold shadow-glow">
              {loading ? "Signing in…" : `Sign in as ${roles.find((r) => r.id === selected)!.label}`}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">By continuing you agree to our Terms & HIPAA privacy policy.</p>
        </div>
      </div>
    </div>
  );
}
