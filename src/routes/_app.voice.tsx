import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Mic, Send, Volume2, Bot, Sparkles, Languages } from "lucide-react";
import { conversation, voiceCommands } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/voice")({ component: VoicePage });

function VoicePage() {
  const [listening, setListening] = useState(false);
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Voice Assistant</h1>
          <p className="text-sm text-muted-foreground">Talk to MediMind — hands-free, natural, multilingual.</p>
        </div>
        <Badge className="rounded-full bg-accent/15 text-accent"><Sparkles className="mr-1 h-3 w-3" />Neural TTS · v3</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-ai opacity-95" />
          <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-primary/40 blur-3xl" />
          <CardContent className="relative flex min-h-[420px] flex-col items-center justify-center p-8 text-white">
            <button
              onClick={() => setListening(!listening)}
              className="relative flex h-40 w-40 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-transform hover:scale-105"
            >
              {listening && (
                <>
                  <span className="absolute inset-0 rounded-full bg-white/30 animate-pulse-ring" />
                  <span className="absolute inset-0 rounded-full bg-white/20 animate-pulse-ring" style={{ animationDelay: ".5s" }} />
                </>
              )}
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white text-accent shadow-glow">
                <Mic className="h-12 w-12" />
              </div>
            </button>
            <div className="mt-8 text-center">
              <div className="font-display text-2xl font-bold">{listening ? "Listening…" : "Tap to speak"}</div>
              <div className="mt-1 text-sm opacity-80">Or type your question below</div>
            </div>

            {/* waveform */}
            <div className="mt-6 flex h-16 items-end gap-1">
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-white/70"
                  style={{
                    height: `${20 + Math.abs(Math.sin(i / 2 + (listening ? Date.now() / 200 : 0))) * 40}px`,
                    animation: listening ? `pulse 1s ${i * 0.05}s infinite alternate` : undefined,
                  }}
                />
              ))}
            </div>

            <div className="mt-8 flex w-full max-w-md items-center gap-2">
              <Input placeholder="Ask MediMind…" className="h-11 rounded-xl border-white/30 bg-white/15 text-white placeholder:text-white/60" />
              <Button size="icon" className="h-11 w-11 rounded-xl bg-white text-accent hover:bg-white/90"><Send className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Suggested commands</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {voiceCommands.map((c) => (
                <button key={c} className="rounded-full border border-border/60 bg-muted/50 px-3 py-1.5 text-xs hover:bg-muted">
                  {c}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Languages className="h-4 w-4" />Voice settings</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="mb-1 text-xs text-muted-foreground">Language</div>
                <div className="flex flex-wrap gap-1.5">
                  {["English", "Tamil", "Hindi", "Telugu"].map((l, i) => (
                    <Badge key={l} variant={i === 0 ? "default" : "outline"} className="cursor-pointer rounded-full">{l}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs text-muted-foreground">Voice</div>
                <div className="flex gap-1.5">
                  <Badge className="rounded-full">Female</Badge>
                  <Badge variant="outline" className="rounded-full">Male</Badge>
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs text-muted-foreground">Speed</div>
                <input type="range" defaultValue={50} className="w-full accent-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Conversation history</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {conversation.map((c, i) => (
            <div key={i} className={`flex items-start gap-3 ${c.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${c.role === "user" ? "bg-primary text-primary-foreground" : "bg-gradient-ai text-white"}`}>
                {c.role === "user" ? "J" : <Bot className="h-4 w-4" />}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${c.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {c.text}
                {c.role === "ai" && (
                  <button className="ml-2 inline-flex text-muted-foreground hover:text-primary"><Volume2 className="h-3.5 w-3.5" /></button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
