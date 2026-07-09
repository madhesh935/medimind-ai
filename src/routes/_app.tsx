import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopNavbar } from "@/components/top-navbar";
import { FloatingChat } from "@/components/floating-chat";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "280px",
        "--sidebar-width-icon": "80px",
      } as React.CSSProperties}
    >
      <AppSidebar />
      <SidebarInset className="min-h-screen bg-gradient-hero">
        <TopNavbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
        <FloatingChat />
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}
