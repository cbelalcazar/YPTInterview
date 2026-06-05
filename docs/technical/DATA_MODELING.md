# Data Modeling & Snapshot Strategy

## Data Schema Overview
The system uses a **Snowflake Schema** approach to balance normalization with query performance.

### Core Entities
*   **Company:** The primary entity (Brand). Includes `sector` for benchmarking.
*   **Retailer:** Points of sale. Decoupling retailers from companies allows for many-to-many relationships (multiple brands sold in the same store).
*   **KPI:** Definitions of metrics (GMV, Units Sold, ASP). Includes `format` metadata to ensure the UI renders currencies vs. numbers correctly.
*   **KPIEstimate:** The fact table. Stores the intersection of Brand, Retailer, KPI, and Time.

## MTD Snapshot Strategy
Unlike historical data which is immutable once finalized, **Month-to-Date (MTD)** data is highly volatile.

### The "Latest-of-Many" Pattern
1.  **Retention:** We store every snapshot provided in the CSV by capturing the `as_of` field.
2.  **Aggregation Logic:**
    *   To get the "Current" MTD value for a company, the system identifies the maximum `asOf` timestamp for each `retailerId` within the current `period`.
    *   This ensures that if *Sole City* updated 1 hour ago and *Market Square* updated 5 hours ago, we sum the most recent version of both.
3.  **Audit Trail:** By keeping `asOf` history, we enable the **Snapshot Evolution Chart**, allowing analysts to see the velocity of sales updates throughout the day.

## Scalability Considerations
*   **Index Optimization:** An index on `(companyId, kpiId, period)` ensures that fetching the 13-month history is an O(log n) operation regardless of the table size.
*   **Precision:** We use `Float` (Double Precision) for values to handle multi-billion dollar GMV figures without rounding errors.
