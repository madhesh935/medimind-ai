import { createFileRoute } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/medication-calendar")({
  component: () => (
    <PlaceholderPage title="Medication Calendar" description="Visualize your doses across days, weeks, and months." icon={Calendar} />
  ),
});
