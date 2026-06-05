export interface KPIValue {
  period: Date;
  value: number;
}

export function calculateTrends(history: KPIValue[]) {
  if (history.length < 1) return { mom: null, yoy: null };

  const current = history[0];
  const currentDate = new Date(current.period);
  
  const targetMomMonth = currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
  const targetMomYear = currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
  
  const prevMonth = history.find(e => {
    const d = new Date(e.period);
    return d.getFullYear() === targetMomYear && d.getMonth() === targetMomMonth;
  });

  let mom: number | null = null;
  if (prevMonth && prevMonth.value !== 0) {
    mom = ((current.value - prevMonth.value) / prevMonth.value) * 100;
  }

  const targetYoyYear = currentDate.getFullYear() - 1;
  const targetYoyMonth = currentDate.getMonth();
  
  const prevYear = history.find(e => {
    const d = new Date(e.period);
    return d.getFullYear() === targetYoyYear && d.getMonth() === targetYoyMonth;
  });

  let yoy: number | null = null;
  if (prevYear && prevYear.value !== 0) {
    yoy = ((current.value - prevYear.value) / prevYear.value) * 100;
  }

  return {
    mom: mom !== null ? parseFloat(mom.toFixed(2)) : null,
    yoy: yoy !== null ? parseFloat(yoy.toFixed(2)) : null
  };
}
