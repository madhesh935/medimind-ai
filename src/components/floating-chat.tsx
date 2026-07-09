import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bot, Send, X, ArrowUpRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const suggestions = [
  { label: "Adherence this week", prompt: "What's my adherence this week?" },
  { label: "Explain risk score", prompt: "Explain my risk score" },
  { label: "Next dose", prompt: "When is my next dose?" },
];

function aiReply(q: string) {
  const s = q.toLowerCase();
  if (s.includes("adherence")) return "Your adherence this week is **94%** — up 3% from last week. Keep it up!";
  if (s.includes("next dose") || s.includes("dose")) return "Your next dose is **Metformin 500mg** at **8:00 PM** — in 4 hours.";
  if (s.includes("risk")) return "Your current risk score is **Low (18/100)**. Main driver: consistent morning routine.";
  if (s.includes("take") && s.includes("today")) return "Yes — you took **Metformin at 8:03 AM** and **Lisinopril at 9:00 AM** today.";
  return "Based on your recent data, everything looks on track. Would you like a summary or a report?";
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: "150ms" }} />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: "300ms" }} />
    </div>
  );
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
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-white text-primary shadow-card transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-1 hover:shadow-lg active:scale-95 dark:bg-card"
        aria-label="Open AI chat"
      >
        <Bot className="h-[22px] w-[22px]" strokeWidth={2} />
      </button>
    );

  return (
    <div className="fixed bottom-6 right-6 z-40 flex h-[580px] w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl page-enter">
      <div className="flex items-center justify-between border-b border-border bg-card px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Bot className="h-[22px] w-[22px] text-primary" strokeWidth={2} />
          </div>
          <div>
            <div className="text-[15px] font-semibold">MediMind AI</div>
            <div className="text-[12px] text-muted-foreground">Always here to help</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => { setOpen(false); nav({ to: "/ai-assistant" }); }} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground" title="Open full chat">
            <ArrowUpRight className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
          <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground">
            <X className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-background/50 p-5">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground shadow-card" : "border border-border bg-card text-foreground shadow-card"}`}>
              {m.text.split("**").map((p, k) => k % 2 ? <strong key={k}>{p}</strong> : <span key={k}>{p}</span>)}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
              <TypingDots />
              <span className="text-[13px] text-muted-foreground">Thinking…</span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border bg-card p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s.label}
              onClick={() => send(s.prompt)}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/[0.04] hover:text-primary"
            >
              {s.label}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 rounded-xl border border-border bg-background p-1.5 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask MediMind…" className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0" />
          <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-lg shadow-none" disabled={!input.trim() || thinking}>
            {thinking ? <Loader2 className="h-[18px] w-[18px] animate-spin" strokeWidth={2} /> : <Send className="h-[18px] w-[18px]" strokeWidth={2} />}
          </Button>
        </form>
      </div>
    </div>
  );
}
