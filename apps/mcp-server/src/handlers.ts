import { PrismaClient } from "@repo/db";

export async function handleSearchCompanies(db: PrismaClient, query: string, sector?: string) {
  const companies = await db.company.findMany({
    where: {
      name: { contains: query, mode: "insensitive" },
      ...(sector ? { sector } : {}),
    },
  });

  return {
    content: [{ type: "text", text: JSON.stringify(companies, null, 2) }],
  };
}

export async function handleListKpis(db: PrismaClient) {
  const kpis = await db.kPI.findMany();
  return {
    content: [{ type: "text", text: JSON.stringify(kpis, null, 2) }],
  };
}

export async function handleListRetailers(db: PrismaClient) {
  const retailers = await db.retailer.findMany({
    orderBy: { name: 'asc' }
  });
  return {
    content: [{ type: "text", text: JSON.stringify(retailers, null, 2) }],
  };
}

export async function handleGetKpiAnalysis(
  db: PrismaClient, 
  companyId: string, 
  kpiId: string,
  retailerId?: string
) {
  try {
    const where: any = { companyId, kpiId };
    if (retailerId) {
      where.retailerId = retailerId;
    }

    const allEstimates = await db.kPIEstimate.findMany({
      where,
      orderBy: [
        { period: "desc" },
        { asOf: "desc" }
      ],
      include: { kpi: true, company: true, retailer: true },
    });

    if (!allEstimates || allEstimates.length === 0) {
      return {
        content: [{ type: "text", text: "No data found for this selection. Make sure both companyId and kpiId are correct and currently exist in the database." }],
      };
    }

    const grouped: Record<string, any[]> = {};
    for (const e of allEstimates) {
      if (!e.period) continue;
      const key = `${new Date(e.period).toISOString()}_${e.isMtd}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(e);
    }

    const processedEstimates = Object.values(grouped).map(group => {
      const first = group[0];
      if (first.isMtd) {
        const latestPerRetailer: Record<string, number> = {};
        for (const e of group) {
          if (latestPerRetailer[e.retailerId] === undefined) {
            latestPerRetailer[e.retailerId] = e.value;
          }
        }
        const totalValue = Object.values(latestPerRetailer).reduce((a, b) => a + b, 0);
        return { ...first, value: totalValue };
      } else {
        const totalValue = group.reduce((sum, e) => sum + e.value, 0);
        return { ...first, value: totalValue };
      }
    });

    processedEstimates.sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime());

    const mtd = processedEstimates.find((e) => e.isMtd);
    const history = processedEstimates.filter((e) => !e.isMtd).slice(0, 13);
    
    if (!history || history.length === 0) {
      return { content: [{ type: "text", text: "Historical data not available yet for this company/KPI." }] };
    }

    const current = history[0];
    const prevMonth = history[1];
    
    const currentPeriod = new Date(current.period);
    const prevYear = history.find((e) => {
      const d = new Date(e.period);
      return d.getFullYear() === currentPeriod.getFullYear() - 1 && d.getMonth() === currentPeriod.getMonth();
    });

    const mom = prevMonth && prevMonth.value !== 0
      ? (((current.value - prevMonth.value) / prevMonth.value) * 100).toFixed(2)
      : "N/A";

    const yoy = prevYear && prevYear.value !== 0
      ? (((current.value - prevYear.value) / prevYear.value) * 100).toFixed(2)
      : "N/A";

    const analysis = {
      company: allEstimates[0].company.name,
      kpi: allEstimates[0].kpi.name,
      retailer: retailerId ? allEstimates[0].retailer.name : "All Retailers (Aggregated)",
      current_period: currentPeriod.toISOString().slice(0, 7),
      current_value: current.value,
      mom_growth: mom !== "N/A" ? mom + "%" : "N/A",
      yoy_growth: yoy !== "N/A" ? yoy + "%" : "N/A",
      mtd_estimate: mtd ? mtd.value : "N/A",
      as_of: mtd ? mtd.asOf : current.updatedAt,
    };

    return {
      content: [
        {
          type: "text",
          text: `Analysis for ${analysis.company} - ${analysis.kpi} (${analysis.retailer}):\n${JSON.stringify(
            analysis,
            null,
            2
          )}`,
        },
      ],
    };
  } catch (err: any) {
    return {
      content: [{ type: "text", text: `Error processing analysis: ${err.message}` }],
      isError: true
    };
  }
}

export async function handlePublishEstimate(
  db: PrismaClient, 
  companyId: string, 
  kpiId: string, 
  retailerId: string,
  value: number, 
  period: string, 
  isMtd: boolean = false,
  asOf?: string
) {
  try {
    const asOfDate = asOf ? new Date(asOf) : (isMtd ? new Date() : new Date('1970-01-01T00:00:00Z'));

    const estimate = await db.kPIEstimate.upsert({
      where: {
        companyId_kpiId_retailerId_period_isMtd_asOf: {
          companyId,
          kpiId,
          retailerId,
          period: new Date(period),
          isMtd,
          asOf: asOfDate
        }
      },
      update: { value, updatedAt: new Date() },
      create: {
        companyId,
        kpiId,
        retailerId,
        value,
        period: new Date(period),
        isMtd,
        asOf: asOfDate
      },
      include: { company: true, kpi: true }
    });

    return {
      content: [{ 
        type: "text", 
        text: `Successfully published ${estimate.kpi.name} for ${estimate.company.name}. Value: ${value}${isMtd ? ' (MTD)' : ''}` 
      }],
    };
  } catch (err: any) {
    return {
      content: [{ type: "text", text: `Error publishing estimate: ${err.message}` }],
      isError: true
    };
  }
}
