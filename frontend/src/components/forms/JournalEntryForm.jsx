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
    <form className="journal-entry-form" onSubmit={handleSubmit}>
      <div className="form-row journal-entry-meta">
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
      </div>

      <div className="form-group">
        <label htmlFor="reference">Reference</label>
        <input id="reference" name="reference" value={form.reference || ''} onChange={handleChange} placeholder="Optional reference" />
      </div>

      <div className="journal-entry-lines-section">
        <div className="journal-entry-lines-header">
          <h4>Journal Items</h4>
          <Button type="button" variant="secondary" className="btn-sm" onClick={addItem}>+ Add Line</Button>
        </div>
        {errors.items && <div className="form-error">{errors.items}</div>}

        <div className="journal-entry-table" role="table" aria-label="Journal line items">
          <div className="journal-entry-row journal-entry-row-head" role="row">
            <span role="columnheader">Account</span>
            <span role="columnheader">Debit</span>
            <span role="columnheader">Credit</span>
            <span role="columnheader" className="journal-entry-actions-head"> </span>
          </div>

          {form.items.map((item, idx) => (
            <div key={idx} className="journal-entry-row" role="row">
              <div className="journal-entry-field" role="cell">
                <label className="journal-entry-mobile-label" htmlFor={`account-${idx}`}>Account</label>
                <select
                  id={`account-${idx}`}
                  value={item.accountId}
                  onChange={(e) => updateItem(idx, 'accountId', e.target.value)}
                >
                  <option value="">Select account...</option>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="journal-entry-field" role="cell">
                <label className="journal-entry-mobile-label" htmlFor={`debit-${idx}`}>Debit</label>
                <input
                  id={`debit-${idx}`}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={item.debit}
                  onChange={(e) => updateItem(idx, 'debit', e.target.value)}
                />
              </div>
              <div className="journal-entry-field" role="cell">
                <label className="journal-entry-mobile-label" htmlFor={`credit-${idx}`}>Credit</label>
                <input
                  id={`credit-${idx}`}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={item.credit}
                  onChange={(e) => updateItem(idx, 'credit', e.target.value)}
                />
              </div>
              <div className="journal-entry-field journal-entry-field-action" role="cell">
                <Button
                  type="button"
                  variant="secondary"
                  className="btn-sm"
                  onClick={() => removeItem(idx)}
                  disabled={form.items.length <= 2}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`journal-entry-totals ${isBalanced ? 'is-balanced' : 'is-unbalanced'}`}>
        <div className="journal-entry-total">
          <span className="journal-entry-total-label">Total Debit</span>
          <span className="journal-entry-total-value">{formatCurrency(totalDebit)}</span>
        </div>
        <div className="journal-entry-total">
          <span className="journal-entry-total-label">Total Credit</span>
          <span className="journal-entry-total-value">{formatCurrency(totalCredit)}</span>
        </div>
        {!isBalanced && (
          <p className="form-error journal-entry-balance-error">Entry must be balanced before posting</p>
        )}
      </div>

      <div className="journal-entry-form-actions">
        <Button type="submit" disabled={!isBalanced}>{submitLabel}</Button>
      </div>
    </form>
  );
};

export default JournalEntryForm;
