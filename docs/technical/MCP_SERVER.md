# MCP Server Technical Documentation

## Overview
The Model Context Protocol (MCP) server enables AI agents (Claude, ChatGPT) to interact with our KPI data. It serves as a semantic bridge, translating natural language analytical requests into precise database queries.

## Tech Stack
*   **Protocol:** Model Context Protocol (MCP).
*   **Transport:** Stdio (Standard Input/Output).
*   **SDK:** `@modelcontextprotocol/sdk`.

## Tools & Capabilities

### 1. Discovery Suite (`search_companies`, `list_kpis`, `list_retailers`)
*   **Why:** AI agents don't have a UI to browse dropdowns. These tools allow the agent to "discover" the available entities and their UUIDs autonomously.
*   **Flow:** Claude calls `search_companies` -> learns the ID -> calls `get_kpi_analysis`.

### 2. Semantic Analysis (`get_kpi_analysis`)
*   **The "Secret Sauce":** This tool doesn't return raw database rows. It returns a processed JSON object containing pre-calculated **MOM** and **YOY** growth.
*   **Value:** By doing the math in the server, we eliminate "hallucinations" where the LLM might calculate percentages incorrectly.

### 3. Data Entry (`publish_kpi_estimate`)
*   Allows the AI to update the database. It handles the mapping of names to IDs internally, making it very easy for a user to say "Register $500M for Trendy Shoe Brand" without knowing the UUID.

## Communication Flow
1.  **AI Client (Claude Desktop):** Sends a JSON-RPC request via Stdio.
2.  **MCP Server (Our App):** Receives the tool call, queries the local DB via Prisma.
3.  **Response:** Returns a text/json content block that Claude parses and presents as a natural language response.

## Interview Q&A Guide
*   **Q: What is MCP and why use it?**
    *   *A:* MCP is an open standard that allows LLMs to use local tools securely. We use it to turn our dataset into an "AI-First" ecosystem.
*   **Q: Why standard IO instead of HTTP for the MCP server?**
    *   *A:* Stdio is the default for local AI integrations (like Claude Desktop). It's simpler to set up, highly secure, and perfect for local development environments.
*   **Q: How do you prevent the AI from making up numbers?**
    *   *A:* The server only returns "Ground Truth" data from our database. We also provide the growth metrics pre-calculated to ensure the AI's conclusions are based on our verified business logic.
