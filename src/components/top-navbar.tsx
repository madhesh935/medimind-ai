import { useEffect, useState } from "react";
import { Bell, Search, Moon, Sun, Sparkles, ChevronDown, LogOut, User as UserIcon, Shield } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { useRole, setRole, roleMeta, type Role } from "@/lib/role-store";

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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 py-1 pl-1 pr-2 transition-colors hover:bg-muted/50">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-primary text-xs font-semibold text-primary-foreground">
                  {meta.initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left leading-tight sm:block">
                <div className="text-xs font-semibold">{meta.user.split(" ")[0]}</div>
                <div className="text-[10px] text-muted-foreground">{meta.label}</div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2">
            <DropdownMenuLabel>
              <div className="flex items-center gap-3 rounded-xl bg-gradient-primary p-3 text-primary-foreground">
                <Avatar className="h-10 w-10 border-2 border-white/30">
                  <AvatarFallback className="bg-white/20 text-white">{meta.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{meta.user}</div>
                  <div className="truncate text-[11px] opacity-80">{meta.email}</div>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Switch role (demo)
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup value={role} onValueChange={(v) => setRole(v as Role)}>
              {(Object.keys(roleMeta) as Role[]).map((r) => (
                <DropdownMenuRadioItem key={r} value={r} className="rounded-lg">
                  <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-gradient-primary" />
                  {roleMeta[r].label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => nav({ to: "/settings" })} className="rounded-lg">
              <UserIcon className="mr-2 h-4 w-4" /> Profile & Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => nav({ to: "/" })} className="rounded-lg text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
