# AI Strategy: Semantic Data Access (MCP)

## The Philosophy: Beyond Raw Data
Exposing raw database tables to a Large Language Model (LLM) often leads to **computational errors** (incorrect percentage math) and **hallucinations** (mapping the wrong ID). 

Our strategy is to provide a **Semantic Layer** via the Model Context Protocol.

## Implementation Details

### 1. Autonomous Discovery
The MCP server implements a discovery-first pattern:
*   `search_companies`: Translates fuzzy names ("Trendy") into canonical UUIDs.
*   `list_kpis`: Exposes available metrics to avoid the agent guessing what is measurable.
*   `list_retailers`: Enables granular analysis of sales channels.

### 2. Pre-Calculated Intelligence
The `get_kpi_analysis` tool performs high-level business logic before returning data:
*   It computes **MOM** (Month-over-Month) and **YOY** (Year-over-Year) growth.
*   It aggregates Retailer data into a single Company total if requested.
*   **Architectural Win:** This ensures that the answer Claude gives is mathematically identical to the one displayed on the Web Dashboard.

### 3. State-Aware Responses
The server handles "No Data" states by returning helpful text clues to the AI ("Historical data not available yet") rather than cryptic 404 errors. This allows the AI to pivot its analysis gracefully.

## Benefits for YipitData
*   **Reduced Token Usage:** By providing summaries instead of 1000s of raw rows, we reduce costs and latency.
*   **Security:** The AI only interacts with allowed "Tools", never with the database shell directly.
*   **Consistency:** "One version of the truth" across all interfaces.
