import { useCallback, useState } from 'react';
import { createContactSchema } from '../../validators/contact.schema.js';
import Button from '../common/Button.jsx';

const defaultValues = {
  name: '',
  email: '',
  phone: '',
  address: '',
  type: 'CUSTOMER',
  taxId: '',
};

const ContactForm = ({ initialValues, onSubmit, onCancel, submitLabel = 'Save Contact' }) => {
  const [form, setForm] = useState({ ...defaultValues, ...initialValues });
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const result = createContactSchema.safeParse(form);
      if (!result.success) {
        const fieldErrors = {};
        result.error.errors.forEach((err) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }
      onSubmit(result.data);
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
        <label htmlFor="email">Email *</label>
        <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
        {errors.email && <div className="form-error">{errors.email}</div>}
      </div>
      <div className="form-group">
        <label htmlFor="type">Type</label>
        <select id="type" name="type" value={form.type} onChange={handleChange}>
          <option value="CUSTOMER">Customer</option>
          <option value="VENDOR">Vendor</option>
          <option value="BOTH">Both</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="phone">Phone</label>
        <input id="phone" name="phone" value={form.phone || ''} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label htmlFor="address">Address</label>
        <textarea id="address" name="address" rows={2} value={form.address || ''} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label htmlFor="taxId">Tax ID</label>
        <input id="taxId" name="taxId" value={form.taxId || ''} onChange={handleChange} />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
};

export default ContactForm;
