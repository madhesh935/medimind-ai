import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, Mail, Lock, ScanFace, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediMind AI — Intelligent Medication Adherence Platform" },
      {
        name: "description",
        content:
          "AI-powered medication adherence, smart pill bottles, and clinician insights. Live better with MediMind.",
      },
      { property: "og:title", content: "MediMind AI — Sign in" },
      { property: "og:description", content: "AI-powered medication adherence platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => nav({ to: "/dashboard" }), 600);
  };

  return (
    <div className="grid min-h-screen bg-gradient-hero lg:grid-cols-2">
      {/* Illustration side */}
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
              Smart bottles, voice reminders, and predictive AI insights — trusted by 50,000+
              patients and clinicians worldwide.
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

      {/* Form side */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6 rounded-3xl border border-border/60 bg-card/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-lg font-bold">MediMind AI</span>
            </div>
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your health dashboard
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" defaultValue="john@medimind.ai" className="h-11 rounded-xl pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" defaultValue="password" className="h-11 rounded-xl pl-10" />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <Checkbox id="remember" defaultChecked /> <span>Remember me</span>
              </label>
              <a className="text-primary hover:underline" href="#">
                Forgot password?
              </a>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-gradient-primary text-base font-semibold shadow-glow"
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-2 text-xs uppercase tracking-widest text-muted-foreground">
                or
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-11 rounded-xl">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22 12c0-.8-.1-1.6-.2-2.3H12v4.5h5.6c-.2 1.3-1 2.3-2.1 3v2.5h3.4c2-1.8 3.1-4.5 3.1-7.7z"/><path fill="#34A853" d="M12 22c2.8 0 5.2-.9 7-2.5l-3.4-2.5c-.9.6-2.1 1-3.6 1-2.8 0-5.1-1.9-6-4.4H2.5v2.6C4.3 19.8 7.9 22 12 22z"/><path fill="#FBBC04" d="M6 13.6c-.2-.6-.4-1.3-.4-2s.1-1.4.4-2V7H2.5C1.8 8.5 1.5 10.2 1.5 12s.4 3.5 1 5l3.5-3.4z"/><path fill="#EA4335" d="M12 5.4c1.5 0 2.9.5 4 1.5l3-3C17.2 2.3 14.8 1.4 12 1.4 7.9 1.4 4.3 3.6 2.5 7l3.5 2.6c.9-2.5 3.2-4.2 6-4.2z"/></svg>
              Google
            </Button>
            <Button variant="outline" className="h-11 rounded-xl">
              <ScanFace className="mr-2 h-4 w-4" /> Face ID
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            By continuing you agree to our Terms & HIPAA privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
