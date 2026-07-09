import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, Star } from "lucide-react";
import { doctors } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/doctors")({ component: Doctors });

function Doctors() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Doctors</h1>
          <p className="text-sm text-muted-foreground">All clinicians registered on the MediMind platform.</p>
        </div>
        <Button className="rounded-xl bg-gradient-primary shadow-glow"><UserPlus className="mr-2 h-4 w-4" />Add doctor</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((d) => (
          <Card key={d.name} className="overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <div className="relative h-24 bg-gradient-to-br from-purple-600 to-fuchsia-700">
              <div className="absolute -bottom-6 left-5 flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-card bg-gradient-primary text-white font-bold shadow-lg">
                {d.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </div>
            </div>
            <CardContent className="p-5 pt-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{d.name}</div>
                  <div className="text-xs text-muted-foreground">{d.specialty}</div>
                </div>
                <Badge className="rounded-full bg-warning/15 text-warning"><Star className="mr-1 h-3 w-3 fill-current" />{d.rating}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-muted/40 p-2.5"><div className="text-muted-foreground">Patients</div><div className="font-bold text-sm">{d.patients}</div></div>
                <div className="rounded-xl bg-muted/40 p-2.5"><div className="text-muted-foreground">Status</div><div className="font-bold text-sm">{d.status}</div></div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 rounded-xl">View</Button>
                <Button size="sm" className="flex-1 rounded-xl bg-gradient-primary">Message</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
