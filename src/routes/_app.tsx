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
        "--sidebar-width": "250px",
        "--sidebar-width-icon": "88px",
      } as React.CSSProperties}
    >
      <AppSidebar />
      <SidebarInset className="min-h-screen bg-gradient-hero">
        <TopNavbar />
        <main className="page-enter flex-1 px-6 py-8 lg:px-10 lg:py-10">
          <div className="mx-auto w-full max-w-[1280px]">
            <Outlet />
          </div>
        </main>
        <FloatingChat />
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}
