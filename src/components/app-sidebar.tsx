import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Pill, Radio, Bot, FileBarChart, Bell, ScanLine, RefreshCcw,
  Settings, Activity, Users, Stethoscope, HardDrive, ScrollText, LineChart,
  HeartPulse, AlertTriangle, ClipboardList, Calendar, PhoneCall, History,
  BookOpen, NotebookPen, SlidersHorizontal, ServerCog, LogOut, Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRole, roleMeta, type Role } from "@/lib/role-store";

type Item = { title: string; url: string; icon: LucideIcon; action?: "logout" };
type Group = { label: "Overview" | "Insights" | "Tools"; items: Item[] };

const LOGOUT: Item = { title: "Logout", url: "/", icon: LogOut, action: "logout" };

const menus: Record<Role, Group[]> = {
  patient: [
    { label: "Overview", items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Medication", url: "/medication", icon: Pill },
      { title: "Smart Bottle", url: "/smart-bottle", icon: Radio },
      { title: "Medication Calendar", url: "/medication-calendar", icon: Calendar },
    ]},
    { label: "Insights", items: [
      { title: "Reports", url: "/reports", icon: FileBarChart },
      { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
      { title: "Notifications", url: "/notifications", icon: Bell },
    ]},
    { label: "Tools", items: [
      { title: "Prescription Scanner", url: "/scanner", icon: ScanLine },
      { title: "Refill Center", url: "/refill", icon: RefreshCcw },
      { title: "Settings", url: "/settings", icon: Settings },
      LOGOUT,
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
      { title: "Emergency Contacts", url: "/emergency-contacts", icon: PhoneCall },
      { title: "Patient History", url: "/patient-history", icon: History },
      { title: "Settings", url: "/settings", icon: Settings },
      LOGOUT,
    ]},
  ],
  doctor: [
    { label: "Overview", items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Patients", url: "/patients", icon: Users },
      { title: "Prescriptions", url: "/prescriptions", icon: ClipboardList },
      { title: "Appointments", url: "/appointments", icon: Calendar },
    ]},
    { label: "Insights", items: [
      { title: "Reports", url: "/reports", icon: FileBarChart },
      { title: "Analytics", url: "/analytics", icon: LineChart },
      { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
      { title: "Notifications", url: "/notifications", icon: Bell },
    ]},
    { label: "Tools", items: [
      { title: "Medicine Database", url: "/medicine-database", icon: BookOpen },
      { title: "Clinical Notes", url: "/clinical-notes", icon: NotebookPen },
      { title: "Settings", url: "/settings", icon: Settings },
      LOGOUT,
    ]},
  ],
  admin: [
    { label: "Overview", items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Users", url: "/users", icon: Users },
      { title: "Doctors", url: "/doctors", icon: Stethoscope },
      { title: "Patients", url: "/patients", icon: HeartPulse },
      { title: "Devices", url: "/devices", icon: HardDrive },
    ]},
    { label: "Insights", items: [
      { title: "Analytics", url: "/analytics", icon: LineChart },
      { title: "Reports", url: "/reports", icon: FileBarChart },
      { title: "AI Assistant", url: "/ai-assistant", icon: Bot },
      { title: "Notifications", url: "/notifications", icon: Bell },
    ]},
    { label: "Tools", items: [
      { title: "Audit Logs", url: "/audit-logs", icon: ScrollText },
      { title: "Platform Settings", url: "/platform-settings", icon: SlidersHorizontal },
      { title: "System Health", url: "/system-health", icon: ServerCog },
      { title: "Settings", url: "/settings", icon: Settings },
      LOGOUT,
    ]},
  ],
};

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const role = useRole();
  const meta = roleMeta[role];
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const nav = useNavigate();
  const isActive = (u: string) => pathname === u || pathname.startsWith(u + "/");

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/60 [&_[data-slot=sidebar-container]]:transition-[width,left,right] [&_[data-slot=sidebar-container]]:duration-300 [&_[data-slot=sidebar-container]]:ease-out [&_[data-slot=sidebar-gap]]:transition-[width] [&_[data-slot=sidebar-gap]]:duration-300 [&_[data-slot=sidebar-gap]]:ease-out"
    >
      <SidebarHeader className="px-3 py-4">
        <Link to="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-primary shadow-glow transition-transform duration-300 hover:scale-105">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div className={`flex flex-col leading-tight transition-all duration-300 ${collapsed ? "w-0 -translate-x-2 opacity-0" : "w-auto translate-x-0 opacity-100"}`}>
            <span className="font-display text-base font-bold whitespace-nowrap">MediMind</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground whitespace-nowrap">
              AI Health
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-1">
        {menus[role].map((group) => (
          <SidebarGroup key={group.label} className="animate-fade-in">
            <SidebarGroupLabel
              className={`text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 transition-all duration-300 ${collapsed ? "h-0 opacity-0 overflow-hidden" : "opacity-100"}`}
            >
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = item.action !== "logout" && isActive(item.url);
                  const inner = (
                    <span className="relative flex w-full items-center gap-3">
                      {active && (
                        <span className="absolute -left-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.7)] animate-scale-in" />
                      )}
                      <item.icon className={`h-4 w-4 shrink-0 transition-transform duration-200 ${active ? "text-white" : ""} group-hover/menu-item:scale-110`} />
                      <span
                        className={`truncate transition-all duration-300 ${collapsed ? "w-0 -translate-x-2 opacity-0" : "w-auto opacity-100"} ${item.action === "logout" ? "text-destructive" : ""}`}
                      >
                        {item.title}
                      </span>
                    </span>
                  );
                  return (
                    <SidebarMenuItem key={item.title} className="group/menu-item">
                      <SidebarMenuButton
                        asChild={item.action !== "logout"}
                        isActive={active}
                        tooltip={item.title}
                        className={`transition-all duration-200 hover:bg-muted/70 data-[active=true]:bg-gradient-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-glow ${item.action === "logout" ? "text-destructive hover:bg-destructive/10 hover:text-destructive" : ""}`}
                        onClick={
                          item.action === "logout"
                            ? () => nav({ to: "/" })
                            : undefined
                        }
                      >
                        {item.action === "logout" ? inner : <Link to={item.url}>{inner}</Link>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="mt-auto gap-2 border-t border-border/60 p-2">
        <div
          className={`flex items-center rounded-xl border border-border/60 bg-card/60 transition-all duration-300 ${collapsed ? "h-10 w-10 justify-center border-0 bg-transparent p-0 mx-auto" : "gap-3 p-2.5"}`}
          title={collapsed ? `${meta.user} · ${meta.label}` : undefined}
        >
          <div className="relative shrink-0">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-primary text-xs font-semibold text-primary-foreground">
                {meta.initials}
              </AvatarFallback>
            </Avatar>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 animate-fade-in">
              <div className="truncate text-xs font-semibold">{meta.user}</div>
              <div className="truncate text-[10px] text-muted-foreground">{meta.label}</div>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={() => nav({ to: "/" })}
            className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card/40 px-3 py-2 text-xs font-medium text-destructive transition-all duration-200 hover:bg-destructive/10 animate-fade-in"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        )}
      </SidebarFooter>

    </Sidebar>
  );
}
