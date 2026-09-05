import { useCallback, useState } from 'react';
import { createBudgetSchema } from '../../validators/budget.schema.js';
import { parseFormDate, toDateInput } from '../../utils/formHelpers.js';
import Button from '../common/Button.jsx';

const defaultValues = {
  name: '',
  periodStart: toDateInput(new Date()),
  periodEnd: toDateInput(new Date()),
  plannedAmount: 0,
  analyticAccountId: '',
  responsiblePersonId: '',
};

const BudgetForm = ({ initialValues, onSubmit, onCancel, analyticAccounts = [], submitLabel = 'Save Budget' }) => {
  const [form, setForm] = useState({
    ...defaultValues,
    ...initialValues,
    periodStart: toDateInput(initialValues?.periodStart) || defaultValues.periodStart,
    periodEnd: toDateInput(initialValues?.periodEnd) || defaultValues.periodEnd,
  });
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const payload = {
        ...form,
        periodStart: parseFormDate(form.periodStart),
        periodEnd: parseFormDate(form.periodEnd),
      };
      const result = createBudgetSchema.safeParse(payload);
      if (!result.success) {
        const fieldErrors = {};
        result.error.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }
      await onSubmit(result.data);
    },
    [form, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Name *</label>
        <input id="name" name="name" value={form.name} onChange={handleChange} />
        {errors.name && <div className="form-error">{errors.name}</div>}
      </div>
      <div className="form-group">
        <label htmlFor="periodStart">Period Start *</label>
        <input id="periodStart" name="periodStart" type="date" value={form.periodStart} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label htmlFor="periodEnd">Period End *</label>
        <input id="periodEnd" name="periodEnd" type="date" value={form.periodEnd} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label htmlFor="plannedAmount">Planned Amount *</label>
        <input id="plannedAmount" name="plannedAmount" type="number" step="0.01" min="0" value={form.plannedAmount} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label htmlFor="analyticAccountId">Analytic Account *</label>
        <select id="analyticAccountId" name="analyticAccountId" value={form.analyticAccountId} onChange={handleChange}>
          <option value="">Select...</option>
          {analyticAccounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        {errors.analyticAccountId && <div className="form-error">{errors.analyticAccountId}</div>}
      </div>
      <div className="form-group">
        <label htmlFor="responsiblePersonId">Responsible Person ID *</label>
        <input id="responsiblePersonId" name="responsiblePersonId" value={form.responsiblePersonId} onChange={handleChange} />
        {errors.responsiblePersonId && <div className="form-error">{errors.responsiblePersonId}</div>}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
};

export default BudgetForm;
