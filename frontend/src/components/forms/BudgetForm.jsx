import { useCallback, useEffect, useState } from 'react';
import { createBudgetSchema } from '../../validators/budget.schema.js';
import { toBudgetFormValues, toBudgetPayload } from '../../utils/budgetFormHelpers.js';
import Button from '../common/Button.jsx';

const BudgetForm = ({
  initialValues,
  onSubmit,
  onCancel,
  analyticAccounts = [],
  currentUser,
  submitLabel = 'Save Budget',
}) => {
  const [form, setForm] = useState(() => toBudgetFormValues(initialValues));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(toBudgetFormValues(initialValues));
    setErrors({});
  }, [initialValues]);

  useEffect(() => {
    if (!form.responsiblePersonId && currentUser?.id) {
      setForm((prev) => ({ ...prev, responsiblePersonId: currentUser.id }));
    }
  }, [currentUser?.id, form.responsiblePersonId]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const payload = toBudgetPayload({
        ...form,
        responsiblePersonId: form.responsiblePersonId || currentUser?.id,
      });

      const result = createBudgetSchema.safeParse(payload);
      if (!result.success) {
        const fieldErrors = {};
        result.error.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }

      setErrors({});
      try {
        await onSubmit(result.data);
      } catch (err) {
        setErrors({ form: err.response?.data?.error || 'Failed to save budget' });
      }
    },
    [form, onSubmit, currentUser?.id],
  );

  return (
    <form onSubmit={handleSubmit}>
      {errors.form && <div className="alert-error">{errors.form}</div>}
      <div className="form-group">
        <label htmlFor="name">Name *</label>
        <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Q1 Marketing Budget" />
        {errors.name && <div className="form-error">{errors.name}</div>}
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="periodStart">Period Start *</label>
          <input id="periodStart" name="periodStart" type="date" value={form.periodStart} onChange={handleChange} />
          {errors.periodStart && <div className="form-error">{errors.periodStart}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="periodEnd">Period End *</label>
          <input id="periodEnd" name="periodEnd" type="date" value={form.periodEnd} onChange={handleChange} />
          {errors.periodEnd && <div className="form-error">{errors.periodEnd}</div>}
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="plannedAmount">Planned Amount *</label>
        <input
          id="plannedAmount"
          name="plannedAmount"
          type="number"
          step="0.01"
          min="0"
          value={form.plannedAmount}
          onChange={handleChange}
        />
        {errors.plannedAmount && <div className="form-error">{errors.plannedAmount}</div>}
      </div>
      <div className="form-group">
        <label htmlFor="analyticAccountId">Analytic Account *</label>
        <select id="analyticAccountId" name="analyticAccountId" value={form.analyticAccountId} onChange={handleChange}>
          <option value="">Select analytic account...</option>
          {analyticAccounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} ({a.type})
            </option>
          ))}
        </select>
        {errors.analyticAccountId && <div className="form-error">{errors.analyticAccountId}</div>}
        {!analyticAccounts.length && (
          <p className="field-hint">Create an analytic account first before adding a budget.</p>
        )}
      </div>
      <div className="form-group">
        <label>Responsible Person</label>
        <input
          readOnly
          value={currentUser?.name || initialValues?.responsiblePerson?.name || 'Current user'}
          style={{ background: 'var(--color-primary-soft)' }}
        />
        <p className="field-hint">Budgets are assigned to the logged-in user.</p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={!analyticAccounts.length}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default BudgetForm;
