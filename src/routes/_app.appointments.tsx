import { createFileRoute } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/appointments")({
  component: () => (
    <PlaceholderPage title="Appointments" description="Manage upcoming consultations and follow-ups." icon={Calendar} />
  ),
});
