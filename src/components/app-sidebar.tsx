import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Pill, Radio, Bot, FileBarChart, Bell, ScanLine, RefreshCcw,
  Settings, Activity, Users, Stethoscope, HardDrive, ScrollText, LineChart,
  HeartPulse, AlertTriangle, ClipboardList, Calendar, PhoneCall, History,
  BookOpen, NotebookPen, SlidersHorizontal, ServerCog, LogOut,
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
      { title: "Settings", url: "/settings", icon: Settings },
      { title: "Logout", url: "/", icon: LogOut },
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
      { title: "Settings", url: "/settings", icon: Settings },
      { title: "Logout", url: "/", icon: LogOut },
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
      { title: "Settings", url: "/settings", icon: Settings },
      { title: "Logout", url: "/", icon: LogOut },
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
      { title: "Settings", url: "/settings", icon: Settings },
      { title: "Logout", url: "/", icon: LogOut },
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
      className="border-r border-border/60 [&_[data-slot=sidebar-container]]:transition-[width,left,right] [&_[data-slot=sidebar-container]]:duration-300 [&_[data-slot=sidebar-container]]:ease-out [&_[data-slot=sidebar-gap]]:transition-[width] [&_[data-slot=sidebar-gap]]:duration-300 [&_[data-slot=sidebar-gap]]:ease-out"
    >
      {/* Logo */}
      <SidebarHeader className="h-[72px] shrink-0 flex-row items-center gap-3 border-b border-border/50 px-5 py-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <Link to="/dashboard" className="flex h-full w-full items-center gap-3 overflow-hidden group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-primary shadow-glow transition-transform duration-300 hover:scale-105">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div className={`flex min-w-0 flex-col leading-tight transition-all duration-300 ${collapsed ? "hidden" : "flex"}`}>
            <span className="font-display text-base font-bold truncate">MediMind</span>
            <span className="text-[10px] font-semibold uppercase tracking-[1.2px] text-muted-foreground truncate">
              AI Health
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex flex-col px-4 pt-3 pb-4 group-data-[collapsible=icon]:px-3">
        <TooltipProvider delayDuration={0}>
          {groups.map((items, gi) => (
            <div
              key={gi}
              className={`flex flex-col gap-2 ${gi > 0 ? "mt-5 pt-5 border-t border-[#E5E7EB] dark:border-white/10" : ""}`}
            >
              {items.map((item) => {
                const active = isActive(item.url);
                const btn = (
                  <Link
                    to={item.url}
                    data-active={active}
                    className={[
                      "group/item relative flex h-12 items-center gap-3 rounded-[14px] px-4 text-[15px] font-medium",
                      "transition-all duration-300 ease-out",
                      active
                        ? "bg-gradient-primary text-white shadow-[0_6px_20px_-6px_rgba(99,102,241,0.55)]"
                        : "text-foreground/80 hover:bg-muted/60 hover:text-foreground",
                      collapsed ? "justify-center px-0 w-12 mx-auto" : "",
                    ].join(" ")}
                  >
                    <item.icon className="h-5 w-5 shrink-0" strokeWidth={2} />
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
