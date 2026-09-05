import { useCallback, useState } from 'react';
import { createJournalSchema } from '../../validators/journal.schema.js';
import Button from '../common/Button.jsx';

const defaultValues = { name: '', type: 'CASH', defaultAccountId: '' };

const JournalForm = ({ initialValues, onSubmit, onCancel, submitLabel = 'Save Journal' }) => {
  const [form, setForm] = useState({ ...defaultValues, ...initialValues, type: initialValues?.type || 'CASH' });
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const payload = { ...form, defaultAccountId: form.defaultAccountId || null };
      const result = createJournalSchema.safeParse(payload);
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
        <label htmlFor="type">Type *</label>
        <select id="type" name="type" value={form.type} onChange={handleChange}>
          <option value="SALES">Sales</option>
          <option value="PURCHASE">Purchase</option>
          <option value="BANK">Bank</option>
          <option value="CASH">Cash</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
};

export default JournalForm;
