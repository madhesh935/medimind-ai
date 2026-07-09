/**
 * Single source of truth for chart fill/stroke colors.
 * All values reference the OKLCH design tokens in src/styles.css so charts
 * stay in sync with the theme (including dark mode) instead of hardcoding hsl()/hex.
 */
export const chartColors = {
  primary: "var(--primary)",
  accent: "var(--accent)",
  success: "var(--success)",
  warning: "var(--warning)",
  destructive: "var(--destructive)",
  muted: "var(--muted-foreground)",
  chart1: "var(--chart-1)",
  chart2: "var(--chart-2)",
  chart3: "var(--chart-3)",
  chart4: "var(--chart-4)",
  chart5: "var(--chart-5)",
} as const;

export const chartPalette = [
  chartColors.chart1,
  chartColors.chart2,
  chartColors.chart3,
  chartColors.chart4,
  chartColors.chart5,
] as const;
