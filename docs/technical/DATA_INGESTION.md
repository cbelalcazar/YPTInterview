# Data Ingestion Pipeline (ETL) Deep Dive

This document details the process of transforming raw, unstructured CSV text data into a high-integrity normalized relational database.

## The ETL Philosophy
Our ingestion strategy follows the **ELT (Extract, Load, Transform)** pattern optimized for a transactional database. Instead of pre-validating against a fixed list of entities, the system "discovers" the domain model from the data itself.

---

## 1. Extraction: Streaming vs. Buffering
To handle potentially large corporate datasets (100k+ rows), the system uses a **Streaming Strategy**.
*   **Technology:** `fast-csv` integrated with Fastify's multipart file handler.
*   **Efficiency:** Instead of loading the entire file into Node.js memory (which risks an OOM crash), we process the file as a stream of buffers, parsing rows as they arrive.

## 2. Transformation: Data Cleaning & Normalization
Before the data hits the database, several transformations occur:

### A. Temporal Normalization
CSV periods (e.g., `2026-05`) are converted into canonical `Date` objects (e.g., `2026-05-01T00:00:00Z`). This ensures that time-series queries and MOM/YOY math are consistent.

### B. Dynamic Entity Resolution
The system implements a **Lazy Initialization Pattern**:
1.  **Company Resolution:** Upserts the brand based on its name.
2.  **KPI Resolution:** Upserts the metric definition.
3.  **Retailer Resolution:** Upserts the point of sale.

**Why:** This makes the system resilient to new market entrants. If YipitData adds a new brand to the CSV tomorrow, the software accommodates it without any code changes or manual DB seeding.

## 3. Loading: Idempotency & The Composite Key
The final load into the `KPIEstimate` table is governed by a strict **Idempotency Contract**.

### The Multi-Dimensional Unique Constraint
We use a 6-dimensional unique index to prevent data duplication:
`[companyId, kpiId, retailerId, period, isMtd, asOf]`

### The Upsert Logic
Every row in the CSV triggers an `UPSERT` operation:
*   **MATCH:** If the exact same snapshot (same time, company, kpi, and retailer) exists, the system updates the `value` and `updatedAt`.
*   **MISS:** If it's a new snapshot, a new record is appended.

## 4. Post-Ingestion: Real-time Synchronicity
Once the batch is processed:
1.  **Broadcast:** The API triggers a `fastify.broadcast()`.
2.  **Notification:** All active Web clients receive a "Intelligence Alert" via WebSockets.
3.  **Refetch:** The UI automatically invalidates its cache and refetches the latest aggregated view, ensuring zero lag between data upload and data visualization.

---

## Interview Talking Point: "Resilience over Rigidity"
*   **Question:** "What happens if a row in the CSV has a missing value?"
*   **Answer:** "The pipeline includes a **Defensive Filter**. If critical relational fields (Company, KPI, or Value) are missing, the row is skipped, and the error is logged to the server console. This prevents a single bad row from corrupting the entire database transaction."
