import { useState } from "react";
import { Bot, Send, Sparkles, X, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const suggestions = [
  "What's my adherence this week?",
  "Explain my risk score",
  "Reschedule tonight's dose",
  "Any drug interactions?",
];

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { role: "ai", text: "Hi John 👋 I'm MediMind AI. Ask me anything about your health." },
  ]);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [
      ...m,
      { role: "user", text },
      {
        role: "ai",
        text: "Based on your recent data, your adherence is trending upward at 94%. Keep it up! Want me to schedule a reminder?",
      },
    ]);
    setInput("");
  };

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-ai text-white shadow-glow transition-transform hover:scale-105"
        aria-label="Open AI chat"
      >
        <Sparkles className="h-6 w-6 animate-pulse" />
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
        <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 hover:bg-white/10">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border/60 p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {suggestions.slice(0, 2).map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-border/60 bg-muted/50 px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-muted"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask MediMind…"
            className="h-10 rounded-xl"
          />
          <Button type="button" size="icon" variant="outline" className="rounded-xl">
            <Mic className="h-4 w-4" />
          </Button>
          <Button type="submit" size="icon" className="rounded-xl bg-gradient-primary">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
