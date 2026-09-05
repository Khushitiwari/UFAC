import { useCallback, useState } from 'react';
import { createPortalUserSchema } from '../../validators/contact.schema.js';
import Button from '../common/Button.jsx';

const PortalUserForm = ({ contact, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    name: contact?.name || '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const result = createPortalUserSchema.safeParse(form);
      if (!result.success) {
        const fieldErrors = {};
        result.error.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }
      try {
        await onSubmit(result.data);
      } catch (err) {
        setErrors({ form: err.response?.data?.error || 'Failed to create portal user' });
      }
    },
    [form, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit}>
      {errors.form && <div className="alert-error">{errors.form}</div>}
      <p className="field-hint">Login email: <strong>{contact.email}</strong></p>
      <div className="form-group">
        <label htmlFor="name">Display name</label>
        <input
          id="name"
          name="name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password *</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />
        {errors.password && <div className="form-error">{errors.password}</div>}
      </div>
      <div className="form-actions">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit">Create Portal User</Button>
      </div>
    </form>
  );
};

export default PortalUserForm;
