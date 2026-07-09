import { createFileRoute } from "@tanstack/react-router";
import { History } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/patient-history")({
  component: () => (
    <PlaceholderPage title="Patient History" description="Longitudinal timeline of adherence, vitals, and interventions." icon={History} />
  ),
});
