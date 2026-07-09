import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Pill, Radio, Bot, FileBarChart, Bell, ScanLine, RefreshCcw,
  Settings, Activity, Users, Stethoscope, HardDrive, ScrollText, LineChart,
  HeartPulse, AlertTriangle, ClipboardList, Calendar, PhoneCall, History,
  BookOpen, NotebookPen, SlidersHorizontal, ServerCog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useRole, type Role } from "@/lib/role-store";

type Item = { title: string; url: string; icon: LucideIcon };

const menus: Record<Role, Item[][]> = {
  patient: [
    [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Medication", url: "/medication", icon: Pill },
      { title: "Smart Bottle", url: "/smart-bottle", icon: Radio },
      { title: "Medication Calendar", url: "/medication-calendar", icon: Calendar },
    ],
    [
      { title: "Reports", url: "/reports", icon: FileBarChart },
      { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
      { title: "Notifications", url: "/notifications", icon: Bell },
    ],
    [
      { title: "Prescription Scanner", url: "/scanner", icon: ScanLine },
      { title: "Refill Center", url: "/refill", icon: RefreshCcw },
    ],
  ],
  caregiver: [
    [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Assigned Patients", url: "/patients", icon: HeartPulse },
      { title: "Medication Status", url: "/medication-status", icon: Pill },
      { title: "Alerts", url: "/alerts", icon: AlertTriangle },
    ],
    [
      { title: "Reports", url: "/reports", icon: FileBarChart },
      { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
      { title: "Notifications", url: "/notifications", icon: Bell },
    ],
    [
      { title: "Emergency Contacts", url: "/emergency-contacts", icon: PhoneCall },
      { title: "Patient History", url: "/patient-history", icon: History },
    ],
  ],
  doctor: [
    [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Patients", url: "/patients", icon: Users },
      { title: "Prescriptions", url: "/prescriptions", icon: ClipboardList },
      { title: "Appointments", url: "/appointments", icon: Calendar },
    ],
    [
      { title: "Reports", url: "/reports", icon: FileBarChart },
      { title: "Analytics", url: "/analytics", icon: LineChart },
      { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
      { title: "Notifications", url: "/notifications", icon: Bell },
    ],
    [
      { title: "Medicine Database", url: "/medicine-database", icon: BookOpen },
      { title: "Clinical Notes", url: "/clinical-notes", icon: NotebookPen },
    ],
  ],
  admin: [
    [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Users", url: "/users", icon: Users },
      { title: "Doctors", url: "/doctors", icon: Stethoscope },
      { title: "Patients", url: "/patients", icon: HeartPulse },
      { title: "Devices", url: "/devices", icon: HardDrive },
    ],
    [
      { title: "Analytics", url: "/analytics", icon: LineChart },
      { title: "Reports", url: "/reports", icon: FileBarChart },
      { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
      { title: "Notifications", url: "/notifications", icon: Bell },
    ],
    [
      { title: "Audit Logs", url: "/audit-logs", icon: ScrollText },
      { title: "Platform Settings", url: "/platform-settings", icon: SlidersHorizontal },
      { title: "System Health", url: "/system-health", icon: ServerCog },
    ],
  ],
};

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const role = useRole();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const isActive = (u: string) => pathname === u || pathname.startsWith(u + "/");
  const groups = menus[role];

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar [&_[data-slot=sidebar-container]]:transition-[width,left,right] [&_[data-slot=sidebar-container]]:duration-300 [&_[data-slot=sidebar-container]]:ease-out [&_[data-slot=sidebar-gap]]:transition-[width] [&_[data-slot=sidebar-gap]]:duration-300 [&_[data-slot=sidebar-gap]]:ease-out"
    >
      {/* Logo */}
      <SidebarHeader className="mb-6 flex h-20 shrink-0 flex-row items-center gap-3.5 border-b border-sidebar-border px-6 group-data-[collapsible=icon]:mb-0 group-data-[collapsible=icon]:h-20 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <Link to="/dashboard" className="flex w-full items-center gap-3.5 overflow-hidden group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-card">
            <Activity className="h-[24px] w-[24px] animate-heartbeat text-white" strokeWidth={2} />
          </div>
          <div className={`flex min-w-0 flex-col gap-0.5 leading-tight transition-all duration-300 ${collapsed ? "hidden" : "flex"}`}>
            <span className="text-[22px] font-bold tracking-tight truncate">MediMind</span>
            <span className="text-[13px] font-medium text-muted-foreground truncate">AI Health Platform</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex flex-col gap-1 px-4 pb-6 pt-4 group-data-[collapsible=icon]:px-2.5">
        <TooltipProvider delayDuration={0}>
          {groups.map((items, gi) => (
            <div key={gi} className="flex flex-col gap-0.5">
              {gi > 0 && !collapsed && (
                <div className="mx-2 my-2 h-px bg-border/80" />
              )}
              {items.map((item) => {
                const active = isActive(item.url);
                const btn = (
                  <Link
                    to={item.url}
                    data-active={active}
                    className={[
                      "group/item relative flex h-[52px] items-center gap-3.5 rounded-xl px-4 text-[15px] font-medium",
                      "transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
                      active
                        ? "bg-[#DBEAFE] font-semibold text-primary shadow-[inset_0_0_0_1px_rgba(37,99,235,0.12)]"
                        : "text-sidebar-foreground/70 hover:bg-[#EFF6FF] hover:text-sidebar-foreground",
                      collapsed ? "justify-center px-0 w-11 mx-auto" : "",
                    ].join(" ")}
                  >
                    <item.icon
                      className={["h-[22px] w-[22px] shrink-0", active ? "text-primary" : ""].join(" ")}
                      strokeWidth={2}
                    />
                    {!collapsed && <span className="truncate">{item.title}</span>}
                  </Link>
                );
                return collapsed ? (
                  <Tooltip key={item.title}>
                    <TooltipTrigger asChild>{btn}</TooltipTrigger>
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  </Tooltip>
                ) : (
                  <div key={item.title}>{btn}</div>
                );
              })}
            </div>
          ))}
        </TooltipProvider>
      </SidebarContent>
    </Sidebar>
  );
}
