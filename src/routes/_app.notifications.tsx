import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { notificationsByRole } from "@/lib/mock-data";
import { useRole } from "@/lib/role-store";
import { getNotificationsList, markNotificationRead, markAllNotificationsRead, type AppNotification, MOCK_NOTIFICATIONS } from "@/lib/api";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/notifications")({ component: NotificationsPage });

const SUBTITLE = {
  patient: "All your reminders, alerts, and messages in one place.",
  doctor: "Patient alerts, messages, and clinical updates in one place.",
  admin: "Platform alerts, system events, and operational updates in one place.",
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString();
}

function dotClass(type: string) {
  if (type === "risk_update") return "bg-destructive";
  if (type === "appointment") return "bg-primary";
  return "bg-muted-foreground";
}

function NotificationsPage() {
  const role = useRole();
  const [live, setLive] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [loaded, setLoaded] = useState(true);
  const [filter, setFilter] = useState<"All" | "Unread">("All");

  useEffect(() => {
    getNotificationsList()
      .then(setLive)
      .catch(() => setLive([]))
      .finally(() => setLoaded(true));
  }, []);

  const usingLive = live.length > 0;
  const filtered = live.filter((n) => filter === "All" || !n.read)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  async function handleMarkAllRead() {
    await markAllNotificationsRead().catch(() => {});
    setLive((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  }

  async function handleMarkRead(id: number) {
    const updated = await markNotificationRead(id).catch(() => null);
    if (updated) setLive((prev) => prev.map((n) => (n.id === id ? updated : n)));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Notification Center</h1>
          <p className="text-sm text-muted-foreground">{SUBTITLE[role]}</p>
        </div>
        {usingLive && (
          <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={handleMarkAllRead}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {(["All", "Unread"] as const).map((f) => (
          <Badge
            key={f}
            variant={f === filter ? "default" : "outline"}
            className="cursor-pointer rounded-full px-3 py-1"
            onClick={() => setFilter(f)}
          >
            {f}
          </Badge>
        ))}
      </div>

      {!usingLive && loaded && (
        <p className="text-xs text-muted-foreground">
          Showing sample notifications — real risk-update and appointment alerts will appear here as they happen.
        </p>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center gap-2"><Bell className="h-4 w-4" /><CardTitle className="text-base">Timeline{filter !== "All" ? ` · ${filtered.length}` : ""}</CardTitle></CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No notifications match "{filter}".</p>
          ) : (
          <ol className="relative space-y-4 border-l-2 border-border/70 pl-6">
            {filtered.map((n) => {
              const dot = dotClass(n.type);
              return (
                <li key={n.id} className="relative">
                  <span className={`absolute -left-[30px] top-1 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-background ${dot}`} />
                  <div
                    className={`rounded-2xl border border-border/60 bg-card p-4 ${!n.read ? "cursor-pointer hover:bg-muted/20" : ""}`}
                    onClick={!n.read ? () => handleMarkRead(n.id) : undefined}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-semibold">{n.title}</div>
                      <Badge variant="outline" className="rounded-full text-[10px] capitalize">{n.type.replace("_", " ")}</Badge>
                      {!n.read && <Badge className="rounded-full text-[10px] bg-primary/15 text-primary">New</Badge>}
                      <div className="ml-auto text-xs text-muted-foreground">{timeAgo(n.created_at)}</div>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">{n.message}</div>
                  </div>
                </li>
              );
            })}
          </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
