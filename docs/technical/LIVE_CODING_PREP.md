# Live Coding & Interview Preparation Guide

This document prepares you for the **60-minute Live Review Session**. It contains pre-calculated strategies for potential follow-up features and architectural questions.

## 🚀 Speed-Run Features (Common Interview Requests)

### 1. Add "Sector Filter" to Rankings
*   **Request:** "Can we see rankings only for companies in the 'Footwear' sector?"
*   **File:** `apps/api/src/routes/rankings/index.ts`
*   **Logic:** Add `sector` to query params and update Prisma `where`:
    ```typescript
    where: { 
      kpiId, 
      period: latest.period, 
      company: { sector: sectorParam } 
    }
    ```

### 2. Export MTD History
*   **Request:** "The export only shows monthly history. Can we export the intradía snapshots too?"
*   **File:** `apps/web/src/components/DashboardClient.tsx`
*   **Logic:** Update `exportCSV` to check if `activeAnalysis.evolution` exists and include those rows in the blob.

### 3. Change "Analyze" to support Year-over-Year Charting
*   **Request:** "I want to see this year's line vs. last year's line on the same chart."
*   **File:** `apps/web/src/components/KPIChart.tsx`
*   **Logic:** Use the `ComparisonChart` component logic but filter data by `currentYear` and `currentYear - 1`.

---

## 🏛️ Architecture Deep-Dive (Defense)

### Q: Why is the CSV Import dynamic?
*   **Senior Answer:** "In high-growth environments like YipitData, the domain entities (new brands, new KPIs) grow faster than the code can be updated. My importer uses an `UPSERT` pattern that makes the system self-healing and data-driven. If a new KPI 'Profit Margin' is added to the CSV, the system adapts without a redeploy."

### Q: How do you handle multiple MTD snapshots for the same day?
*   **Senior Answer:** "I use the **Latest-of-Many** pattern. The database stores every snapshot (`asOf`) to maintain an audit trail. At query time, the API identifies the maximum `asOf` per retailer. This guarantees data freshness while preserving historical velocity for the evolution charts."

### Q: Why did you build an MCP server?
*   **Senior Answer:** "Data accessibility is moving beyond the browser. By implementing the Model Context Protocol, I've turned our KPI database into an autonomous agent resource. This allows analysts to use Claude to generate complex natural language reports based on our verified business logic (MOM/YOY), eliminating manual calculation errors."

---

## 🛠️ Quick CLI Commands for the Live Session

*   **Clean Reset:** `./setup.sh`
*   **Run All Tests:** `yarn turbo test --force`
*   **Check DB Content:** `npx prisma studio` (inside `packages/db`)
*   **Build Project:** `yarn turbo build`

---

## 💡 Final Tips
*   **Think Out Loud:** When coding a live feature, explain *why* you are choosing a specific file or logic.
*   **Verify First:** After making a change, run the specific test for that package (`yarn workspace api test`).
*   **Reference the Docs:** Don't be afraid to point at your `docs/technical/` files; it shows you are organized and value documentation.
