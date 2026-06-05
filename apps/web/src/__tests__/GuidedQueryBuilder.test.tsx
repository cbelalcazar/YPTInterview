import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuidedQueryBuilder, QueryMode } from '../components/GuidedQueryBuilder';
import { vi, describe, it, expect } from 'vitest';

describe('GuidedQueryBuilder Component', () => {
  const retailers = [{ id: 'r1', name: 'Sole City' }];
  const kpis = [{ id: 'k1', name: 'GMV' }];
  const companies = [{ id: 'c1', name: 'Trendy Shoe Brand' }];
  const sectors = ['Footwear'];

  it('renders the ANALYZE template by default', () => {
    render(
      <GuidedQueryBuilder 
        mode="ANALYZE"
        onModeChange={vi.fn()}
        retailers={retailers}
        kpis={kpis}
        companies={companies}
        sectors={sectors}
        activeKpiId="k1"
        selectedRetailerId={null}
        selectedCompanyId="c1"
        selectedSector="Footwear"
        onKpiChange={vi.fn()}
        onRetailerChange={vi.fn()}
        onCompanyChange={vi.fn()}
        onSectorChange={vi.fn()}
      />
    );
    expect(screen.getByText(/Analyze/i)).toBeInTheDocument();
    expect(screen.getByText(/for/i)).toBeInTheDocument();
  });

  it('renders the COMPARE template when mode is COMPARE', () => {
    render(
      <GuidedQueryBuilder 
        mode="COMPARE"
        onModeChange={vi.fn()}
        retailers={retailers}
        kpis={kpis}
        companies={companies}
        sectors={sectors}
        activeKpiId="k1"
        selectedRetailerId={null}
        selectedCompanyId="c1"
        selectedSector="Footwear"
        onKpiChange={vi.fn()}
        onRetailerChange={vi.fn()}
        onCompanyChange={vi.fn()}
        onSectorChange={vi.fn()}
      />
    );
    expect(screen.getByText(/Compare/i)).toBeInTheDocument();
    expect(screen.getByText(/vs/i)).toBeInTheDocument();
    expect(screen.getByText(/in/i)).toBeInTheDocument();
  });

  it('calls onModeChange when a new mode is selected', async () => {
    const user = userEvent.setup();
    const onModeChange = vi.fn();
    
    render(
      <GuidedQueryBuilder 
        mode="ANALYZE"
        onModeChange={onModeChange}
        retailers={retailers}
        kpis={kpis}
        companies={companies}
        sectors={sectors}
        activeKpiId="k1"
        selectedRetailerId={null}
        selectedCompanyId="c1"
        selectedSector="Footwear"
        onKpiChange={vi.fn()}
        onRetailerChange={vi.fn()}
        onCompanyChange={vi.fn()}
        onSectorChange={vi.fn()}
      />
    );
    
    const modeSelect = screen.getByRole('combobox', { name: /mode/i });
    await user.selectOptions(modeSelect, 'COMPARE');
    expect(onModeChange).toHaveBeenCalledWith('COMPARE');
  });
});
