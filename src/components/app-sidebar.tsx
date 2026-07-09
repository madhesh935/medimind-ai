import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Pill, Radio, Bot, FileBarChart, Bell, ScanLine, RefreshCcw,
  Settings, Activity, Users, Stethoscope, HardDrive, ScrollText, LineChart,
  HeartPulse, AlertTriangle, ClipboardList,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter,
} from "@/components/ui/sidebar";
import { useRole, type Role } from "@/lib/role-store";

type Item = { title: string; url: string; icon: LucideIcon };

const menus: Record<Role, { label: string; items: Item[] }[]> = {
  patient: [
    { label: "Overview", items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Medication", url: "/medication", icon: Pill },
      { title: "Smart Bottle", url: "/smart-bottle", icon: Radio },
      { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
    ]},
    { label: "Insights", items: [
      { title: "Reports", url: "/reports", icon: FileBarChart },
      { title: "Notifications", url: "/notifications", icon: Bell },
    ]},
    { label: "Tools", items: [
      { title: "Prescription Scanner", url: "/scanner", icon: ScanLine },
      { title: "Refill Center", url: "/refill", icon: RefreshCcw },
      { title: "Settings", url: "/settings", icon: Settings },
    ]},
  ],
  caregiver: [
    { label: "Overview", items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Assigned Patients", url: "/patients", icon: HeartPulse },
      { title: "Medication Status", url: "/medication-status", icon: Pill },
      { title: "Alerts", url: "/alerts", icon: AlertTriangle },
    ]},
    { label: "Insights", items: [
      { title: "Reports", url: "/reports", icon: FileBarChart },
      { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
      { title: "Notifications", url: "/notifications", icon: Bell },
    ]},
    { label: "Tools", items: [
      { title: "Settings", url: "/settings", icon: Settings },
    ]},
  ],
  doctor: [
    { label: "Overview", items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Patients", url: "/patients", icon: Users },
      { title: "Prescriptions", url: "/prescriptions", icon: ClipboardList },
    ]},
    { label: "Insights", items: [
      { title: "Reports", url: "/reports", icon: FileBarChart },
      { title: "Analytics", url: "/analytics", icon: LineChart },
      { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
    ]},
    { label: "Tools", items: [
      { title: "Notifications", url: "/notifications", icon: Bell },
      { title: "Settings", url: "/settings", icon: Settings },
    ]},
  ],
  admin: [
    { label: "Overview", items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Users", url: "/users", icon: Users },
      { title: "Doctors", url: "/doctors", icon: Stethoscope },
      { title: "Patients", url: "/patients", icon: HeartPulse },
    ]},
    { label: "Platform", items: [
      { title: "Devices", url: "/devices", icon: HardDrive },
      { title: "Analytics", url: "/analytics", icon: LineChart },
      { title: "Reports", url: "/reports", icon: FileBarChart },
      { title: "Audit Logs", url: "/audit-logs", icon: ScrollText },
    ]},
    { label: "Tools", items: [
      { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
      { title: "Settings", url: "/settings", icon: Settings },
    ]},
  ],
};

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const role = useRole();
  const isActive = (u: string) => pathname === u || pathname.startsWith(u + "/");

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
        {menus[role].map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
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
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/60 p-3">
        <div className="glass flex items-center gap-3 rounded-xl p-3">
          <div className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </div>
          <div className="min-w-0 text-xs">
            <div className="truncate font-semibold">AI Online</div>
            <div className="truncate text-muted-foreground">GPT · Vision · Care</div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
