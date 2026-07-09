import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Bot, Send, Loader2, Copy, Check, Stethoscope, BarChart3, AlertTriangle, Pill,
  FileText, Calendar, Shield,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { useRole, roleMeta } from "@/lib/role-store";

export const Route = createFileRoute("/_app/ai-assistant")({ component: AIAssistant });

type Msg = { id: number; role: "user" | "ai"; text: string; card?: "adherence" | "medicine" | "risk" | "highrisk" };

const SUGGESTIONS = [
  { icon: Stethoscope, label: "Explain my medications", prompt: "Explain my medications", tone: "bg-primary/10 text-primary" },
  { icon: BarChart3, label: "Generate adherence report", prompt: "Generate adherence report", tone: "bg-success/10 text-success" },
  { icon: AlertTriangle, label: "Analyze medication interactions", prompt: "Check interactions with Metformin", tone: "bg-warning/10 text-warning" },
  { icon: Pill, label: "What's my next dose?", prompt: "What's my next dose?", tone: "bg-primary/10 text-primary" },
];

const QUICK_ACTIONS = [
  { icon: FileText, label: "Medication Summary" },
  { icon: Pill, label: "Next Dose" },
  { icon: Calendar, label: "Today's Schedule" },
  { icon: Shield, label: "Risk Analysis" },
];

function replyFor(role: string, q: string): Msg {
  const s = q.toLowerCase();
  const id = Date.now();
  if (s.includes("adherence") || s.includes("report"))
    return { id, role: "ai", text: `Your adherence this week is **94%** — the highest in the last 30 days. Morning doses: 100%. Evening: 87%.`, card: "adherence" };
  if (s.includes("take") && s.includes("today"))
    return { id, role: "ai", text: "Yes — you took **Metformin at 8:03 AM** and **Lisinopril at 9:00 AM** today. Your next dose is Metformin at 8:00 PM." };
  if (s.includes("next dose") || s.includes("next"))
    return { id, role: "ai", text: "Your next dose is **Metformin 500mg** at **8:00 PM** — in 4 hours 12 minutes.", card: "medicine" };
  if (s.includes("interact") || s.includes("explain"))
    return { id, role: "ai", text: "**Metformin interactions to watch:**\n\n- Alcohol (increases lactic acidosis risk)\n- Contrast dyes (temporary hold advised)\n- Cimetidine (raises Metformin levels)\n\nAlways consult Dr. Patel before adding new medications." };
  if (s.includes("risk"))
    return { id, role: "ai", text: "Your risk score is **18 / 100 (Low)**. Main drivers:\n\n1. Consistent morning routine (+)\n2. Slight drop in evening adherence (−)\n3. Stable blood pressure trend (+)", card: "risk" };
  return { id, role: "ai", text: `Great question. Based on ${role === "doctor" ? "patient population data" : "your recent activity"}, everything looks on track. Ask me for a detailed report or specific medication.` };
}

