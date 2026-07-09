import { createFileRoute } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/platform-settings")({
  component: () => (
    <PlaceholderPage title="Platform Settings" description="Tenant configuration, branding, and compliance policies." icon={SlidersHorizontal} />
  ),
});
