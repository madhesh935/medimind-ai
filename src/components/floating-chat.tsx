import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bot, Send, X, ArrowUpRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const suggestions = [
  "What's my adherence this week?",
  "Explain my risk score",
  "When is my next dose?",
];

function aiReply(q: string) {
  const s = q.toLowerCase();
  if (s.includes("adherence")) return "Your adherence this week is **94%** — up 3% from last week. Keep it up!";
  if (s.includes("next dose") || s.includes("dose")) return "Your next dose is **Metformin 500mg** at **8:00 PM** — in 4 hours.";
  if (s.includes("risk")) return "Your current risk score is **Low (18/100)**. Main driver: consistent morning routine.";
  if (s.includes("take") && s.includes("today")) return "Yes — you took **Metformin at 8:03 AM** and **Lisinopril at 9:00 AM** today.";
  return "Based on your recent data, everything looks on track. Would you like a summary or a report?";
}

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [thinking, setThinking] = useState(false);
  const nav = useNavigate();
  const [msgs, setMsgs] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hi 👋 I'm MediMind AI. Ask me anything about your health." },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, thinking]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { role: "ai", text: aiReply(text) }]);
      setThinking(false);
    }, 700);
  };

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-ai text-white shadow-glow transition-transform hover:scale-110"
        aria-label="Open AI chat"
        style={{ boxShadow: "0 0 40px oklch(0.53 0.26 292 / 0.6)" }}
      >
        <span className="absolute inset-0 rounded-full bg-gradient-ai opacity-70 blur-xl animate-pulse" />
        <Bot className="relative h-6 w-6" />
      </button>
    );

  return (
    <div className="fixed bottom-6 right-6 z-40 flex h-[560px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between border-b border-border/60 bg-gradient-ai p-4 text-white">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">MediMind AI</div>
            <div className="text-[11px] opacity-80">Always here to help</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => { setOpen(false); nav({ to: "/ai-assistant" }); }} className="rounded-lg p-1.5 hover:bg-white/10" title="Open full chat">
            <ArrowUpRight className="h-4 w-4" />
          </button>
          <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-1`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "border border-border/60 bg-muted/60 text-foreground"}`}>
              {m.text.split("**").map((p, k) => k % 2 ? <strong key={k}>{p}</strong> : <span key={k}>{p}</span>)}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/60 px-3.5 py-2.5 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border/60 p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button key={s} onClick={() => send(s)} className="rounded-full border border-border/60 bg-muted/50 px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-muted">
              {s}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask MediMind…" className="h-10 rounded-xl" />
          <Button type="submit" size="icon" className="rounded-xl bg-gradient-primary">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
