'use client'

import { useEffect, useState, useRef } from 'react'
import { KPIChart } from './KPIChart'
import { ImportModal } from './ImportModal'
import { GuidedQueryBuilder, QueryMode } from './GuidedQueryBuilder'
import { RetailerBreakdown } from './RetailerBreakdown'
import { SnapshotEvolution } from './SnapshotEvolution'
import { ComparisonChart } from './ComparisonChart'
import { RankingChart } from './RankingChart'
import { KPI_KEYS, QUERY_MODES, API_URL, WS_URL } from '../lib/constants'
import { TrendingUp, Package, DollarSign, Download, Bell, Activity, ChevronRight, BarChart3, Calendar, Building2, LayoutGrid, Zap, Loader2, Upload, X } from 'lucide-react'

interface KpiData {
  period: string;
  value: number;
}

interface Entity {
  id: string;
  name: string;
}

interface AnalysisResponse {
  kpi: { id: string; name: string; format: string };
  mtd: KpiData | null;
  history: KpiData[];
  trends: { yoy: number | null; mom: number | null };
  breakdown?: { retailerName: string; value: number }[];
  evolution?: { asOf: string; value: number }[];
}

export function DashboardClient() {
  const [notifications, setNotifications] = useState<string[]>([])
  const [activeKpi, setActiveKpi] = useState<keyof typeof KPI_KEYS>('GMV')
  const [timeRange, setTimeRange] = useState<'13m' | '6m' | 'ytd'>('13m')
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  
  const [queryMode, setQueryMode] = useState<QueryMode>(QUERY_MODES.ANALYZE)
  const [selectedRetailer, setSelectedRetailer] = useState<Entity | null>(null)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [selectedSector, setSelectedSector] = useState<string | null>(null)
  
  const [retailersList, setRetailersList] = useState<Entity[]>([])
  const [kpisList, setKpisList] = useState<Entity[]>([])
  const [companiesList, setCompaniesList] = useState<Entity[]>([])
  const [sectorsList, setSectorsList] = useState<string[]>([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [companyContext, setCompanyContext] = useState<any>(null)
  const [gmvAnalysis, setGmvAnalysis] = useState<AnalysisResponse | null>(null)
  const [unitsAnalysis, setUnitsAnalysis] = useState<AnalysisResponse | null>(null)
  const [aspAnalysis, setAspAnalysis] = useState<AnalysisResponse | null>(null)
  
  const [comparisonData, setComparisonData] = useState<any[]>([])
  const [rankingData, setRankingData] = useState<any[]>([])

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true)
      
      const compRes = await fetch(`${API_URL}/companies`)
      if (!compRes.ok) return
      const companies = await compRes.json()
      if (!Array.isArray(companies)) return
      setCompaniesList(companies)
      
      if (companies.length === 0) {
        setIsLoading(false)
        return
      }

      const currentId = selectedCompanyId || companies[0]?.id
      const company = companies.find((c: any) => c.id === currentId) || companies[0]
      if (company.id !== selectedCompanyId) setSelectedCompanyId(company.id)
      setCompanyContext(company)

      const kpiRes = await fetch(`${API_URL}/kpis`)
      if (!kpiRes.ok) return
      const kpis = await kpiRes.json()
      if (!Array.isArray(kpis)) return
      setKpisList(kpis.map((k: any) => ({ id: k.id, name: k.name })))
      
      const gmvKpi = kpis.find((k: any) => k.name === KPI_KEYS.GMV)
      const unitsKpi = kpis.find((k: any) => k.name === KPI_KEYS.UNITS)
      const aspKpi = kpis.find((k: any) => k.name === KPI_KEYS.ASP)

      const retRes = await fetch(`${API_URL}/retailers`)
      if (retRes.ok) {
        const retailers = await retRes.json()
        if (Array.isArray(retailers)) setRetailersList(retailers)
      }

      const secRes = await fetch(`${API_URL}/sectors`)
      if (secRes.ok) {
        const sectors = await secRes.json()
        if (Array.isArray(sectors)) {
          setSectorsList(sectors)
          if (!selectedSector && sectors.length > 0) setSelectedSector(sectors[0])
        }
      }

      const currentKpi = activeKpi === 'GMV' ? gmvKpi : (activeKpi === 'UNITS' ? unitsKpi : aspKpi)
      if (!currentKpi) return

      if (queryMode === QUERY_MODES.ANALYZE) {
        const queryParam = selectedRetailer ? `?retailerId=${selectedRetailer.id}` : ''
        
        if (gmvKpi) {
            const res = await fetch(`${API_URL}/companies/${company.id}/kpis/${gmvKpi.id}/analysis${queryParam}`)
            if (res.ok) setGmvAnalysis(await res.json()); else setGmvAnalysis(null);
        }
        if (unitsKpi) {
            const res = await fetch(`${API_URL}/companies/${company.id}/kpis/${unitsKpi.id}/analysis${queryParam}`)
            if (res.ok) setUnitsAnalysis(await res.json()); else setUnitsAnalysis(null);
        }
        if (aspKpi) {
            const res = await fetch(`${API_URL}/companies/${company.id}/kpis/${aspKpi.id}/analysis${queryParam}`)
            if (res.ok) setAspAnalysis(await res.json()); else setAspAnalysis(null);
        }
      } else if (queryMode === QUERY_MODES.COMPARE) {
        const resComp = await fetch(`${API_URL}/companies/${company.id}/kpis/${currentKpi.id}/analysis`)
        const resSec = await fetch(`${API_URL}/sectors/${selectedSector || company.sector}/kpis/${currentKpi.id}/analysis`)
        
        if (resComp.ok && resSec.ok) {
          const compData = await resComp.json()
          const sectorData = await resSec.json()
          if (compData.history && sectorData.history) {
            const merged = compData.history.map((h: any) => {
              const s = sectorData.history.find((sh: any) => sh.period === h.period)
              return { period: h.period, companyValue: h.value, sectorValue: s?.value || 0 }
            })
            setComparisonData(merged)
          } else { setComparisonData([]) }
        } else { setComparisonData([]) }
      } else if (queryMode === QUERY_MODES.RANK) {
        const rankQueryParam = selectedRetailer ? `&retailerId=${selectedRetailer.id}` : ''
        const resRank = await fetch(`${API_URL}/rankings?kpiId=${currentKpi.id}${rankQueryParam}`)
        if (resRank.ok) setRankingData(await resRank.json()); else setRankingData([]);
      }

    } catch (error) {
      console.error("Platform data synchronization error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedRetailer, selectedCompanyId, selectedSector, queryMode, activeKpi])
  
  useEffect(() => {
    const socket = new WebSocket(WS_URL)
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'ESTIMATE_UPDATED') {
          setNotifications(prev => [`Intelligence update received`, ...prev].slice(0, 5))
          fetchData(false)
        }
      } catch (e) {}
    }
    return () => socket.close()
  }, [])

  const getActiveAnalysis = () => {
    if (activeKpi === 'GMV') return gmvAnalysis
    if (activeKpi === 'UNITS') return unitsAnalysis
    return aspAnalysis
  }

  const getFilteredData = () => {
    const analysis = getActiveAnalysis()
    if (!analysis || !analysis.history) return []
    const baseData = analysis.history
    if (timeRange === '6m') return baseData.slice(0, 6)
    if (timeRange === 'ytd') {
        if (!baseData.length) return []
        const latestYear = new Date(baseData[0].period).getFullYear()
        return baseData.filter(d => new Date(d.period).getFullYear() === latestYear)
    }
    return baseData
  }

  const exportCSV = () => {
    const data = getFilteredData()
    if (!data.length) return
    const csvContent = "Company,KPI,Period,Value,Retailer\n" + 
      data.map(d => `"${companyContext?.name}","${activeKpi}","${new Date(d.period).toISOString().slice(0, 7)}",${d.value},"${selectedRetailer?.name || "Aggregated"}"`).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `yipit-export-${activeKpi.toLowerCase()}.csv`
    a.click()
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
  const formatNumber = (val: number) => new Intl.NumberFormat('en-US').format(val)

  if (isLoading && !companyContext) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-brand-teal">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm font-black uppercase tracking-widest">Synchronizing Intelligence Data...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-10 px-6">
      <div className="fixed top-6 right-6 z-50 space-y-3 w-80">
        {notifications.map((n, i) => (
          <div key={i} className="bg-brand-navy text-white px-5 py-4 rounded-xl flex items-start gap-4 shadow-2xl border-l-4 border-brand-teal backdrop-blur-md">
            <div className="mt-1 p-1.5 bg-brand-teal rounded-full"><Bell className="h-3 w-3 text-white" /></div>
            <div className="flex-1 text-left">
               <p className="text-[10px] font-black uppercase tracking-widest text-brand-teal mb-1">Intelligence Alert</p>
               <p className="text-sm font-medium leading-snug">{n}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between border-b border-slate-200 pb-10">
        <div className="flex-1 text-left">
           <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-brand-teal/10 text-brand-teal text-[10px] font-black uppercase tracking-[0.25em] px-3 py-1 rounded-md border border-brand-teal/20">Footwear Analytics</span>
              <div className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{companyContext?.sector} Intelligence</span>
              <div className="group relative ml-2">
                <div className="cursor-help bg-slate-100 text-slate-500 text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full hover:bg-brand-teal hover:text-white transition-colors">?</div>
                <div className="absolute top-full left-0 mt-2 w-64 p-4 bg-brand-navy text-white text-[11px] rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60] border border-white/10 backdrop-blur-md">
                   <p className="font-black text-brand-teal uppercase tracking-widest mb-2 text-left">Metrics Glossary</p>
                   <ul className="space-y-2 text-left">
                     <li><span className="font-bold text-brand-blue">GMV:</span> Gross Merchandise Value.</li>
                     <li><span className="font-bold text-brand-blue">ASP:</span> Average Sales Price.</li>
                     <li><span className="font-bold text-brand-blue">MTD:</span> Month-to-Date progress.</li>
                     <li><span className="font-bold text-brand-blue">MOM:</span> Month-over-Month growth.</li>
                     <li><span className="font-bold text-brand-blue">YOY:</span> Year-over-Year growth.</li>
                   </ul>
                </div>
              </div>
           </div>
           
           <GuidedQueryBuilder 
             mode={queryMode}
             onModeChange={(m) => { setQueryMode(m); if (m === QUERY_MODES.RANK) setSelectedRetailer(null); }}
             retailers={retailersList}
             kpis={kpisList}
             companies={companiesList}
             sectors={sectorsList}
             activeKpiId={activeKpi === 'UNITS' ? kpisList.find(k => k.name === KPI_KEYS.UNITS)?.id : (activeKpi === 'ASP' ? kpisList.find(k => k.name === KPI_KEYS.ASP)?.id : kpisList.find(k => k.name === KPI_KEYS.GMV)?.id) || kpisList[0]?.id || ""}
             selectedRetailerId={selectedRetailer?.id || null}
             selectedCompanyId={companyContext?.id || ""}
             selectedSector={selectedSector}
             onKpiChange={(id) => {
               const kpi = kpisList.find(k => k.id === id);
               if (kpi?.name === KPI_KEYS.UNITS) setActiveKpi('UNITS');
               else if (kpi?.name === KPI_KEYS.ASP) setActiveKpi('ASP');
               else setActiveKpi('GMV');
             }}
             onRetailerChange={(id) => setSelectedRetailer(retailersList.find(r => r.id === id) || null)}
             onCompanyChange={setSelectedCompanyId}
             onSectorChange={setSelectedSector}
           />
        </div>
        
        <div className="pt-2">
          <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-5 py-3 bg-brand-teal text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-navy transition-all shadow-lg active:scale-95 whitespace-nowrap">
            <Upload className="h-4 w-4 stroke-[3]" /> Import Data
          </button>
        </div>
      </div>

      {queryMode === QUERY_MODES.ANALYZE && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'GMV (SALES $)', value: gmvAnalysis?.mtd?.value ? formatCurrency(gmvAnalysis.mtd.value) : 'N/A', mom: gmvAnalysis?.trends?.mom ? `${gmvAnalysis.trends.mom > 0 ? '+' : ''}${gmvAnalysis.trends.mom}%` : 'N/A', yoy: gmvAnalysis?.trends?.yoy ? `${gmvAnalysis.trends.yoy > 0 ? '+' : ''}${gmvAnalysis.trends.yoy}%` : 'N/A', icon: DollarSign, color: 'text-brand-blue', bg: 'bg-brand-blue/5', key: 'GMV' },
            { label: 'UNITS SOLD', value: unitsAnalysis?.mtd?.value ? formatNumber(unitsAnalysis.mtd.value) : 'N/A', mom: unitsAnalysis?.trends?.mom ? `${unitsAnalysis.trends.mom > 0 ? '+' : ''}${unitsAnalysis.trends.mom}%` : 'N/A', yoy: unitsAnalysis?.trends?.yoy ? `${unitsAnalysis.trends.yoy > 0 ? '+' : ''}${unitsAnalysis.trends.yoy}%` : 'N/A', icon: Package, color: 'text-brand-teal', bg: 'bg-brand-teal/5', key: 'UNITS' },
            { label: 'ASP (AVG PRICE)', value: aspAnalysis?.mtd?.value ? formatCurrency(aspAnalysis.mtd.value) : 'N/A', mom: aspAnalysis?.trends?.mom ? `${aspAnalysis.trends.mom > 0 ? '+' : ''}${aspAnalysis.trends.mom}%` : 'N/A', yoy: aspAnalysis?.trends?.yoy ? `${aspAnalysis.trends.yoy > 0 ? '+' : ''}${aspAnalysis.trends.yoy}%` : 'N/A', icon: TrendingUp, color: 'text-brand-green', bg: 'bg-brand-green/5', key: 'ASP' },
          ].map((kpi, idx) => (
            <div key={idx} className={`bg-white p-8 rounded-2xl border transition-all duration-500 group relative overflow-hidden cursor-pointer text-left ${activeKpi === kpi.key ? 'border-brand-teal shadow-xl ring-1 ring-brand-teal/20' : 'border-slate-100 shadow-sm'}`} onClick={() => setActiveKpi(kpi.key as any)}>
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity"><kpi.icon className="h-32 w-32 -mr-12 -mt-12" /></div>
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div className={`p-4 ${kpi.bg} ${kpi.color} rounded-2xl group-hover:rotate-6 transition-transform duration-300`}><kpi.icon className="h-7 w-7 stroke-[2.5]" /></div>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 shadow-inner"><div className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse" /><span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Verified MTD</span></div>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-3">{kpi.label}</p>
              <div className="flex flex-col gap-1 text-left">
                 <p className="text-4xl font-black text-brand-navy tabular-nums tracking-tighter mb-2">{kpi.value}</p>
                 <div className="flex items-center gap-4 text-left">
                    <div className="flex items-center gap-1.5 text-left"><span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">MOM</span><div className={`flex items-center gap-0.5 text-xs font-black ${kpi.mom.startsWith('+') ? 'text-brand-green' : 'text-rose-500'}`}><Activity className="h-3 w-3" />{kpi.mom}</div></div>
                    <div className="h-3 w-px bg-slate-200" /><div className="flex items-center gap-1.5 text-left"><span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">YOY</span><div className={`flex items-center gap-0.5 text-xs font-black ${kpi.yoy.startsWith('+') ? 'text-brand-green' : 'text-rose-500'}`}><TrendingUp className="h-3 w-3" />{kpi.yoy}</div></div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
         <div className="px-10 py-10 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-gradient-to-r from-slate-50/80 to-transparent">
            <div className="text-left">
               <div className="flex items-center gap-3 mb-2 text-left">
                  <BarChart3 className="h-6 w-6 text-brand-teal" />
                  <h3 className="text-2xl font-black text-brand-navy tracking-tight uppercase">{queryMode === QUERY_MODES.RANK ? 'Market Leaderboard' : 'Trajectory Matrix'}</h3>
               </div>
               <p className="text-xs text-brand-teal font-black uppercase tracking-[0.3em] opacity-60 text-left">Empirical KPI Data Feed</p>
            </div>
            <div className="flex flex-wrap items-center gap-6">
               {queryMode !== QUERY_MODES.RANK && (
                 <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                    {['13m', '6m', 'ytd'].map(r => <button key={r} onClick={() => setTimeRange(r as any)} className={`px-5 py-2.5 text-[10px] font-black rounded-xl uppercase tracking-widest transition-all ${timeRange === r ? 'bg-white text-brand-navy shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{r}</button>)}
                 </div>
               )}
               <button onClick={exportCSV} className="flex items-center gap-2 px-5 py-3 bg-brand-navy text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-teal transition-all shadow-lg active:scale-95"><Download className="h-4 w-4 stroke-[3]" /> Export</button>
            </div>
         </div>
         <div className="p-12 bg-white">
            {queryMode === QUERY_MODES.ANALYZE && (
              <div className="flex flex-col lg:flex-row gap-12 text-left">
                <div className="w-full lg:w-2/3">
                  {getFilteredData().length > 0 ? <KPIChart data={getFilteredData()} kpiName={activeKpi} format={(activeKpi === 'GMV' || activeKpi === 'ASP') ? 'CURRENCY' : 'NUMBER'} /> : (
                    <div className="h-96 flex flex-col items-center justify-center text-slate-400">
                       <BarChart3 className="h-12 w-12 mb-4 opacity-20" /><p className="font-bold uppercase tracking-widest text-sm text-brand-navy">No relation data</p><p className="text-xs mt-2 opacity-60">This combination does not exist in the dataset.</p>
                    </div>
                  )}
                </div>
                <div className="w-full lg:w-1/3 flex flex-col gap-8 border-l border-slate-100 pl-0 lg:pl-12 text-left">
                  <RetailerBreakdown data={getActiveAnalysis()?.breakdown || []} format={(activeKpi === 'GMV' || activeKpi === 'ASP') ? 'CURRENCY' : 'NUMBER'} />
                  {!selectedRetailer && <SnapshotEvolution data={getActiveAnalysis()?.evolution || []} format={(activeKpi === 'GMV' || activeKpi === 'ASP') ? 'CURRENCY' : 'NUMBER'} />}
                </div>
              </div>
            )}
            {queryMode === QUERY_MODES.COMPARE && (comparisonData.length > 0 ? <ComparisonChart data={comparisonData} format={(activeKpi === 'GMV' || activeKpi === 'ASP') ? 'CURRENCY' : 'NUMBER'} companyName={companyContext?.name} sectorName={selectedSector || companyContext?.sector} /> : <div className="h-96 flex flex-col items-center justify-center text-slate-400 text-left"><TrendingUp className="h-12 w-12 mb-4 opacity-20" /><p className="font-bold uppercase tracking-widest text-sm text-brand-navy">Not enough data to benchmark</p></div>)}
            {queryMode === QUERY_MODES.RANK && (rankingData.length > 0 ? <RankingChart data={rankingData} format={(activeKpi === 'GMV' || activeKpi === 'ASP') ? 'CURRENCY' : 'NUMBER'} /> : <div className="h-96 flex flex-col items-center justify-center text-slate-400 text-left"><Activity className="h-12 w-12 mb-4 opacity-20" /><p className="font-bold uppercase tracking-widest text-sm text-brand-navy">No ranking data</p></div>)}
         </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-6 py-12 border-t border-slate-100">
         <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.5em]">YipitData Intelligence Ecosystem © 2026</p>
      </div>
      <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onSuccess={() => fetchData(false)} />
    </div>
  )
}
