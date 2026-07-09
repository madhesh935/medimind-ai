import { createFileRoute } from "@tanstack/react-router";
import { PhoneCall } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/emergency-contacts")({
  component: () => (
    <PlaceholderPage title="Emergency Contacts" description="Quick access to doctors, family, and pharmacy contacts." icon={PhoneCall} />
  ),
});
