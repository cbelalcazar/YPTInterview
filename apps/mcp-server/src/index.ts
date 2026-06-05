import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { PrismaClient } from "@repo/db";
import { handleSearchCompanies, handleListKpis, handleListRetailers, handleGetKpiAnalysis, handlePublishEstimate } from "./handlers";

const db = new PrismaClient();

const server = new Server(
  {
    name: "yipit-kpi-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_companies",
        description: "Search for companies by name or sector. Returns their IDs for use in analysis.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query for company name" },
            sector: { type: "string", description: "Filter by sector (e.g., Footwear)" },
          },
        },
      },
      {
        name: "list_kpis",
        description: "List all available KPIs and their IDs.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "list_retailers",
        description: "List all available retailers and their IDs.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_kpi_analysis",
        description: "Get historical trends, growth metrics (MOM/YOY), and MTD data for a specific company and KPI. Supports optional retailer filtering.",
        inputSchema: {
          type: "object",
          properties: {
            companyId: { type: "string", description: "The UUID of the company" },
            kpiId: { type: "string", description: "The UUID of the KPI (e.g., GMV, Units Sold)" },
            retailerId: { type: "string", description: "Optional: Filter analysis by specific retailer UUID" },
          },
          required: ["companyId", "kpiId"],
        },
      },
      {
        name: "publish_kpi_estimate",
        description: "Publish or update a KPI estimate for a company and retailer. Supports historical and MTD snapshots.",
        inputSchema: {
          type: "object",
          properties: {
            companyId: { type: "string" },
            kpiId: { type: "string" },
            retailerId: { type: "string" },
            value: { type: "number" },
            period: { type: "string", description: "ISO date string (e.g., 2023-10-01)" },
            isMtd: { type: "boolean", default: false, description: "Whether this is a Month-to-Date estimate" },
            asOf: { type: "string", description: "Optional: ISO timestamp for MTD snapshots" }
          },
          required: ["companyId", "kpiId", "retailerId", "value", "period"]
        }
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "search_companies") {
      const query = (args?.query as string) || "";
      const sector = args?.sector as string;
      return await handleSearchCompanies(db, query, sector);
    }

    if (name === "list_kpis") {
      return await handleListKpis(db);
    }

    if (name === "list_retailers") {
      return await handleListRetailers(db);
    }

    if (name === "get_kpi_analysis") {
      const companyId = args?.companyId as string;
      const kpiId = args?.kpiId as string;
      const retailerId = args?.retailerId as string;
      return await handleGetKpiAnalysis(db, companyId, kpiId, retailerId);
    }

    if (name === "publish_kpi_estimate") {
      return await handlePublishEstimate(
        db,
        args?.companyId as string,
        args?.kpiId as string,
        args?.retailerId as string,
        args?.value as number,
        args?.period as string,
        args?.isMtd as boolean,
        args?.asOf as string
      );
    }

    throw new Error(`Tool not found: ${name}`);
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Yipit KPI MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
