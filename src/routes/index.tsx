import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Activity, Mail, Lock, Sparkles, HeartPulse, Stethoscope, Shield, User, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setRole, type Role } from "@/lib/role-store";
import { apiLogin } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediMind AI — Intelligent Medication Adherence Platform" },
      { name: "description", content: "AI-powered medication adherence for patients, doctors and hospitals." },
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
      
      // Artificial delay for realistic loading UX (1.2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 1200));

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
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-2 relative overflow-hidden">
      {/* LEFT SIDE - HERO */}
      <div className="relative hidden overflow-hidden lg:flex bg-gradient-to-br from-indigo-600 via-blue-700 to-purple-800">
        {/* Ambient Animated Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} 
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-24 top-24 h-96 w-96 rounded-full bg-white/20 blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-fuchsia-500/30 blur-[80px]" 
        />
        
        <div className="relative z-10 flex flex-col justify-between p-16 text-white w-full">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-xl">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight shadow-sm">MediMind AI</span>
          </motion.div>

          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur-md shadow-sm">
              <Sparkles className="h-4 w-4 text-blue-200" /> AI-powered adherence
            </motion.div>
            
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="max-w-xl font-display text-6xl font-bold leading-[1.1] tracking-tight">
              Never miss a dose. <br />
              <span className="text-white/70">Live better with MediMind.</span>
            </motion.h1>
            
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="max-w-md text-lg text-white/80 font-medium">
              One platform for patients, doctors and hospitals — trusted by 50,000+ users worldwide.
            </motion.p>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="grid max-w-lg grid-cols-3 gap-4 pt-6">
              {[
                { k: "94%", v: "Avg. adherence" },
                { k: "12k+", v: "Clinicians" },
                { k: "24/7", v: "AI care" },
              ].map((s) => (
                <motion.div whileHover={{ y: -5 }} key={s.k} className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md shadow-lg transition-colors hover:bg-white/20">
                  <div className="font-display text-3xl font-bold drop-shadow-sm">{s.k}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/70 mt-1">{s.v}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-xs font-medium text-white/60 tracking-wide">
            HIPAA compliant · SOC 2 · End-to-end encrypted
          </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative">
        {/* Subtle background blob for right side */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] -z-10" />

        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md space-y-8 rounded-[2rem] border border-white bg-white/60 p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl"
        >
          <div>
            <h2 className="font-display text-4xl font-bold bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">Welcome back</h2>
            <p className="mt-2 text-sm text-muted-foreground font-medium">Sign in to your health dashboard</p>
          </div>

          <div>
            <Label className="mb-3 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">Sign in as</Label>
            <div className="grid grid-cols-2 gap-3 relative">
              {roles.map((r) => {
                const active = selected === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleSelect(r.id)}
                    className={`group relative flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-300 ${active ? "border-primary/50 bg-primary/5 shadow-md scale-[1.02]" : "border-border/50 bg-white/50 hover:border-primary/30 hover:bg-white hover:shadow-sm"}`}
                  >
                    {active && (
                       <motion.div layoutId="activeRole" className="absolute inset-0 rounded-2xl border-2 border-primary" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                    )}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${r.grad} text-white shadow-sm`}>
                      <r.Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 z-10">
                      <div className={`text-sm font-bold ${active ? "text-primary" : "text-slate-700"}`}>{r.label}</div>
                      <div className="truncate text-[10px] font-medium text-muted-foreground">{r.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-slate-700">Email Address</Label>
              <div className="relative group">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input id="email" ref={emailRef} type="email" defaultValue="patient@medimind.ai" className="h-12 rounded-xl border-border/50 bg-white/80 pl-10 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold text-slate-700">Password</Label>
                <a href="#" className="text-[11px] font-semibold text-primary hover:underline">Forgot?</a>
              </div>
              <div className="relative group">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input id="password" ref={passwordRef} type="password" defaultValue="password123" className="h-12 rounded-xl border-border/50 bg-white/80 pl-10 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium" />
              </div>
            </div>
            
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive flex items-center gap-2">
                    <Shield className="w-4 h-4" /> {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <Button type="submit" disabled={loading} className="group relative h-12 w-full overflow-hidden rounded-xl bg-gradient-primary text-base font-bold shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5">
              <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign in as {roles.find((r) => r.id === selected)!.label} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </Button>
          </form>

          <p className="text-center text-[11px] font-medium text-muted-foreground/80 pt-2">
            By continuing you agree to our <a href="#" className="text-slate-600 hover:text-primary underline decoration-slate-300 underline-offset-2">Terms</a> & <a href="#" className="text-slate-600 hover:text-primary underline decoration-slate-300 underline-offset-2">HIPAA privacy policy</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

