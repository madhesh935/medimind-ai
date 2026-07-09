# MediMind AI — Graphs and Analytics Inventory

This document maps all the visual analytics, graphs, and telemetry indicators implemented in the MediMind AI Healthcare application.

---

## 📊 Summary by Page

### 1. Dashboard (`src/routes/_app.dashboard.tsx`)
The dashboard is split into 3 role-based views. Each view renders specialized charts and indicators:

#### Patient View
- **Weekly Adherence Trend**:
  - **Type**: Smooth Area Chart with Linear Gradient Fill (`AreaChart`).
  - **Metrics**: Patient adherence percentage over the last 7 days compared against a dotted target threshold line.
  - **Visuals**: Dots at data points, tooltips displaying date and exact percentage, theme-matching accent color.
- **Reminder Channels**:
  - **Type**: Pie Chart (`PieChart`).
  - **Metrics**: Breakdown of patient reminder methods (Push notifications, SMS, WhatsApp, AI Assistant).
- **Monthly Adherence**:
  - **Type**: Stacked Bar Chart (`BarChart`).
  - **Metrics**: Successful doses taken vs missed doses across the last 12 months.
- **Risk Prediction**:
  - **Type**: Line Chart (`LineChart`).
  - **Metrics**: 14-day projection showing current risk value vs AI predicted trend.

#### Doctor View
- **Average Adherence / Cohort Compliance**:
  - **Type**: Grouped Bar Chart (`BarChart`).
  - **Metrics**: Average patient compliance trend across the last 8 months.
- **Risk Distribution**:
  - **Type**: Radial Bar Chart (`RadialBarChart`).
  - **Metrics**: Grouping patients into High, Medium, and Low risk thresholds.

#### Admin View
- **Platform Usage**:
  - **Type**: Double Area Chart (`AreaChart`).
  - **Metrics**: Event telemetry counts and active user curves plotted concurrently.

---

### 2. Refill Center (`src/routes/_app.refill.tsx`)
- **Inventory Capsule Indicators**:
  - **Type**: Custom Pill-Bottle/Capsule Progress Containers (`CapsuleProgress`).
  - **Metrics**: Percentage of pills left for each medication (Metformin, Lisinopril, Atorvastatin, Aspirin) rising dynamically.
- **Inventory Over Time**:
  - **Type**: Stacked Bar Chart (`BarChart`).
  - **Metrics**: Breakdown of remaining inventory versus consumed pills for active prescriptions.

---

### 3. Reports (`src/routes/_app.reports.tsx`)
- **Adherence Trend**:
  - **Type**: Area Chart (`AreaChart`).
  - **Metrics**: Daily compliance percentages.
- **Delay Analysis**:
  - **Type**: Dot Point Line Chart (`LineChart`).
  - **Metrics**: Delay duration tracking (in minutes) per daily dose logs.
- **Medicine Usage**:
  - **Type**: Bar Chart (`BarChart`).
  - **Metrics**: Total pills taken across months.
- **Risk Analysis**:
  - **Type**: Pie Chart (`PieChart`).
  - **Metrics**: Breakdown of compliance reminder channels.

---

### 4. Analytics Center (`src/routes/_app.analytics.tsx`)
- **Adherence Trend (12 Months)**:
  - **Type**: Area Chart (`AreaChart`).
  - **Metrics**: Monthly average adherence curves.
- **Notification Channel Mix**:
  - **Type**: Pie Chart (`PieChart`).
  - **Metrics**: Preferred notification delivery options.
- **Weekly Compliance**:
  - **Type**: Bar Chart (`BarChart`).
  - **Metrics**: Days of the week plotted against adherence rates.
- **Device Analytics**:
  - **Type**: Double Line Chart (`LineChart`).
  - **Metrics**: Intersecting trends of events generated and total active devices.
- **Risk Breakdown**:
  - **Type**: Radial Bar Chart (`RadialBarChart`).
  - **Metrics**: Color-coded representation of patient risk tiers.
