// Utility to parse brazilian currency
export const parseCurrency = (val: string) => {
  if (!val) return 0;
  const cleaned = val.replace(/R[\\\$\s]*/g, '').replace(/\./g, '').replace(',', '.').trim();
  return parseFloat(cleaned) || 0;
};

// Utility to parse brazilian numbers (e.g. 11,43)
export const parseNumberBR = (val: string) => {
  if (!val) return 0;
  return parseFloat(val.replace(',', '.')) || 0;
};

// Formata data de YYYY-MM-DD para DD/MM/YYYY (padrão pt-BR)
export const formatarData = (val: string | undefined): string => {
  if (!val || val === '-') return '-';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) return val;
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const [y, m, d] = val.split('-');
    return `${d}/${m}/${y}`;
  }
  return val;
};
