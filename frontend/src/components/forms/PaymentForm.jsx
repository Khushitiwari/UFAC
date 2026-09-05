import { useCallback, useMemo, useState } from 'react';
import { createPaymentSchema } from '../../validators/payment.schema.js';
import { parseFormDate, toDateInput } from '../../utils/formHelpers.js';
import { formatCurrency } from '../../utils/format.js';
import Button from '../common/Button.jsx';

const PaymentForm = ({
  initialValues,
  onSubmit,
  onCancel,
  maxAmount,
  submitLabel = 'Record Payment',
  standalone = false,
  contacts = [],
  bills = [],
  invoices = [],
}) => {
  const [form, setForm] = useState(() => ({
    contactId: initialValues?.contactId ?? '',
    billId: initialValues?.billId ?? null,
    invoiceId: initialValues?.invoiceId ?? null,
    method: initialValues?.method ?? 'BANK',
    amount: initialValues?.amount ?? maxAmount ?? 0,
    date: toDateInput(initialValues?.date) || toDateInput(new Date()),
    reference: initialValues?.reference ?? '',
    documentType: initialValues?.billId ? 'bill' : initialValues?.invoiceId ? 'invoice' : 'bill',
  }));
  const [errors, setErrors] = useState({});

  const filteredBills = useMemo(
    () => bills.filter((b) => !form.contactId || b.contactId === form.contactId || b.contact?.id === form.contactId),
    [bills, form.contactId],
  );

  const filteredInvoices = useMemo(
    () => invoices.filter((i) => !form.contactId || i.contactId === form.contactId || i.contact?.id === form.contactId),
    [invoices, form.contactId],
  );

  const selectedDocRemaining = useMemo(() => {
    if (form.documentType === 'bill' && form.billId) {
      const bill = bills.find((b) => b.id === form.billId);
      if (!bill) return null;
      const paid = (bill.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0);
      return Math.max(0, Number(bill.totalAmount || 0) - paid);
    }
    if (form.documentType === 'invoice' && form.invoiceId) {
      const invoice = invoices.find((i) => i.id === form.invoiceId);
      if (!invoice) return null;
      const paid = (invoice.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0);
      return Math.max(0, Number(invoice.totalAmount || 0) - paid);
    }
    return null;
  }, [form.documentType, form.billId, form.invoiceId, bills, invoices]);

  const effectiveMax = maxAmount ?? selectedDocRemaining;

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleDocumentTypeChange = useCallback((e) => {
    const documentType = e.target.value;
    setForm((prev) => ({
      ...prev,
      documentType,
      billId: documentType === 'bill' ? prev.billId : null,
      invoiceId: documentType === 'invoice' ? prev.invoiceId : null,
    }));
  }, []);

  const handleDocumentChange = useCallback(
    (e) => {
      const { value } = e.target;
      if (form.documentType === 'bill') {
        const bill = bills.find((b) => b.id === value);
        const paid = (bill?.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0);
        const remaining = bill ? Math.max(0, Number(bill.totalAmount || 0) - paid) : 0;
        setForm((prev) => ({
          ...prev,
          billId: value || null,
          invoiceId: null,
          contactId: bill?.contactId || bill?.contact?.id || prev.contactId,
          amount: remaining,
        }));
      } else {
        const invoice = invoices.find((i) => i.id === value);
        const paid = (invoice?.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0);
        const remaining = invoice ? Math.max(0, Number(invoice.totalAmount || 0) - paid) : 0;
        setForm((prev) => ({
          ...prev,
          invoiceId: value || null,
          billId: null,
          contactId: invoice?.contactId || invoice?.contact?.id || prev.contactId,
          amount: remaining,
        }));
      }
    },
    [form.documentType, bills, invoices],
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const payload = {
        contactId: form.contactId,
        billId: form.documentType === 'bill' ? form.billId : null,
        invoiceId: form.documentType === 'invoice' ? form.invoiceId : null,
        method: form.method,
        amount: Number(form.amount),
        date: parseFormDate(form.date),
        reference: form.reference || null,
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
      if (effectiveMax != null && result.data.amount > effectiveMax) {
        setErrors({ amount: `Amount cannot exceed ${effectiveMax.toFixed(2)}` });
        return;
      }
      await onSubmit(result.data);
    },
    [form, onSubmit, effectiveMax],
  );

  const cappedHint = useMemo(
    () => (effectiveMax != null ? `Maximum: ${formatCurrency(effectiveMax)}` : null),
    [effectiveMax],
  );

  return (
    <form onSubmit={handleSubmit}>
      {standalone && (
        <>
          <div className="form-group">
            <label htmlFor="contactId">Contact *</label>
            <select id="contactId" name="contactId" value={form.contactId} onChange={handleChange}>
              <option value="">Select contact...</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.contactId && <div className="form-error">{errors.contactId}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="documentType">Apply to</label>
            <select id="documentType" name="documentType" value={form.documentType} onChange={handleDocumentTypeChange}>
              <option value="bill">Vendor Bill</option>
              <option value="invoice">Customer Invoice</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="documentId">{form.documentType === 'bill' ? 'Vendor Bill' : 'Customer Invoice'} *</label>
            <select
              id="documentId"
              value={form.documentType === 'bill' ? (form.billId || '') : (form.invoiceId || '')}
              onChange={handleDocumentChange}
            >
              <option value="">Select document...</option>
              {form.documentType === 'bill'
                ? filteredBills.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.number || b.id?.slice(0, 8)} — {formatCurrency(b.totalAmount)} ({b.status})
                    </option>
                  ))
                : filteredInvoices.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.number || i.id?.slice(0, 8)} — {formatCurrency(i.totalAmount)} ({i.status})
                    </option>
                  ))}
            </select>
            {errors.billId && <div className="form-error">{errors.billId}</div>}
          </div>
        </>
      )}
      <div className="form-group">
        <label htmlFor="amount">Amount *</label>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          max={effectiveMax ?? undefined}
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
