import { useEffect, useState } from "react";
import { Bell, Search, Moon, Sun, Sparkles } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { currentUser } from "@/lib/mock-data";

export function TopNavbar() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/70 px-3 backdrop-blur-xl sm:px-6">
      <SidebarTrigger />
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search medications, patients, insights…"
          className="h-10 rounded-xl border-border/60 bg-muted/40 pl-10"
        />
      </div>
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <Badge
          variant="outline"
          className="hidden gap-1.5 rounded-full border-success/40 bg-success/10 text-success sm:inline-flex"
        >
          <Sparkles className="h-3 w-3" /> AI Ready
        </Badge>
        <Button
          size="icon"
          variant="ghost"
          className="rounded-xl"
          onClick={() => setDark((d) => !d)}
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button size="icon" variant="ghost" className="relative rounded-xl">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
        </Button>
        <div className="ml-1 flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 py-1 pl-1 pr-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-primary text-xs font-semibold text-primary-foreground">
              {currentUser.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left leading-tight sm:block">
            <div className="text-xs font-semibold">{currentUser.firstName}</div>
            <div className="text-[10px] text-muted-foreground">Patient</div>
          </div>
        </div>
      </div>
    </header>
  );
}
