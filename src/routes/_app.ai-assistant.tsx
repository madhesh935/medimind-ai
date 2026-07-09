import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Bot, Send, Paperclip, FileImage, Sparkles, Search, Plus, Pin, Trash2, Pencil,
  Loader2, User, Copy, Check, MoreVertical,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chatSuggestions, chatHistoryGroups } from "@/lib/mock-data";
import { useRole, roleMeta } from "@/lib/role-store";

export const Route = createFileRoute("/_app/ai-assistant")({ component: AIAssistant });

type Msg = { id: number; role: "user" | "ai"; text: string; card?: "adherence" | "medicine" | "risk" | "highrisk" };

function replyFor(role: string, q: string): Msg {
  const s = q.toLowerCase();
  const id = Date.now();
  if (s.includes("adherence") && !s.includes("report"))
    return { id, role: "ai", text: `Your adherence this week is **94%** — the highest in the last 30 days. Morning doses: 100%. Evening: 87%.`, card: "adherence" };
  if (s.includes("report") || s.includes("summarize"))
    return { id, role: "ai", text: "Here's your weekly health report card:", card: "adherence" };
  if (s.includes("take") && s.includes("today"))
    return { id, role: "ai", text: "Yes ✅ — you took **Metformin at 8:03 AM** and **Lisinopril at 9:00 AM** today. Your next dose is Metformin at 8:00 PM." };
  if (s.includes("next dose"))
    return { id, role: "ai", text: "Your next dose is **Metformin 500mg** at **8:00 PM** — in 4 hours 12 minutes.", card: "medicine" };
  if (s.includes("interact") && s.includes("metformin"))
    return { id, role: "ai", text: "**Metformin interactions to watch:**\n\n- Alcohol (increases lactic acidosis risk)\n- Contrast dyes (temporary hold advised)\n- Cimetidine (raises Metformin levels)\n\nAlways consult Dr. Patel before adding new medications." };
  if (s.includes("risk"))
    return { id, role: "ai", text: "Your risk score is **18 / 100 (Low)**. Main drivers:\n\n1. Consistent morning routine (+)\n2. Slight drop in evening adherence (−)\n3. Stable blood pressure trend (+)", card: "risk" };
  if (s.includes("high risk") || s.includes("high-risk"))
    return { id, role: "ai", text: "There are **12 high-risk patients** this week:", card: "highrisk" };
  if (s.includes("refill"))
    return { id, role: "ai", text: "**Refill status:**\n- Metformin: 24 pills (12 days)\n- Lisinopril: 18 pills (18 days)\n- Atorvastatin: 12 pills (12 days) ⚠️\n- Aspirin: 30 pills (30 days)" };
  if (s.includes("did") && s.includes("john"))
    return { id, role: "ai", text: "Yes — **John took today's medicines**. Metformin at 8:04 AM, Lisinopril at 9:00 AM." };
  return { id, role: "ai", text: `Great question. Based on ${role === "doctor" ? "patient population data" : "your recent activity"}, everything looks on track. Ask me for a detailed report or specific medication.` };
}

function AIAssistant() {
  const role = useRole();
  const meta = roleMeta[role];
  const [activeId, setActiveId] = useState("t1");
  const [search, setSearch] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 1, role: "ai", text: `Hi ${meta.user.split(" ")[0]} 👋 I'm MediMind AI. Ask me about medications, adherence, risk scores, or generate a report.` },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [streaming, setStreaming] = useState<string>("");
  const [copied, setCopied] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, streaming, thinking]);

  useEffect(() => { inputRef.current?.focus(); }, [activeId]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Msg = { id: Date.now(), role: "user", text };
    setMsgs((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const r = replyFor(role, text);
      setThinking(false);
      // stream
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

  const filteredGroups = chatHistoryGroups.map((g) => ({
    ...g,
    items: g.items.filter((i) => i.title.toLowerCase().includes(search.toLowerCase())),
  })).filter((g) => g.items.length);

  const newChat = () => {
    setMsgs([{ id: Date.now(), role: "ai", text: `New conversation started. How can I help you, ${meta.user.split(" ")[0]}?` }]);
    setActiveId(`t${Date.now()}`);
  };

  return (
    <div className="grid h-[calc(100vh-8rem)] gap-4 lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <Card className="hidden flex-col overflow-hidden lg:flex">
        <div className="border-b border-border/60 p-3">
          <Button onClick={newChat} className="w-full rounded-xl bg-gradient-primary shadow-glow">
            <Plus className="mr-2 h-4 w-4" /> New chat
          </Button>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search chats…" className="h-9 rounded-xl pl-9 text-xs" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-4 p-3">
            {chatHistoryGroups[0].items.some((i) => i.pinned) && (
              <div>
                <div className="mb-1 flex items-center gap-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <Pin className="h-3 w-3" /> Pinned
                </div>
                {chatHistoryGroups[0].items.filter((i) => i.pinned).map((c) => (
                  <ChatItem key={c.id} title={c.title} preview={c.preview} active={activeId === c.id} onClick={() => setActiveId(c.id)} />
                ))}
              </div>
            )}
            {filteredGroups.map((g) => (
              <div key={g.label}>
                <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{g.label}</div>
                {g.items.map((c) => (
                  <ChatItem key={c.id} title={c.title} preview={c.preview} active={activeId === c.id} onClick={() => setActiveId(c.id)} />
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat */}
      <Card className="flex flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-gradient-to-r from-background to-muted/30 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-ai text-white shadow-glow">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate font-display text-base font-bold">MediMind AI Assistant</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" /> Online · GPT-4 Health · streaming
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge className="hidden rounded-full bg-gradient-ai text-white border-0 sm:inline-flex"><Sparkles className="mr-1 h-3 w-3" />Pro</Badge>
            <Button variant="ghost" size="icon" onClick={newChat} className="rounded-xl"><Plus className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="rounded-xl"><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="rounded-xl text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
            <Button type="button" size="icon" variant="ghost" className="rounded-xl" title="Attach file"><Paperclip className="h-4 w-4" /></Button>
            <Button type="button" size="icon" variant="ghost" className="rounded-xl" title="Upload prescription"><FileImage className="h-4 w-4" /></Button>
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

function ChatItem({ title, preview, active, onClick }: { title: string; preview: string; active: boolean; onClick: () => void }) {
  return (
    <div className={`group mb-1 flex cursor-pointer items-start gap-2 rounded-xl border p-2.5 transition-all ${active ? "border-primary/40 bg-primary/5" : "border-transparent hover:border-border/60 hover:bg-muted/40"}`} onClick={onClick}>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold">{title}</div>
        <div className="truncate text-[11px] text-muted-foreground">{preview}</div>
      </div>
      <MoreVertical className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-70" />
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
