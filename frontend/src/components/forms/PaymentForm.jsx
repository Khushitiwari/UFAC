import { useCallback, useMemo, useState } from 'react';
import { createPaymentSchema } from '../../validators/payment.schema.js';
import { parseFormDate, toDateInput } from '../../utils/formHelpers.js';
import Button from '../common/Button.jsx';

const PaymentForm = ({
  initialValues,
  onSubmit,
  onCancel,
  maxAmount,
  submitLabel = 'Record Payment',
}) => {
  const [form, setForm] = useState(() => ({
    contactId: initialValues?.contactId ?? '',
    billId: initialValues?.billId ?? null,
    invoiceId: initialValues?.invoiceId ?? null,
    method: initialValues?.method ?? 'BANK',
    amount: initialValues?.amount ?? maxAmount ?? 0,
    date: toDateInput(initialValues?.date) || toDateInput(new Date()),
    reference: initialValues?.reference ?? '',
  }));
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
        amount: Number(form.amount),
        date: parseFormDate(form.date),
      };
      const result = createPaymentSchema.safeParse(payload);
      if (!result.success) {
        const fieldErrors = {};
        result.error.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }
      if (maxAmount != null && result.data.amount > maxAmount) {
        setErrors({ amount: `Amount cannot exceed ${maxAmount.toFixed(2)}` });
        return;
      }
      await onSubmit(result.data);
    },
    [form, onSubmit, maxAmount],
  );

  const cappedHint = useMemo(
    () => (maxAmount != null ? `Maximum: ${maxAmount.toFixed(2)}` : null),
    [maxAmount],
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="amount">Amount *</label>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          max={maxAmount ?? undefined}
          value={form.amount}
          onChange={handleChange}
        />
        {cappedHint && <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>{cappedHint}</div>}
        {errors.amount && <div className="form-error">{errors.amount}</div>}
      </div>
      <div className="form-group">
        <label htmlFor="method">Method *</label>
        <select id="method" name="method" value={form.method} onChange={handleChange}>
          <option value="CASH">Cash</option>
          <option value="BANK">Bank</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="date">Date *</label>
        <input id="date" name="date" type="date" value={form.date} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label htmlFor="reference">Reference</label>
        <input id="reference" name="reference" value={form.reference || ''} onChange={handleChange} />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
};

export default PaymentForm;
