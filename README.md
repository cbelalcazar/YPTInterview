# 📊 YipitData KPI Intelligence Ecosystem

An enterprise-grade full-stack solution for visualizing, importing, and programmatically querying Brand and Retailer KPIs. This project implements a robust analytical dashboard and a **Model Context Protocol (MCP)** server for AI-driven insights.

---

## 🚀 Foolproof Local Setup

Follow these steps to get the entire ecosystem running in less than 5 minutes.

### 1. Prerequisites
*   **Node.js** v20 or higher.
*   **Docker** & **Docker Compose**.
*   **Yarn** (v1.x).

### 2. Automated One-Command Setup
We provide a setup script that handles environment variables, Docker containers, dependencies, and database initialization.

```bash
# Clone the repository and enter the directory
# Run the automated setup
./setup.sh
```

### 3. Start All Services
Once the setup is complete, launch the development environment (Frontend, API, and MCP Server):

```bash
yarn dev
```

### 📍 Service Map
*   **Web Dashboard:** [http://localhost:3000](http://localhost:3000)
*   **REST API:** [http://localhost:3001](http://localhost:3001)
*   **PostgreSQL:** `localhost:5433` (Port 5433 to avoid local conflicts)

---

## 🛠️ Advanced Features (Demo Highlights)

### 1. Guided Query Builder ("Mad Libs" Style)
Instead of a standard search bar, the dashboard features an interactive natural language sentence.
*   **Modes:** Switch between **Analyze** (individual trends), **Compare** (benchmark vs sector), and **Rank** (competitive leaderboard).
*   **Intuitiveness:** Clickable dropdowns integrated into the sentence prevent user error and guide the analysis.

### 2. Dynamic CSV Importer
Found in the top-right corner of the Dashboard.
*   **Resilience:** Drag and drop the provided `kpi_sample_corporate_compatible.csv`. The system dynamically creates missing Companies, KPIs, and Retailers.
*   **Feedback:** Provides a visual summary of all entities detected and records processed.

### 3. Real-Time WebSocket Alerts
The application uses WebSockets to broadcast updates. When data is imported or a new estimate is published, a toast notification ("Intelligence Alert") appears instantly on all active dashboard sessions.

---

## 🤖 AI Agent Integration (MCP Server)

The project includes a **Model Context Protocol (MCP)** server that allows LLMs like **Claude Desktop** or **Cursor** to query your data semantically.

### Option 1: Quick Test with MCP Inspector (Recommended)
If you don't have a desktop LLM client, you can use the official web-based inspector to interact with the tools directly:

```bash
# 1. Ensure the project is built
yarn build

# 2. Run the official inspector
npx @modelcontextprotocol/inspector node apps/mcp-server/dist/index.js
```
*   Click the **localhost:5173** link in your terminal.
*   Go to the **Tools** tab.
*   Run `list_kpis` to see available metrics.
*   Run `search_companies` (query: "Trendy") to get a UUID.
*   Run `get_kpi_analysis` using the IDs found in the previous steps.

### Option 2: Connecting to Claude Desktop
To see Claude perform autonomous analysis, add this to your `claude_desktop_config.json`:
*(Path: `~/Library/Application Support/Claude/claude_desktop_config.json`)*

```json
{
  "mcpServers": {
    "yipit-intelligence": {
      "command": "/usr/local/bin/node", 
      "args": ["/REPLACE_WITH_YOUR_ABSOLUTE_PATH/apps/mcp-server/dist/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://postgres:postgres@localhost:5433/yipit_kpis?schema=public"
      }
    }
  }
}
```
*Note: Use `which node` to find your absolute node path.*

---

## 📂 CSV Data Format Specifications

The dynamic importer expects a CSV file with the following columns. All columns are **required** for a successful ingestion.

| Column | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `company_id` | `String` | Unique slug for the brand | `trendy_shoe_brand` |
| `company_name` | `String` | Display name of the brand | `Trendy Shoe Brand` |
| `sector` | `String` | Industry category | `Footwear` |
| `retailer_id` | `String` | Unique slug for the point of sale | `sole_city` |
| `retailer_name` | `String` | Display name of the retailer | `Sole City` |
| `kpi_id` | `String` | Unique slug for the metric | `gmv` |
| `kpi_name` | `String` | Display name (GMV, Units Sold, ASP) | `GMV` |
| `period` | `String` | Monthly period in `YYYY-MM` format | `2026-06` |
| `estimate_type` | `String` | Type of data: `historical` or `mtd` | `mtd` |
| `value` | `Float` | The numeric KPI value | `358000250.50` |
| `as_of` | `ISO8601` | Timestamp for MTD snapshots (optional for historical) | `2026-06-04T17:00:00Z` |

---

## 🏗️ Architectural Decisions

*   **Monorepo (Turborepo):** Shared database models across API, Web, and MCP ensuring 100% type safety and consistent business logic.
*   **Semantic Data Access:** The MCP server doesn't just expose tables; it provides **pre-calculated MOM/YOY growth metrics**. This prevents AI agents from making mathematical errors.
*   **Graceful Degradation:** The UI handles missing data combinations (e.g., a brand not sold in a specific retailer) with clear "No Data" states instead of breaking.

---

## 🔮 Architectural Roadmap (Future Improvements)

1.  **Observability:** In Phase 2, I would implement a centralized logging middleware (e.g., **Pino with Datadog**) to track CSV importer processing time and monitor the health of MCP requests in real-time.
2.  **Security:** We currently use simple JWT. For production, I would move identity management to an external provider (**IDP**) such as **Auth0 or Okta** to support RBAC (Role-Based Access Control) and MFA.
3.  **Performance:** For the sector aggregation endpoint, I would implement a **Layer 2 Cache (Redis)** with a 1-hour TTL, as the sector benchmark does not change with every MTD snapshot, significantly optimizing response times.
4.  **Data Integrity:** I will add a **JSON Schema Validation** layer (using Fastify-AJV) before the Prisma upsert to ensure CSV data strictly follows the type contract and prevent data corruption.

---

## ⚖️ License

This project is licensed under a custom **Interview Evaluation License**. It is provided solely for the purpose of technical evaluation by the hiring team at YipitData. Commercial use, reproduction, or using this software as a prototype for internal product development is strictly prohibited. See the [LICENSE](./LICENSE) file for full details.

