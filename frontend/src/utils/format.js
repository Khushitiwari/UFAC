export const DEFAULT_CURRENCY = 'INR';
export const DEFAULT_LOCALE = 'en-IN';

export const formatCurrency = (amount, currency = DEFAULT_CURRENCY) =>
  new Intl.NumberFormat(DEFAULT_LOCALE, { style: 'currency', currency }).format(amount ?? 0);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
