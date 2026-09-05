import { useCallback, useMemo, useState } from 'react';
import { createCustomerInvoiceSchema } from '../../validators/customerInvoice.schema.js';
import { emptyLine, linesTotal, parseFormDate, toDateInput } from '../../utils/formHelpers.js';
import { formatCurrency } from '../../utils/format.js';
import Button from '../common/Button.jsx';

const CustomerInvoiceForm = ({ initialValues, onSubmit, onCancel, contacts = [], products = [], submitLabel = 'Save' }) => {
  const [form, setForm] = useState(() => ({
    contactId: initialValues?.contactId ?? '',
    invoiceDate: toDateInput(initialValues?.invoiceDate) || toDateInput(new Date()),
    dueDate: toDateInput(initialValues?.dueDate) || '',
    lines: initialValues?.lines?.length ? initialValues.lines : [emptyLine()],
  }));
  const [errors, setErrors] = useState({});
  const total = useMemo(() => linesTotal(form.lines), [form.lines]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const updateLine = useCallback((index, field, value) => {
    setForm((prev) => {
      const lines = [...prev.lines];
      lines[index] = { ...lines[index], [field]: value };
      return { ...prev, lines };
    });
  }, []);

  const addLine = () => setForm((prev) => ({ ...prev, lines: [...prev.lines, emptyLine()] }));
  const removeLine = (index) =>
    setForm((prev) => ({ ...prev, lines: prev.lines.filter((_, i) => i !== index) }));

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const payload = {
        ...form,
        invoiceDate: parseFormDate(form.invoiceDate),
        dueDate: form.dueDate ? parseFormDate(form.dueDate) : null,
        lines: form.lines.map((l) => ({
          ...l,
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
          tax: Number(l.tax || 0),
        })),
      };
      const result = createCustomerInvoiceSchema.safeParse(payload);
      if (!result.success) {
        const fieldErrors = {};
        result.error.errors.forEach((err) => {
          fieldErrors[err.path.join('.') || 'form'] = err.message;
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
        <label htmlFor="contactId">Customer *</label>
        <select id="contactId" name="contactId" value={form.contactId} onChange={handleChange}>
          <option value="">Select customer...</option>
          {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="invoiceDate">Invoice Date *</label>
        <input id="invoiceDate" name="invoiceDate" type="date" value={form.invoiceDate} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label htmlFor="dueDate">Due Date</label>
        <input id="dueDate" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
      </div>
      <h4 style={{ margin: '1rem 0 0.5rem' }}>Line Items</h4>
      {form.lines.map((line, idx) => (
        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <select value={line.productId} onChange={(e) => updateLine(idx, 'productId', e.target.value)}>
            <option value="">Product...</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input type="number" min="1" placeholder="Qty" value={line.quantity} onChange={(e) => updateLine(idx, 'quantity', e.target.value)} />
          <input type="number" min="0" step="0.01" placeholder="Price" value={line.unitPrice} onChange={(e) => updateLine(idx, 'unitPrice', e.target.value)} />
          <input type="number" min="0" step="0.01" placeholder="Tax" value={line.tax || 0} onChange={(e) => updateLine(idx, 'tax', e.target.value)} />
          <Button type="button" variant="secondary" onClick={() => removeLine(idx)} disabled={form.lines.length <= 1}>Remove</Button>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={addLine} style={{ marginBottom: '1rem' }}>+ Add Line</Button>
      <div style={{ fontWeight: 600, marginBottom: '1rem' }}>Total: {formatCurrency(total)}</div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
};

export default CustomerInvoiceForm;
