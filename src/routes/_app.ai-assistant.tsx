import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Bot, Send, Sparkles,
  Loader2, Copy, Check,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { chatSuggestions } from "@/lib/mock-data";
import { useRole, roleMeta } from "@/lib/role-store";
import { sendMessage, createConversation, getStoredUser } from "@/lib/api";

export const Route = createFileRoute("/_app/ai-assistant")({ component: AIAssistant });

type Msg = { id: number; role: "user" | "ai"; text: string; card?: "adherence" | "medicine" | "risk" | "highrisk" };

function AIAssistant() {
  const role = useRole();
  const meta = roleMeta[role];

  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 1, role: "ai", text: `Hi ${meta.user.split(" ")[0]} 👋 I'm MediMind AI. Ask me about medications, adherence, risk scores, or generate a report.` },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [streaming, setStreaming] = useState<string>("");
  const [copied, setCopied] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const convIdRef = useRef<number | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, streaming, thinking]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Msg = { id: Date.now(), role: "user", text };
    setMsgs((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);

    try {
      // Lazily create a conversation on the first message
      if (!convIdRef.current) {
        const storedUser = getStoredUser();
        const userId = storedUser?.id ?? 1;
        const conv = await createConversation(userId, text.slice(0, 50));
        convIdRef.current = conv.id;
      }

      const aiMsg = await sendMessage(convIdRef.current!, text);
      setThinking(false);

      // Stream the reply character by character for a nice UX
      const fullText = aiMsg.message;
      let i = 0;
      const iv = setInterval(() => {
        i += 4;
        setStreaming(fullText.slice(0, i));
        if (i >= fullText.length) {
          clearInterval(iv);
          setStreaming("");
          setMsgs((m) => [...m, { id: aiMsg.id, role: "ai", text: fullText }]);
          inputRef.current?.focus();
        }
      }, 15);
    } catch {
      setThinking(false);
      setMsgs((m) => [...m, { id: Date.now(), role: "ai", text: "⚠️ Could not reach MediMind AI backend. Please ensure the server is running at http://localhost:8000." }]);
    }
  };


  return (
    <div className="h-[calc(100vh-8rem)]">
      {/* Chat */}
      <Card className="flex h-full flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-gradient-to-r from-background to-muted/30 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-ai text-white shadow-glow">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate font-display text-base font-bold">MediMind AI Assistant</div>
              <div className="text-xs text-muted-foreground">Your intelligent health companion</div>

            </div>
          </div>

        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-gradient-to-b from-background via-muted/10 to-background px-3 py-6 sm:px-8">
          <div className="mx-auto max-w-3xl space-y-6">
            {msgs.map((m) => (
              <MessageBubble key={m.id} msg={m} meta={meta} copied={copied === m.id} onCopy={() => { navigator.clipboard.writeText(m.text); setCopied(m.id); setTimeout(() => setCopied(null), 1500); }} />
            ))}
            {thinking && (
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-ai text-white"><Bot className="h-4 w-4" /></div>
                <div className="rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "300ms" }} />
                    <span className="ml-2 text-xs text-muted-foreground">MediMind AI is thinking…</span>
                  </div>
                </div>
              </div>
            )}
            {streaming && (
              <div className="flex items-start gap-3 animate-in fade-in">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-ai text-white"><Bot className="h-4 w-4" /></div>
                <div className="rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-sm max-w-[85%]">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {formatText(streaming)}
                    <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-primary align-middle" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {msgs.length <= 1 && (
          <div className="border-t border-border/60 bg-muted/20 px-3 py-3 sm:px-8">
            <div className="mx-auto max-w-3xl">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Suggested prompts</div>
              <div className="flex flex-wrap gap-2">
                {chatSuggestions.map((s) => (
                  <button key={s} onClick={() => send(s)} className="group flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary">
                    <Sparkles className="h-3 w-3 opacity-60 group-hover:opacity-100" />{s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-border/60 bg-background/80 p-3 backdrop-blur sm:p-4">
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-border/60 bg-card p-2 shadow-sm focus-within:border-primary/50 focus-within:shadow-glow transition-all">
            <Input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything about your medicines..." className="h-10 flex-1 border-0 bg-transparent px-2 shadow-none focus-visible:ring-0" />
            <Button type="submit" disabled={!input.trim() || thinking || !!streaming} size="icon" className="rounded-xl bg-gradient-primary shadow-glow">
              {thinking || streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
          <div className="mt-2 text-center text-[10px] text-muted-foreground">MediMind AI can make mistakes. Always consult your doctor for medical decisions.</div>
        </div>
      </Card>
    </div>
  );
}

function MessageBubble({ msg, meta, copied, onCopy }: { msg: Msg; meta: { initials: string; user: string }; copied: boolean; onCopy: () => void }) {
  const isUser = msg.role === "user";
  return (
    <div className={`group flex items-start gap-3 animate-in fade-in slide-in-from-bottom-1 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white ${isUser ? "bg-gradient-primary" : "bg-gradient-ai"}`}>
        {isUser ? <span className="text-xs font-bold">{meta.initials}</span> : <Bot className="h-4 w-4" />}
      </div>
      <div className={`min-w-0 max-w-[85%] ${isUser ? "items-end" : ""}`}>
        <div className={`rounded-2xl px-4 py-3 shadow-sm ${isUser ? "bg-gradient-primary text-primary-foreground" : "border border-border/60 bg-card"}`}>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{formatText(msg.text)}</div>
          {msg.card === "adherence" && <ReportCard />}
          {msg.card === "medicine" && <MedicineCard />}
          {msg.card === "risk" && <RiskCard />}
          {msg.card === "highrisk" && <HighRiskCard />}
        </div>
        {!isUser && (
          <div className="mt-1 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button onClick={onCopy} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
              {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
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
    <div className="mt-3 overflow-hidden rounded-2xl border border-border/60">
      <div className="bg-gradient-primary p-4 text-primary-foreground">
        <div className="text-xs uppercase tracking-widest opacity-80">Weekly report</div>
        <div className="mt-1 font-display text-3xl font-bold">94% adherence</div>
        <div className="text-xs opacity-80">Nov 4 – Nov 10 · +6% vs previous week</div>
      </div>
      <div className="grid grid-cols-3 gap-2 bg-card p-3 text-center text-xs">
        <div><div className="font-bold text-success">28</div><div className="text-muted-foreground">Taken</div></div>
        <div><div className="font-bold text-warning">2</div><div className="text-muted-foreground">Late</div></div>
        <div><div className="font-bold text-destructive">1</div><div className="text-muted-foreground">Missed</div></div>
      </div>
    </div>
  );
}
function MedicineCard() {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 to-transparent p-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white"><Sparkles className="h-5 w-5" /></div>
      <div className="flex-1"><div className="font-semibold text-sm">Metformin 500mg</div><div className="text-xs text-muted-foreground">With meals · 8:00 PM</div></div>
      <Badge className="rounded-full bg-primary/15 text-primary">In 4h</Badge>
    </div>
  );
}
function RiskCard() {
  return (
    <div className="mt-3 rounded-2xl border border-border/60 p-4">
      <div className="mb-2 flex items-center justify-between text-xs"><span className="font-semibold">Risk score</span><Badge className="rounded-full bg-success/15 text-success">Low</Badge></div>
      <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full w-[18%] rounded-full bg-gradient-to-r from-success to-primary" /></div>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground"><span>0</span><span>18 / 100</span><span>100</span></div>
    </div>
  );
}
function HighRiskCard() {
  const items = [
    { n: "Emma Wilson", s: "68%", r: "High" },
    { n: "Robert Kim", s: "61%", r: "High" },
    { n: "James Carter", s: "82%", r: "Medium" },
  ];
  return (
    <div className="mt-3 space-y-1.5">
      {items.map((i) => (
        <div key={i.n} className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-2.5">
          <div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-white text-xs font-bold">{i.n.split(" ").map((p) => p[0]).join("")}</div><div className="text-sm font-semibold">{i.n}</div></div>
          <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{i.s}</span><Badge className="rounded-full bg-destructive/15 text-destructive text-[10px]">{i.r}</Badge></div>
        </div>
      ))}
    </div>
  );
}
