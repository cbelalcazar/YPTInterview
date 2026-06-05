import React from 'react';

interface Entity {
  id: string;
  name: string;
}

export type QueryMode = 'ANALYZE' | 'COMPARE' | 'RANK';

interface GuidedQueryBuilderProps {
  mode: QueryMode;
  onModeChange: (mode: QueryMode) => void;
  
  retailers: Entity[];
  kpis: Entity[];
  companies: Entity[];
  sectors: string[];

  activeKpiId: string;
  selectedRetailerId: string | null;
  selectedCompanyId: string;
  selectedSector: string | null;

  onKpiChange: (kpiId: string) => void;
  onRetailerChange: (retailerId: string | null) => void;
  onCompanyChange: (companyId: string) => void;
  onSectorChange: (sectorName: string | null) => void;
}

export function GuidedQueryBuilder({ 
  mode,
  onModeChange,
  retailers, 
  kpis,
  companies,
  sectors,
  activeKpiId, 
  selectedRetailerId,
  selectedCompanyId,
  selectedSector,
  onKpiChange, 
  onRetailerChange,
  onCompanyChange,
  onSectorChange
}: GuidedQueryBuilderProps) {
  
  const selectClassName = "appearance-none bg-transparent border-b-2 border-dashed border-brand-teal/30 hover:border-brand-teal focus:border-brand-teal focus:outline-none focus:ring-0 text-brand-teal font-black cursor-pointer pb-0.5 mx-2 transition-colors pr-4 relative z-10 text-left min-w-[120px]";

  const modeOptions = [
    { value: 'ANALYZE', label: 'Analyze' },
    { value: 'COMPARE', label: 'Compare' },
    { value: 'RANK', label: 'Rank' }
  ];

  const renderModeSelector = () => (
    <div className="relative inline-block">
      <select 
        aria-label="mode"
        value={mode}
        onChange={(e) => onModeChange(e.target.value as QueryMode)}
        className={selectClassName}
        style={{ backgroundImage: 'none' }}
      >
        {modeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <span className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-brand-teal/50 text-sm">▼</span>
    </div>
  );

  const renderKpiSelector = (label: string = "kpi") => (
    <div className="relative inline-block">
      <select 
        aria-label={label}
        value={activeKpiId}
        onChange={(e) => onKpiChange(e.target.value)}
        className={selectClassName}
        style={{ backgroundImage: 'none' }}
      >
        {kpis.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
      </select>
      <span className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-brand-teal/50 text-sm">▼</span>
    </div>
  );

  const renderRetailerSelector = () => (
    <div className="relative inline-block">
      <select 
        aria-label="retailer"
        value={selectedRetailerId || ""}
        onChange={(e) => onRetailerChange(e.target.value === "" ? null : e.target.value)}
        className={selectClassName}
        style={{ backgroundImage: 'none' }}
      >
        <option value="">All Retailers</option>
        {retailers.map(r => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </select>
      <span className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-brand-teal/50 text-sm">▼</span>
    </div>
  );

  const renderCompanySelector = () => (
    <div className="relative inline-block">
      <select 
        aria-label="company"
        value={selectedCompanyId}
        onChange={(e) => onCompanyChange(e.target.value)}
        className={selectClassName}
        style={{ backgroundImage: 'none' }}
      >
        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <span className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-brand-teal/50 text-sm">▼</span>
    </div>
  );

  const renderSectorSelector = () => (
    <div className="relative inline-block">
      <select 
        aria-label="sector"
        value={selectedSector || ""}
        onChange={(e) => onSectorChange(e.target.value || null)}
        className={selectClassName}
        style={{ backgroundImage: 'none' }}
      >
        {sectors.map(s => <option key={s} value={s}>{s} Sector</option>)}
      </select>
      <span className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-brand-teal/50 text-sm">▼</span>
    </div>
  );

  return (
    <div className="flex flex-wrap items-baseline text-2xl md:text-3xl font-bold text-brand-navy leading-relaxed">
      {renderModeSelector()}

      {mode === 'ANALYZE' && (
        <>
          {renderKpiSelector()}
          <span>for</span>
          {renderRetailerSelector()}
        </>
      )}

      {mode === 'COMPARE' && (
        <>
          {renderCompanySelector()}
          <span>vs</span>
          {renderSectorSelector()}
          <span>in</span>
          {renderKpiSelector()}
        </>
      )}

      {mode === 'RANK' && (
        <>
          <span>top companies by</span>
          {renderKpiSelector()}
          <span>in</span>
          {renderRetailerSelector()}
        </>
      )}
    </div>
  );
}
