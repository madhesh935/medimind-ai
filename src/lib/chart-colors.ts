/** Standardized chart palette — blue, green, amber, gray only. No purple. */
export const CHART = {
  blue: "#2563EB",
  green: "#22C55E",
  amber: "#F59E0B",
  gray: "#94A3B8",
  grid: "#EEF2F6",
  axis: "#64748B",
} as const;

export const CHART_SERIES = [CHART.blue, CHART.green, CHART.amber, CHART.gray] as const;

export const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: CHART.axis, fontSize: 12 },
} as const;

export const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #E2E8F0",
  boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  background: "#ffffff",
  color: "#0F172A",
  fontSize: 13,
  padding: "8px 12px",
} as const;
