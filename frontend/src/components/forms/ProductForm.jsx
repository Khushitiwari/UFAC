import { useCallback, useState } from 'react';
import { createProductSchema } from '../../validators/product.schema.js';
import Button from '../common/Button.jsx';

const defaultValues = {
  name: '',
  type: 'GOODS',
  salesPrice: 0,
  cost: 0,
  category: '',
  description: '',
};

const ProductForm = ({ initialValues, onSubmit, onCancel, submitLabel = 'Save Product' }) => {
  const [form, setForm] = useState({ ...defaultValues, ...initialValues });
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const result = createProductSchema.safeParse(form);
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
        <label htmlFor="type">Type</label>
        <select id="type" name="type" value={form.type} onChange={handleChange}>
          <option value="GOODS">Goods</option>
          <option value="SERVICE">Service</option>
          <option value="COMBO">Combo</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="category">Category *</label>
        <input id="category" name="category" value={form.category} onChange={handleChange} />
        {errors.category && <div className="form-error">{errors.category}</div>}
      </div>
      <div className="form-group">
        <label htmlFor="salesPrice">Sales Price *</label>
        <input id="salesPrice" name="salesPrice" type="number" step="0.01" min="0" value={form.salesPrice} onChange={handleChange} />
        {errors.salesPrice && <div className="form-error">{errors.salesPrice}</div>}
      </div>
      <div className="form-group">
        <label htmlFor="cost">Cost</label>
        <input id="cost" name="cost" type="number" step="0.01" min="0" value={form.cost} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={2} value={form.description || ''} onChange={handleChange} />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
};

export default ProductForm;
