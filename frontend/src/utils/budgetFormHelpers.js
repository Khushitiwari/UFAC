import { parseFormDate, toDateInput } from './formHelpers.js';

export const toBudgetFormValues = (source = {}) => ({
  name: source.name ?? '',
  periodStart: toDateInput(source.periodStart) || toDateInput(new Date()),
  periodEnd: toDateInput(source.periodEnd) || toDateInput(new Date()),
  plannedAmount: Number(source.plannedAmount ?? 0),
  analyticAccountId: source.analyticAccountId ?? source.analyticAccount?.id ?? '',
  responsiblePersonId: source.responsiblePersonId ?? source.responsiblePerson?.id ?? '',
});

export const toBudgetPayload = (form) => ({
  name: form.name.trim(),
  periodStart: toDateInput(parseFormDate(form.periodStart)),
  periodEnd: toDateInput(parseFormDate(form.periodEnd)),
  plannedAmount: Number(form.plannedAmount),
  analyticAccountId: form.analyticAccountId,
  responsiblePersonId: form.responsiblePersonId,
});

export default { toBudgetFormValues, toBudgetPayload };
