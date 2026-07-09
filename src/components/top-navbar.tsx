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
  patient: "border-primary/25 bg-primary/10 text-primary",
  caregiver: "border-success/25 bg-success/10 text-success",
  doctor: "border-primary/25 bg-primary/10 text-primary",
  admin: "border-warning/25 bg-warning/10 text-warning",
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
    <header className="glass sticky top-0 z-30 flex h-20 items-center gap-5 border-b border-border px-5 sm:px-8">
      <SidebarTrigger className="h-11 w-11 shrink-0 rounded-xl transition-colors hover:bg-foreground/[0.05] [&_svg]:h-[22px] [&_svg]:w-[22px]" />

      <div className="relative hidden min-w-0 flex-1 lg:block" style={{ maxWidth: 640 }}>
        <Search className="pointer-events-none absolute left-5 top-1/2 h-[22px] w-[22px] -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
        <Input
          placeholder="Search medications, reports, prescriptions, patients..."
          className="h-14 w-full max-w-[640px] rounded-2xl border-border bg-white pl-14 text-[16px] shadow-card placeholder:text-muted-foreground"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Badge variant="outline" className={`hidden h-10 gap-2 rounded-full px-4 text-[14px] font-medium sm:inline-flex ${roleBadgeStyles[role]}`}>
          <Shield className="h-[18px] w-[18px]" strokeWidth={2} />
          {meta.label}
        </Badge>

        <div className="hidden h-8 w-px bg-border sm:block" />

        <Button size="icon" variant="ghost" className="h-11 w-11 rounded-xl" onClick={() => setDark((d) => !d)}>
          {dark ? <Sun className="h-[22px] w-[22px]" strokeWidth={2} /> : <Moon className="h-[22px] w-[22px]" strokeWidth={2} />}
        </Button>

        <Button size="icon" variant="ghost" className="relative h-11 w-11 rounded-xl">
          <Bell className="h-[22px] w-[22px]" strokeWidth={2} />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-white" />
        </Button>

        <div className="hidden h-8 w-px bg-border sm:block" />

        <div className="hidden items-center gap-3.5 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-card sm:flex">
          <Avatar className="h-11 w-11 shrink-0">
            <AvatarFallback className="bg-primary text-[14px] font-bold text-primary-foreground">
              {meta.initials}
            </AvatarFallback>
          </Avatar>
          <div className="leading-tight">
            <div className="max-w-[150px] truncate text-[15px] font-semibold">{meta.user}</div>
            <div className="text-[13px] text-muted-foreground">{meta.label}</div>
          </div>
        </div>

        <Button
          variant="destructive"
          className="hidden h-11 gap-2.5 rounded-xl px-4 sm:flex"
          onClick={() => nav({ to: "/" })}
        >
          <LogOut className="h-[20px] w-[20px]" strokeWidth={2} />
          <span className="text-[14px] font-semibold">Logout</span>
        </Button>
      </div>
    </header>
  );
}
