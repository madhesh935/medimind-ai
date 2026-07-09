import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { notifications } from "@/lib/mock-data";
import { Bell, Filter } from "lucide-react";

export const Route = createFileRoute("/_app/notifications")({ component: NotificationsPage });

function NotificationsPage() {
  const filters = ["All", "Unread", "Critical", "Medication", "Voice", "AI"];
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Notification Center</h1>
          <p className="text-sm text-muted-foreground">All your reminders, alerts, and messages in one place.</p>
        </div>
        <Button variant="outline" className="rounded-xl"><Filter className="mr-1.5 h-4 w-4" />Filters</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f, i) => (
          <Badge key={f} variant={i === 0 ? "default" : "outline"} className="cursor-pointer rounded-full px-3 py-1">{f}</Badge>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2"><Bell className="h-4 w-4" /><CardTitle className="text-base">Timeline</CardTitle></CardHeader>
        <CardContent>
          <ol className="relative space-y-4 border-l-2 border-border/70 pl-6">
            {[...notifications, ...notifications].map((n, i) => (
              <li key={i} className="relative">
                <span className={`absolute -left-[30px] top-1 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-background ${n.type === "danger" ? "bg-destructive" : n.type === "warning" ? "bg-warning" : n.type === "success" ? "bg-success" : "bg-primary"}`} />
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-semibold">{n.title}</div>
                    <Badge variant="outline" className="rounded-full text-[10px]">{n.channel}</Badge>
                    <div className="ml-auto text-xs text-muted-foreground">{n.time}</div>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{n.body}</div>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
