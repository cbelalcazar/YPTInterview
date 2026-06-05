# Web Frontend Technical Documentation

## Overview
A modern, analytical dashboard built with **Next.js**. It focuses on maximizing data discoverability and minimizing user friction through guided natural language queries.

## Tech Stack
*   **Framework:** Next.js (App Router).
*   **Styling:** Tailwind CSS (Chosen for rapid UI development and high-grade professional aesthetics).
*   **Charts:** Recharts (Chosen for its reactive nature and great integration with React).
*   **Icons:** Lucide React.
*   **State:** React `useState` and `useEffect` hooks for local and global filtering context.

## Core Features

### 1. Guided Query Builder (The "Mad Libs" UI)
*   **Logic:** Instead of a search bar, we use an interactive sentence template.
*   **Modes:**
    *   **ANALYZE:** Detailed view of 13-month history and MTD evolution.
    *   **COMPARE:** Multi-line chart overlaying Company vs. Sector average.
    *   **RANK:** Competitive leaderboard using horizontal bar charts.
*   **UX Win:** Prevents "empty search" frustration and guides users to the analysis they need.

### 2. Adaptive Visualizations
*   **KPI Insight Cards:** Show MTD value, MOM trend, and YOY trend in a high-contrast legible format.
*   **Retailer Breakdown:** A customized horizontal bar that shows percentage market share per retailer.
*   **Snapshot Evolution:** A time-series area chart specifically for MTD intra-month data points.

### 3. Graceful Empty States
*   The UI handles 404 responses from the API by clearing previous chart data and rendering a dedicated "No Data Found" component. This ensures the app feels robust and intentional, even when the underlying data is sparse.

## Interview Q&A Guide
*   **Q: Why use a "sentence builder" instead of standard filters?**
    *   *A:* stakeholders are time-constrained. Reading a sentence like "Analyze GMV for Sole City" is faster and more intuitive than checking multiple separate dropdowns and hitting "Apply".
*   **Q: How do you handle real-time updates?**
    *   *A:* We use a WebSocket connection to the backend. When a "ESTIMATE_UPDATED" message arrives, we trigger a background refresh of the current data without a full page reload.
*   **Q: Why Next.js App Router?**
    *   *A:* It provides built-in routing, server-side rendering (SSR) for SEO and initial load speed, and a modern way to manage shared layouts.
