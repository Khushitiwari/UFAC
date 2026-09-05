export const toDateInput = (value) => {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

export const parseFormDate = (value) => (value ? new Date(`${value}T00:00:00`) : undefined);

export const emptyLine = (extra = {}) => ({
  productId: '',
  quantity: 1,
  unitPrice: 0,
  tax: 0,
  ...extra,
});

export const lineSubtotal = (line) =>
  Number(line.quantity || 0) * Number(line.unitPrice || 0) + Number(line.tax || 0);

export const linesTotal = (lines) => lines.reduce((sum, line) => sum + lineSubtotal(line), 0);
