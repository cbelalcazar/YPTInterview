# API Technical Documentation

## Overview
The API is a high-performance RESTful backend built with **Fastify**. It serves as the central intelligence hub, handling data persistence, complex KPI aggregations, and real-time broadcasts.

## Tech Stack
*   **Framework:** Fastify (Chosen for its low overhead and best-in-class plugin system).
*   **ORM:** Prisma (Ensures type-safety and easy migrations).
*   **Database:** PostgreSQL.
*   **Real-time:** WebSockets (via `@fastify/websocket`).
*   **Auth:** JWT (Standard stateless authentication).

## Key Components & Flows

### 1. Dynamic CSV Importer (`/estimates/import`)
*   **Process:**
    1.  Receives a `multipart/form-data` stream.
    2.  Uses `fast-csv` to parse the file line-by-line.
    3.  **Entity Resolution:** For every row, it performs an `upsert` on `Company`, `KPI`, and `Retailer`. If they don't exist, they are created in real-time.
    4.  **Idempotency:** It uses a composite unique constraint `[companyId, kpiId, retailerId, period, isMtd, asOf]` to ensure the same data point is never duplicated.
*   **Interview Tip:** Emphasize that the system is *data-agnostic*. It doesn't rely on pre-defined lists; it builds the environment based on the file content.

### 2. Analytical Aggregation (`/analysis`)
*   **Logic:** Instead of simple queries, this endpoint performs "In-Memory Aggregation" for maximum flexibility.
*   **Flow:**
    1.  Fetches all historical and MTD records for a company/KPI.
    2.  **Aggregation:** Groups data by `period`.
    3.  **MTD Resolution:** For MTD data, it identifies the latest `asOf` snapshot *per retailer* and sums them to provide the company total.
    4.  **Trend Calculation:** Calls a decoupled `kpi-service.ts` to calculate MOM and YOY growth percentages.

### 3. Real-time Broadcasting
*   Whenever a new estimate is published (either via CSV or single POST), the API calls `fastify.broadcast()`.
*   This sends a JSON message to all connected WebSocket clients, triggering instant UI updates.

## Interview Q&A Guide
*   **Q: Why Fastify instead of Express?**
    *   *A:* Fastify provides better performance, a built-in schema validation system, and a much cleaner plugin architecture for large monorepos.
*   **Q: How do you handle large CSVs?**
    *   *A:* We use streaming parsing with `fast-csv` and batch-processed upserts to keep memory usage low.
*   **Q: Why calculate trends in the API instead of the DB?**
    *   *A:* It keeps the database layer simple and allows us to test the math in isolation using unit tests in `kpi-service.ts`.