function AIAssistant() {
  const role = useRole();
  const meta = roleMeta[role];
  const firstName = meta.user.split(" ")[0];

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [streaming, setStreaming] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, streaming, thinking]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { id: Date.now(), role: "user", text }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const r = replyFor(role, text);
      setThinking(false);
      let i = 0;
      const iv = setInterval(() => {
        i += 3;
        setStreaming(r.text.slice(0, i));
        if (i >= r.text.length) {
          clearInterval(iv);
          setStreaming("");
          setMsgs((m) => [...m, r]);
          inputRef.current?.focus();
        }
      }, 18);
    }, 550);
  };

  const showWelcome = msgs.length === 0 && !thinking && !streaming;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-8">
      <PageHeader title="AI Assistant" subtitle="Your intelligent health companion" showMeta={false} exportLabel="Generate Report" />

      <Card className="flex flex-1 flex-col overflow-hidden rounded-2xl border-border shadow-card">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 sm:px-10">
          <div className="mx-auto max-w-3xl">
            {showWelcome && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <Bot className="h-[22px] w-[22px] text-primary" strokeWidth={2} />
                  </div>
                  <h2 className="text-[28px] font-semibold tracking-tight">Hi {firstName} 👋</h2>
                  <p className="mt-2 text-[18px] text-muted-foreground">How can I help today?</p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {QUICK_ACTIONS.map((a) => (
                    <button
                      key={a.label}
                      type="button"
                      onClick={() => send(a.label)}
                      className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center transition-colors hover:border-primary/30 hover:bg-primary/[0.03]"
                    >
                      <a.icon className="h-[22px] w-[22px] text-primary" strokeWidth={2} />
                      <span className="text-[13px] font-medium">{a.label}</span>
                    </button>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => send(s.prompt)}
                      className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 text-left shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg"
                    >
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${s.tone}`}>
                        <s.icon className="h-[22px] w-[22px]" strokeWidth={2} />
                      </div>
                      <span className="text-[15px] font-semibold">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-8">
              {msgs.map((m) => (
                <MessageBubble key={m.id} msg={m} meta={meta} copied={copied === m.id} onCopy={() => { navigator.clipboard.writeText(m.text); setCopied(m.id); setTimeout(() => setCopied(null), 1500); }} />
              ))}
              {thinking && <TypingIndicator />}
              {streaming && <StreamingBubble text={streaming} />}
            </div>
          </div>
        </div>

        <div className="border-t border-border bg-card/80 p-4 backdrop-blur">
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-border bg-card px-4 py-2 shadow-card focus-within:border-primary/40">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Anything..."
              className="h-12 flex-1 border-0 bg-transparent px-0 text-[15px] shadow-none focus-visible:ring-0"
            />
            <Button type="submit" disabled={!input.trim() || thinking || !!streaming} size="icon" className="rounded-xl shadow-none">
              {thinking || streaming ? <Loader2 className="h-[22px] w-[22px] animate-spin" strokeWidth={2} /> : <Send className="h-[22px] w-[22px]" strokeWidth={2} />}
            </Button>
          </form>
          <p className="mx-auto mt-2 max-w-3xl text-center text-[12px] text-muted-foreground">MediMind AI can make mistakes. Always consult your doctor.</p>
        </div>
      </Card>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Bot className="h-[22px] w-[22px] text-primary" strokeWidth={2} />
      </div>
      <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "150ms" }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "300ms" }} />
          <span className="ml-2 text-[13px] text-muted-foreground">MediMind is typing…</span>
        </div>
      </div>
    </div>
  );
}

function StreamingBubble({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Bot className="h-[22px] w-[22px] text-primary" strokeWidth={2} />
      </div>
      <div className="max-w-[85%] rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
        <div className="whitespace-pre-wrap text-[15px] leading-relaxed">{formatText(text)}<span className="ml-0.5 inline-block h-4 w-1 animate-pulse bg-primary align-middle" /></div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, meta, copied, onCopy }: { msg: Msg; meta: { initials: string }; copied: boolean; onCopy: () => void }) {
  const isUser = msg.role === "user";
  return (
    <div className={`group flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isUser ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
        {isUser ? <span className="text-[13px] font-bold">{meta.initials}</span> : <Bot className="h-[22px] w-[22px]" strokeWidth={2} />}
      </div>
      <div className="min-w-0 max-w-[85%]">
        <div className={`rounded-2xl px-4 py-3 shadow-card ${isUser ? "bg-primary text-primary-foreground" : "border border-border bg-card"}`}>
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed">{formatText(msg.text)}</div>
          {msg.card === "adherence" && <ReportCard />}
          {msg.card === "medicine" && <MedicineCard />}
          {msg.card === "risk" && <RiskCard />}
        </div>
        {!isUser && (
          <button onClick={onCopy} className="mt-1 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted">
            {copied ? <Check className="h-4 w-4 text-success" strokeWidth={2} /> : <Copy className="h-4 w-4" strokeWidth={2} />}
          </button>
        )}
      </div>
    </div>
  );
}

function formatText(t: string) {
  return t.split(/(\*\*[^*]+\*\*)/g).map((seg, i) => {
    if (seg.startsWith("**") && seg.endsWith("**")) return <strong key={i}>{seg.slice(2, -2)}</strong>;
    return <span key={i}>{seg}</span>;
  });
}

function ReportCard() {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border">
      <div className="bg-primary/10 p-4">
        <div className="text-[13px] text-muted-foreground">Weekly report</div>
        <div className="text-[28px] font-bold">94% adherence</div>
      </div>
      <div className="grid grid-cols-3 gap-2 bg-card p-3 text-center text-[13px]">
        <div><div className="font-bold text-success">28</div><div className="text-muted-foreground">Taken</div></div>
        <div><div className="font-bold text-warning">2</div><div className="text-muted-foreground">Late</div></div>
        <div><div className="font-bold text-destructive">1</div><div className="text-muted-foreground">Missed</div></div>
      </div>
    </div>
  );
}

function MedicineCard() {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"><Pill className="h-[22px] w-[22px] text-primary" strokeWidth={2} /></div>
      <div className="flex-1"><div className="font-semibold text-[15px]">Metformin 500mg</div><div className="text-[13px] text-muted-foreground">With meals · 8:00 PM</div></div>
      <Badge className="rounded-full bg-primary/10 text-primary">In 4h</Badge>
    </div>
  );
}

function RiskCard() {
  return (
    <div className="mt-3 rounded-xl border border-border p-4">
      <div className="mb-2 flex items-center justify-between text-[13px]"><span className="font-semibold">Risk score</span><Badge className="rounded-full bg-success/10 text-success">Low</Badge></div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full w-[18%] rounded-full bg-success" /></div>
    </div>
  );
}
