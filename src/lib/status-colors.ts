/**
 * Badge color helpers built on the semantic design tokens (--success/--warning/
 * --destructive/--primary/--accent) instead of raw Tailwind palette classes, so
 * status/severity badges actually adapt in dark mode.
 */
const TONE_CLASS = {
  success: "bg-success/15 text-success border-success/20",
  warning: "bg-warning/15 text-warning border-warning/20",
  destructive: "bg-destructive/15 text-destructive border-destructive/20",
  primary: "bg-primary/15 text-primary border-primary/20",
  accent: "bg-accent/15 text-accent border-accent/20",
  muted: "bg-muted text-muted-foreground border-border/40",
} as const;

export type Severity = "info" | "success" | "warning" | "danger";

const SEVERITY_TONE: Record<Severity, keyof typeof TONE_CLASS> = {
  info: "primary",
  success: "success",
  warning: "warning",
  danger: "destructive",
};

export function severityBadgeClass(severity: Severity): string {
  return TONE_CLASS[SEVERITY_TONE[severity]];
}

export type SimpleStatus = "active" | "suspended" | "online" | "offline" | "needs_update";

const STATUS_TONE: Record<SimpleStatus, keyof typeof TONE_CLASS> = {
  active: "success",
  online: "success",
  suspended: "destructive",
  offline: "destructive",
  needs_update: "warning",
};

export function statusBadgeClass(status: SimpleStatus): string {
  return TONE_CLASS[STATUS_TONE[status]];
}

export type UserRole = "doctor" | "patient" | "admin";

const ROLE_TONE: Record<UserRole, keyof typeof TONE_CLASS> = {
  doctor: "accent",
  patient: "primary",
  admin: "warning",
};

export function roleBadgeClass(role: UserRole): string {
  return TONE_CLASS[ROLE_TONE[role]];
}

export function statusDotClass(status: SimpleStatus): string {
  const tone = STATUS_TONE[status];
  if (tone === "success") return "bg-success";
  if (tone === "warning") return "bg-warning";
  return "bg-destructive";
}
