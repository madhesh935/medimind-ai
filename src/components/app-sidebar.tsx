import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Pill,
  Radio,
  Mic,
  Sparkles,
  FileBarChart,
  Stethoscope,
  HeartPulse,
  Bell,
  ScanLine,
  RefreshCcw,
  Settings,
  Activity,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const main = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Medication", url: "/medication", icon: Pill },
  { title: "Smart Bottle", url: "/smart-bottle", icon: Radio },
  { title: "Voice Assistant", url: "/voice", icon: Mic },
  { title: "AI Insights", url: "/insights", icon: Sparkles },
  { title: "Reports", url: "/reports", icon: FileBarChart },
];

const care = [
  { title: "Clinician", url: "/clinician", icon: Stethoscope },
  { title: "Caregiver", url: "/caregiver", icon: HeartPulse },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

const tools = [
  { title: "Prescription Scanner", url: "/scanner", icon: ScanLine },
  { title: "Refill Center", url: "/refill", icon: RefreshCcw },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (u: string) => pathname === u || pathname.startsWith(u + "/");

  const renderGroup = (label: string, items: typeof main) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.url)}
                className="data-[active=true]:bg-gradient-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-glow"
              >
                <Link to={item.url} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-border/60">
      <SidebarHeader className="px-3 py-4">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-base font-bold">MediMind</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              AI Health
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-1">
        {renderGroup("Overview", main)}
        {renderGroup("Care Team", care)}
        {renderGroup("Tools", tools)}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/60 p-3">
        <div className="glass flex items-center gap-3 rounded-xl p-3">
          <div className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </div>
          <div className="min-w-0 text-xs">
            <div className="truncate font-semibold">AI Online</div>
            <div className="truncate text-muted-foreground">GPT · Vision · Voice</div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
