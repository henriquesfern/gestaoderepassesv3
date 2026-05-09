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
