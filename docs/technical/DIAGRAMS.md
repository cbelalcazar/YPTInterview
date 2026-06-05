# System Architecture & Process Diagrams

This document provides visual representations of the system's architecture and its core analytical processes using Mermaid diagrams.

## 1. High-Level System Architecture
The ecosystem is organized as a Monorepo using **Turborepo**, ensuring shared types and a unified business logic layer.

```mermaid
graph TD
    subgraph Client_Layer [Client Layer]
        Web[Next.js Web Dashboard]
        AI[AI Agents / Claude Desktop]
    end

    subgraph Service_Layer [Service Layer]
        API[Fastify REST API]
        MCP[MCP Server - Stdio]
        Logic[kpi-service.ts - Shared Logic]
    end

    subgraph Data_Layer [Data Layer]
        Prisma[Prisma ORM]
        DB[(PostgreSQL)]
    end

    Web <--> API
    AI <--> MCP
    API <--> Logic
    MCP <--> Logic
    API <--> Prisma
    MCP <--> Prisma
    Prisma <--> DB
    API -- WebSocket --> Web
```

### **Architectural Breakdown:**
- **Client Layer:** Supports multi-channel consumption. Human users interact via a rich Next.js dashboard, while AI agents consume data programmatically through the MCP server.
- **Service Layer:** Built on Fastify for high-performance I/O. Crucially, the **Shared Logic (`kpi-service.ts`)** is decoupled from the frameworks. This ensures that a "MOM Growth" percentage is calculated exactly the same way whether it's displayed on a chart or reported by an AI.
- **Data Layer:** PostgreSQL provides a relational foundation for complex aggregations, managed by Prisma ORM to ensure compile-time type safety across the entire monorepo.
- **Real-Time:** A WebSocket pipe connects the API to the Web client, enabling instant UI updates when data ingestion events occur.

---

## 2. Dynamic CSV Ingestion Pipeline
The ingestion process is designed to be data-agnostic, resolving entities in real-time.

```mermaid
sequenceDiagram
    participant User as Analyst (Web UI)
    participant API as Fastify API
    participant CSV as fast-csv Parser
    participant DB as PostgreSQL (Prisma)
    participant WS as WebSocket Broadcaster

    User->>API: Upload CSV File
    API->>CSV: Stream Content
    loop For each row
        CSV->>DB: Upsert Company
        CSV->>DB: Upsert Retailer
        CSV->>DB: Upsert KPI
        CSV->>DB: Upsert KPIEstimate (Composite Key)
    end
    DB-->>API: Success Response
    API->>WS: Broadcast "ESTIMATE_UPDATED"
    WS-->>User: Trigger Background Refresh
    API-->>User: Return Import Summary (JSON)
```

### **Process Explanation:**
- **Streaming Ingestion:** The API doesn't load the entire file into memory; it streams it through `fast-csv`, making it resilient to multi-megabyte datasets.
- **Dynamic Entity Resolution:** The system performs an `upsert` for every reference entity (Company, Retailer, KPI). This means the system "learns" about new retailers or brands just by reading the file.
- **Idempotency:** By using a composite unique key in the `KPIEstimate` table, the system handles duplicate uploads gracefully, updating existing values rather than creating "phantom" data.
- **Async Feedback:** Once the database transaction is complete, a WebSocket broadcast ensures all open dashboard sessions refresh their charts immediately, providing a seamless "live data" feel.

---

## 3. MTD Aggregation Logic ("Latest-of-Many")
How the system resolves the current truth from multiple intra-month snapshots.

```mermaid
graph LR
    Granular[Granular Snapshots per Retailer/asOf] --> Group[Group by Period]
    Group --> Filter[Identify Max asOf per Retailer]
    Filter --> Sum[Sum Latest Retailer Values]
    Sum --> Result[Consolidated Company MTD]
    
    style Filter fill:#f9f,stroke:#333,stroke-width:2px
    style Result fill:#00ff00,stroke:#333,stroke-width:2px
```

### **Logic Explanation:**
- **The Challenge:** MTD data is updated multiple times per day (`as_of` timestamp). Simply summing all rows for a month would lead to massive over-reporting.
- **The Resolution:** 
    1. The system groups data for the current month.
    2. For each unique **Retailer**, it performs a "Max Date" filter to find only the most recent snapshot.
    3. It then sums these "Latest Truths" across all retailers.
- **Outcome:** This ensures the dashboard always reflects the most current intra-month performance without losing the historical audit trail of how that number evolved.

---

## 4. MCP Semantic Layer Flow
How AI agents discover and analyze data without mathematical errors.

```mermaid
sequenceDiagram
    participant Agent as AI Agent (Claude)
    participant MCP as MCP Server
    participant DB as PostgreSQL
    participant Service as kpi-service.ts

    Agent->>MCP: list_kpis() / search_companies()
    MCP-->>Agent: Returns IDs (UUIDs)
    Agent->>MCP: get_kpi_analysis(companyId, kpiId)
    MCP->>DB: Fetch 13m History
    DB-->>MCP: Raw Rows
    MCP->>Service: calculateTrends(history)
    Service-->>MCP: MOM / YOY Percentages
    MCP-->>Agent: Formatted Semantic JSON
    Agent-->>Agent: Redact Natural Language Insight
```

### **Flow Explanation:**
- **Semantic Bridge:** Instead of letting the AI guess IDs or calculate complex growth math, the MCP server acts as a **Business Intelligence Layer**.
- **Autonomous Discovery:** The agent first "explores" the environment via `search` and `list` tools to obtain valid UUIDs, mimicking how a human analyst would explore a database schema.
- **Pre-Calculated Ground Truth:** By calling the `kpi-service.ts` directly from the MCP handler, we provide the agent with pre-calculated, verified percentages.
- **Safety:** The agent never constructs raw SQL queries. It only interacts with high-level semantic tools, ensuring data integrity and preventing hallucinations.
