# Data Modeling & Snapshot Strategy

## Data Schema Overview
The system implements a **Snowflake Schema** design, a standard in multidimensional data modeling for analytical systems. This approach ensures maximum data integrity and storage efficiency by normalizing dimensions.

### 1. The Fact Table (`KPIEstimate`)
At the center of our model is the **Fact Table**. This table stores the quantitative measurements (the "facts") of our business domain:
*   **Measurements:** `value` (GMV, Units, or ASP).
*   **Foreign Keys:** Links to all surrounding dimensions.
*   **Temporal Context:** `period` (the month) and `asOf` (the snapshot timestamp).

### 2. The Dimension Tables (Normalized)
Surrounding the fact table are the **Dimensions**, which provide the "who, what, and where" context. Unlike a simpler *Star Schema*, our model is a **Snowflake** because dimensions are fully normalized:
*   **Company Dimension:** Stores brand identities and sectors.
*   **Retailer Dimension:** Stores unique points of sale, decoupled from companies to allow many-to-many relationships.
*   **KPI Dimension:** Defines the metrics and their display formats (Metadata).

**Architectural Benefit:** This normalization prevents data redundancy. For example, a retailer's name is stored only once, even if it appears in millions of estimates, reducing the risk of data anomalies.

## MTD Snapshot Strategy
Unlike historical data which is finalized, **Month-to-Date (MTD)** data is volatile and updated multiple times daily.

### The "Latest-of-Many" Pattern
1.  **Immutable Retention:** We store every snapshot provided by upstream systems by capturing the `asOf` field. We never overwrite data; we append it.
2.  **State Resolution:** 
    *   To calculate the current "Truth" for a company, the system identifies the maximum `asOf` timestamp for each `retailerId` within the current period.
    *   It then sums these latest individual values to provide the consolidated company-wide MTD figure.
3.  **Observability:** Storing the history of snapshots enables the **Snapshot Evolution Chart**, providing visibility into data arrival velocity.

## Scalability Considerations
*   **Indexing:** Composite indices on `(companyId, kpiId, period)` ensure that time-series retrieval (e.g., 13-month history) remains O(log n) as the dataset grows.
*   **Data Integrity:** Unique composite constraints ensure idempotency during bulk CSV imports, transforming the import process into a safe `UPSERT` operation.
