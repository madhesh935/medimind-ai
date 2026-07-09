import { useEffect, useState } from "react";
import { Bell, Search, Moon, Sun, LogOut, Shield } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRole, roleMeta, type Role } from "@/lib/role-store";

const roleBadgeStyles: Record<Role, string> = {
  patient: "border-primary/40 bg-primary/10 text-primary",
  caregiver: "border-emerald-400/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  doctor: "border-purple-400/40 bg-purple-500/10 text-purple-600 dark:text-purple-400",
  admin: "border-rose-400/40 bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export function TopNavbar() {
  const [dark, setDark] = useState(false);
  const role = useRole();
  const meta = roleMeta[role];
  const nav = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/70 px-3 backdrop-blur-xl sm:px-6">
      <SidebarTrigger />
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search medications, patients, insights…" className="h-10 rounded-xl border-border/60 bg-muted/40 pl-10" />
      </div>
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <Badge variant="outline" className={`hidden gap-1.5 rounded-full sm:inline-flex ${roleBadgeStyles[role]}`}>
          <Shield className="h-3 w-3" /> {meta.label}
        </Badge>
        <Button size="icon" variant="ghost" className="rounded-xl" onClick={() => setDark((d) => !d)}>
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button size="icon" variant="ghost" className="relative rounded-xl">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        {/* Current user info */}
        <div className="ml-1 hidden items-center gap-2.5 rounded-xl border border-border/60 bg-card/60 px-3 py-1.5 sm:flex">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="bg-gradient-primary text-[11px] font-semibold text-primary-foreground">
              {meta.initials}
            </AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <div className="text-xs font-semibold truncate max-w-[120px]">{meta.user}</div>
            <div className="text-[10px] text-muted-foreground">{meta.label}</div>
          </div>
        </div>

        <Button
          variant="ghost"
          className="ml-1 flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
          onClick={() => nav({ to: "/" })}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden text-sm font-medium sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
