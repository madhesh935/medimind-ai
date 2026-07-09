import { useMemo, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Pill, Radio, Bot, FileBarChart, Bell, ScanLine, RefreshCcw,
  Settings, Activity, Users, Stethoscope, HardDrive, ScrollText, LineChart,
  HeartPulse, AlertTriangle, ClipboardList, Calendar, PhoneCall, History,
  BookOpen, NotebookPen, SlidersHorizontal, ServerCog, LogOut, Search,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarFooter, SidebarGroup, SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRole, roleMeta, type Role } from "@/lib/role-store";

type Item = { title: string; url: string; icon: LucideIcon };
type Section = Item[];

const menus: Record<Role, Section[]> = {
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
    ],
  ],
};

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const role = useRole();
  const meta = roleMeta[role];
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const nav = useNavigate();
  const [query, setQuery] = useState("");
  const isActive = (u: string) => pathname === u || pathname.startsWith(u + "/");

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return menus[role];
    return menus[role]
      .map((s) => s.filter((i) => i.title.toLowerCase().includes(q)))
      .filter((s) => s.length > 0);
  }, [role, query]);

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/60 [&_[data-slot=sidebar-container]]:transition-[width,left,right] [&_[data-slot=sidebar-container]]:duration-300 [&_[data-slot=sidebar-container]]:ease-out [&_[data-slot=sidebar-container]]:bg-background/95 [&_[data-slot=sidebar-container]]:backdrop-blur-xl [&_[data-slot=sidebar-container]]:shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)] [&_[data-slot=sidebar-gap]]:transition-[width] [&_[data-slot=sidebar-gap]]:duration-300 [&_[data-slot=sidebar-gap]]:ease-out"
    >
      <SidebarHeader className={`${collapsed ? "px-2 py-5" : "px-5 py-6"}`}>
        <Link to="/dashboard" className={`flex items-center overflow-hidden ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow transition-transform duration-300 hover:scale-105">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div className={`flex flex-col leading-tight transition-all duration-300 ${collapsed ? "w-0 -translate-x-2 opacity-0" : "w-auto translate-x-0 opacity-100"}`}>
            <span className="font-display text-lg font-bold tracking-tight whitespace-nowrap">MediMind</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground whitespace-nowrap">
              AI Health
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {!collapsed && (
        <div className="px-4 pb-2 animate-fade-in">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search menu..."
              className="h-10 w-full rounded-xl border border-border/60 bg-muted/40 pl-9 pr-3 text-xs outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50 focus:bg-background"
            />
          </div>
        </div>
      )}

      <SidebarContent className={`${collapsed ? "px-1" : "px-3"} gap-0`}>
        {sections.map((items, idx) => (
          <div key={idx}>
            {idx > 0 && (
              <div className={`${collapsed ? "mx-3" : "mx-2"} my-2 h-px bg-border/60`} />
            )}
            <SidebarGroup className="animate-fade-in py-1">
              <SidebarGroupContent>
                <SidebarMenu className="gap-1.5">
                  {items.map((item) => {
                    const active = isActive(item.url);
                    return (
                      <SidebarMenuItem key={item.title} className="group/menu-item">
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.title}
                          className="h-12 rounded-2xl px-4 text-[13px] font-medium transition-all duration-300 hover:bg-primary/10 hover:scale-[1.02] active:scale-[0.98] data-[active=true]:bg-gradient-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-glow data-[active=true]:hover:brightness-110"
                        >
                          <Link to={item.url}>
                            <span className="relative flex w-full items-center gap-3">
                              {active && (
                                <span className="absolute -left-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.7)] animate-scale-in" />
                              )}
                              <item.icon className={`h-[22px] w-[22px] shrink-0 transition-transform duration-300 ${active ? "text-white" : "text-muted-foreground group-hover/menu-item:text-primary"} group-hover/menu-item:scale-110`} />
                              <span
                                className={`truncate transition-all duration-300 ${collapsed ? "w-0 -translate-x-2 opacity-0" : "w-auto opacity-100"}`}
                              >
                                {item.title}
                              </span>
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        ))}
        {sections.length === 0 && !collapsed && (
          <div className="px-4 py-6 text-center text-xs text-muted-foreground animate-fade-in">
            No matches
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className={`mt-auto gap-2 border-t border-border/60 ${collapsed ? "p-2" : "p-3"}`}>
        <div
          className={`flex items-center rounded-2xl border border-border/60 bg-card/60 transition-all duration-300 ${collapsed ? "h-10 w-10 justify-center border-0 bg-transparent p-0 mx-auto" : "gap-3 p-3"}`}
          title={collapsed ? `${meta.user} · ${meta.label}` : undefined}
        >
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-gradient-primary text-xs font-semibold text-primary-foreground">
              {meta.initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1 animate-fade-in">
              <div className="truncate text-[13px] font-semibold leading-tight">{meta.user}</div>
              <div className="truncate text-[11px] text-muted-foreground">{meta.label}</div>
            </div>
          )}
        </div>

        <button
          onClick={() => nav({ to: "/" })}
          title={collapsed ? "Logout" : undefined}
          className={`flex items-center rounded-2xl text-destructive transition-all duration-300 hover:bg-destructive/10 hover:scale-[1.02] active:scale-[0.98] ${collapsed ? "mx-auto h-10 w-10 justify-center" : "w-full gap-3 border border-border/60 bg-card/40 px-3 py-2.5 text-xs font-medium"}`}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span className="animate-fade-in">Logout</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
