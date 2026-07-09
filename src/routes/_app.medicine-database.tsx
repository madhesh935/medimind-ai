import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/medicine-database")({
  component: () => (
    <PlaceholderPage title="Medicine Database" description="Search dosage, interactions, and clinical references." icon={BookOpen} />
  ),
});
