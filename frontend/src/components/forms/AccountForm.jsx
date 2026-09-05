import { useCallback, useState } from 'react';
import { createAccountSchema } from '../../validators/account.schema.js';
import Button from '../common/Button.jsx';

const defaultValues = { name: '', type: 'ASSET', isActive: true };

const AccountForm = ({ initialValues, onSubmit, onCancel, submitLabel = 'Save Account' }) => {
  const [form, setForm] = useState({ ...defaultValues, ...initialValues });
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const result = createAccountSchema.safeParse(form);
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
          <option value="ASSET">Asset</option>
          <option value="LIABILITY">Liability</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
          <option value="CAPITAL">Capital</option>
        </select>
      </div>
      <div className="form-group">
        <label>
          <input type="checkbox" name="isActive" checked={!!form.isActive} onChange={handleChange} /> Active
        </label>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
};

export default AccountForm;
