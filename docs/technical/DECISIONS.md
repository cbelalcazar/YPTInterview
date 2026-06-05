# Architectural Decision Records (ADR)

This document records the key architectural decisions made during the development of the Yipit KPI Ecosystem.

## ADR 1: Monorepo Structure with Turborepo
*   **Context:** The project requires a Web Frontend, a REST API, a shared Database layer, and an MCP Server.
*   **Decision:** Use a Monorepo managed by Turborepo.
*   **Rationale:** 
    *   **Type Safety:** Enables sharing TypeScript interfaces (e.g., `AnalysisResponse`) across all packages, ensuring the API and UI are always in sync.
    *   **Dependency Management:** Single `yarn.lock` for the entire project reduces "dependency hell".
    *   **Pipeline Efficiency:** Turbo's remote caching and task orchestration significantly speed up builds and tests.

## ADR 2: In-Memory Aggregation for Analytical Endpoints
*   **Context:** Data is stored at a granular level (Retailer/Snapshot), but the UI often requires aggregated views (Company Total).
*   **Decision:** Perform aggregations in the application layer (Node.js) rather than complex SQL `GROUP BY` views.
*   **Rationale:** 
    *   **Flexibility:** Easily handle complex MTD logic (selecting the latest `asOf` snapshot per retailer before summing) which is cumbersome in standard SQL.
    *   **Performance:** For the current dataset size (~3k rows), in-memory processing is sub-millisecond and reduces DB load.
    *   **Scalability:** Allows for easy implementation of multi-tenant or multi-dimensional filters without rewriting DB views.

## ADR 3: Model Context Protocol (MCP) over standard JSON API
*   **Context:** Requirement to expose data to AI agents.
*   **Decision:** Implement a dedicated MCP Server using the `Stdio` transport.
*   **Rationale:** 
    *   **Discovery:** MCP provides a standardized way for LLMs to "discover" tools (`list_kpis`, `search_companies`).
    *   **Security:** `Stdio` transport ensures that the AI client and the server communicate over a secure local pipe, perfect for enterprise evaluation environments.
    *   **Semantic Layer:** Allows us to provide "Calculated Metrics" (MOM/YOY) as a first-class citizen, preventing AI mathematical errors.

## ADR 4: Composite Key Unique Constraints
*   **Context:** Frequent updates to MTD data and bulk CSV imports.
*   **Decision:** Enforce a composite unique index on `[companyId, kpiId, retailerId, period, isMtd, asOf]`.
*   **Rationale:** 
    *   **Integrity:** Guarantees idempotency during CSV imports. Re-importing the same file results in `upserts` rather than duplicates.
    *   **History:** Allows us to store a full audit trail of how an MTD estimate evolved over time by tracking the `asOf` timestamp.
