import { createFileRoute } from "@tanstack/react-router";
import { ServerCog } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/system-health")({
  component: () => (
    <PlaceholderPage title="System Health" description="Real-time uptime, latency, and infrastructure metrics." icon={ServerCog} />
  ),
});
