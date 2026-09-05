import { useCallback, useMemo, useState } from 'react';
import { createJournalEntrySchema } from '../../validators/journalEntry.schema.js';
import { parseFormDate, toDateInput } from '../../utils/formHelpers.js';
import { formatCurrency } from '../../utils/format.js';
import Button from '../common/Button.jsx';

const emptyItem = () => ({ accountId: '', debit: 0, credit: 0, description: '' });

const JournalEntryForm = ({ onSubmit, journals = [], accounts = [], submitLabel = 'Post Entry' }) => {
  const [form, setForm] = useState({
    journalId: '',
    date: toDateInput(new Date()),
    reference: '',
    sourceType: 'MANUAL',
    items: [emptyItem(), emptyItem()],
  });
  const [errors, setErrors] = useState({});

  const { totalDebit, totalCredit, isBalanced } = useMemo(() => {
    const totalDebit = form.items.reduce((s, i) => s + Number(i.debit || 0), 0);
    const totalCredit = form.items.reduce((s, i) => s + Number(i.credit || 0), 0);
    return { totalDebit, totalCredit, isBalanced: Math.abs(totalDebit - totalCredit) < 0.001 && totalDebit > 0 };
  }, [form.items]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const updateItem = useCallback((index, field, value) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  }, []);

  const addItem = () => setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
  const removeItem = (index) =>
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const payload = {
        ...form,
        date: parseFormDate(form.date),
        items: form.items.map((i) => ({
          ...i,
          debit: Number(i.debit || 0),
          credit: Number(i.credit || 0),
        })),
      };
      const result = createJournalEntrySchema.safeParse(payload);
      if (!result.success) {
        const fieldErrors = {};
        result.error.errors.forEach((err) => {
          fieldErrors[err.path.join('.') || 'form'] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }
      setErrors({});
      try {
        await onSubmit(result.data);
      } catch {
        // Parent handles toast; keep form state for correction
      }
    },
    [form, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="journalId">Journal *</label>
        <select id="journalId" name="journalId" value={form.journalId} onChange={handleChange}>
          <option value="">Select journal...</option>
          {journals.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
        </select>
        {errors.journalId && <div className="form-error">{errors.journalId}</div>}
      </div>
      <div className="form-group">
        <label htmlFor="date">Date *</label>
        <input id="date" name="date" type="date" value={form.date} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label htmlFor="reference">Reference</label>
        <input id="reference" name="reference" value={form.reference || ''} onChange={handleChange} />
      </div>
      <h4 style={{ margin: '1rem 0 0.5rem' }}>Journal Items</h4>
      {errors.items && <div className="form-error">{errors.items}</div>}
      {form.items.map((item, idx) => (
        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <select value={item.accountId} onChange={(e) => updateItem(idx, 'accountId', e.target.value)}>
            <option value="">Account...</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <input type="number" min="0" step="0.01" placeholder="Debit" value={item.debit} onChange={(e) => updateItem(idx, 'debit', e.target.value)} />
          <input type="number" min="0" step="0.01" placeholder="Credit" value={item.credit} onChange={(e) => updateItem(idx, 'credit', e.target.value)} />
          <Button type="button" variant="secondary" onClick={() => removeItem(idx)} disabled={form.items.length <= 2}>Remove</Button>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={addItem} style={{ marginBottom: '1rem' }}>+ Add Line</Button>
      <div style={{ marginBottom: '1rem' }}>
        <div>Total Debit: {formatCurrency(totalDebit)}</div>
        <div>Total Credit: {formatCurrency(totalCredit)}</div>
        {!isBalanced && <div className="form-error">Entry must be balanced before posting</div>}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <Button type="submit" disabled={!isBalanced}>{submitLabel}</Button>
      </div>
    </form>
  );
};

export default JournalEntryForm;
