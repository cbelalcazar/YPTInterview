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
