import { createFileRoute } from "@tanstack/react-router";
import { NotebookPen } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/clinical-notes")({
  component: () => (
    <PlaceholderPage title="Clinical Notes" description="Structured SOAP notes with AI drafting support." icon={NotebookPen} />
  ),
});
