import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity, Mail, Lock, Sparkles, HeartPulse, Stethoscope, Shield, User,
  Github, ArrowRight, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShaderBackground } from "@/components/ui/hero-shader";
import { setRole, type Role } from "@/lib/role-store";

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

const roles: { id: Role; label: string; desc: string; Icon: typeof User; tone: string }[] = [
  { id: "patient", label: "Patient", desc: "Track my medicine", Icon: User, tone: "bg-primary/10 text-primary" },
  { id: "caregiver", label: "Caregiver", desc: "Care for a loved one", Icon: HeartPulse, tone: "bg-success/10 text-success" },
  { id: "doctor", label: "Doctor", desc: "Manage patients", Icon: Stethoscope, tone: "bg-primary/10 text-primary" },
  { id: "admin", label: "Admin", desc: "Hospital control center", Icon: Shield, tone: "bg-warning/10 text-warning" },
];

const DEMO_ACCOUNTS: Role[] = ["patient", "doctor", "caregiver", "admin"];

const TRUST = [
  { label: "HIPAA Ready", Icon: Shield },
  { label: "Secure Auth", Icon: Lock },
  { label: "AI Powered", Icon: Sparkles },
  { label: "Real-Time Monitoring", Icon: Activity },
];

function Login() {
  const nav = useNavigate();
  const [selected, setSelected] = useState<Role>("patient");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRole(selected);
    setTimeout(() => nav({ to: "/dashboard" }), 500);
  };

  const quickSignIn = (role: Role) => {
    setSelected(role);
    setLoading(true);
    setRole(role);
    setTimeout(() => nav({ to: "/dashboard" }), 400);
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* Left hero */}
      <div className="relative hidden overflow-hidden lg:block">
        <ShaderBackground className="h-full">
          <div className="relative z-10 flex min-h-screen flex-col p-10 text-white">
            <nav className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                  <Activity className="h-5 w-5" strokeWidth={2} />
                </div>
                <span className="text-[20px] font-bold tracking-tight">MediMind AI</span>
              </div>
              <div className="flex items-center gap-6 text-[14px] font-medium text-white/80">
                {["About", "Features", "Contact"].map((l) => (
                  <button key={l} type="button" className="transition-colors hover:text-white">{l}</button>
                ))}
                <a href="https://github.com/madhesh935/medimind-ai" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 transition-colors hover:text-white">
                  <Github className="h-4 w-4" strokeWidth={2} /> GitHub
                </a>
              </div>
            </nav>

            <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[13px] font-medium">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2} /> AI-powered adherence
              </div>
              <h1 className="mt-6 text-[44px] font-bold leading-[1.08] tracking-tight">
                Smarter medication.
                <br />
                <span className="text-white/75">Better health.</span>
              </h1>
              <div className="mx-auto mt-8 grid max-w-md grid-cols-4 gap-3">
                {[
                  { k: "98%", v: "Adherence" },
                  { k: "24/7", v: "Monitoring" },
                  { k: "1500+", v: "Clinics" },
                  { k: "99.9%", v: "Uptime" },
                ].map((s) => (
                  <div key={s.k} className="rounded-2xl border border-white/15 bg-white/10 p-3">
                    <div className="text-[22px] font-bold leading-none">{s.k}</div>
                    <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-white/70">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[12px] text-white/70">
              {TRUST.map((t) => (
                <span key={t.label} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} /> {t.label}
                </span>
              ))}
            </div>
          </div>
        </ShaderBackground>
      </div>

      {/* Right login */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Activity className="h-4 w-4 text-white" strokeWidth={2} />
            </div>
            <span className="text-[17px] font-bold">MediMind AI</span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-[440px] space-y-7">
            <div>
              <h2 className="text-[32px] font-bold tracking-tight">Welcome back 👋</h2>
              <p className="mt-1.5 text-[16px] text-muted-foreground">Sign in to your health dashboard</p>
            </div>

            <div>
              <Label className="mb-3 block text-[13px] font-semibold uppercase tracking-widest text-muted-foreground">Sign in as</Label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((r) => {
                  const active = selected === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelected(r.id)}
                      className={`flex h-[72px] items-center gap-3 rounded-2xl border px-4 text-left transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] active:scale-[0.99] hover:-translate-y-0.5 hover:shadow-card ${active ? "border-primary bg-primary/[0.06] shadow-[inset_0_0_0_1px_rgba(37,99,235,0.15)]" : "border-border hover:border-primary/30 hover:bg-foreground/[0.02]"}`}
                    >
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${r.tone}`}>
                        <r.Icon className="h-7 w-7" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[15px] font-semibold">{r.label}</div>
                        <div className="truncate text-[12px] text-muted-foreground">{r.desc}</div>
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
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
                  <Input id="email" type="email" defaultValue="demo@medimind.ai" className="h-[52px] rounded-xl border-border bg-white pl-11 text-[15px] shadow-none focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-card" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
                  <Input id="password" type="password" defaultValue="password" className="h-[52px] rounded-xl border-border bg-white pl-11 text-[15px] shadow-none focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15 dark:bg-card" />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-[52px] w-full rounded-xl bg-gradient-to-r from-primary to-primary/85 text-[16px] font-semibold shadow-none transition-opacity hover:opacity-90"
              >
                {loading ? "Signing in…" : <>Continue <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2} /></>}
              </Button>
            </form>

            <div>
              <p className="mb-2.5 text-[13px] font-medium text-muted-foreground">Quick demo access</p>
              <div className="flex flex-wrap gap-2">
                {DEMO_ACCOUNTS.map((id) => {
                  const r = roles.find((x) => x.id === id)!;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => quickSignIn(id)}
                      className="rounded-full border border-border bg-card px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-center text-[12px] text-muted-foreground">By continuing you agree to our Terms & HIPAA privacy policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
