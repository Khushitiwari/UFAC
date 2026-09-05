import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { paymentsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Button from '../../components/common/Button.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import PaymentForm from '../../components/forms/PaymentForm.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { useVendorBill } from '../../hooks/useVendorBills.js';
import { formatCurrency, formatDate } from '../../utils/format.js';
import { useToast } from '../../context/ToastContext.jsx';

const VendorBillDetailPage = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const { vendorBill, loading, error, refetch } = useVendorBill(id);
  const [paymentOpen, setPaymentOpen] = useState(false);

  useEffect(() => { refetch(); }, [refetch]);

  const paidAmount = useMemo(
    () => (vendorBill?.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0),
    [vendorBill],
  );
  const remaining = useMemo(
    () => Math.max(0, Number(vendorBill?.totalAmount || 0) - paidAmount),
    [vendorBill, paidAmount],
  );

  const lineColumns = useMemo(() => [
    { key: 'product', label: 'Product', render: (r) => r.product?.name || r.productId },
    { key: 'quantity', label: 'Qty' },
    { key: 'unitPrice', label: 'Unit Price', render: (r) => formatCurrency(r.unitPrice) },
  ], []);

  const paymentColumns = useMemo(() => [
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'method', label: 'Method' },
    { key: 'amount', label: 'Amount', render: (r) => formatCurrency(r.amount) },
    { key: 'reference', label: 'Reference', render: (r) => r.reference || '—' },
  ], []);

  const handlePayment = useCallback(
    async (data) => {
      await paymentsApi.create({ ...data, billId: id, contactId: vendorBill.contactId || vendorBill.contact?.id });
      showToast('Payment recorded', 'success');
      setPaymentOpen(false);
      await refetch();
    },
    [id, vendorBill, refetch, showToast],
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert-error">{error}</div>;
  if (!vendorBill) return <div className="alert-error">Not found</div>;

  return (
    <PageShell
      title={`Bill ${vendorBill.number || vendorBill.id?.slice(0, 8)}`}
      actions={
        <>
          <Button onClick={() => setPaymentOpen(true)} disabled={remaining <= 0}>Record Payment</Button>
          <Link to="/vendor-bills"><Button variant="secondary">Back</Button></Link>
        </>
      }
    >
      <div className="card" style={{ marginBottom: '1rem' }}>
        <p><strong>Vendor:</strong> {vendorBill.contact?.name || '—'}</p>
        <p><strong>Invoice Date:</strong> {formatDate(vendorBill.invoiceDate)}</p>
        <p><strong>Due Date:</strong> {vendorBill.dueDate ? formatDate(vendorBill.dueDate) : '—'}</p>
        <p><strong>Status:</strong> {vendorBill.status}</p>
        <p><strong>Total:</strong> {formatCurrency(vendorBill.totalAmount)}</p>
        <p><strong>Paid:</strong> {formatCurrency(paidAmount)}</p>
        <p><strong>Remaining:</strong> {formatCurrency(remaining)}</p>
      </div>
      <h3>Lines</h3>
      <Table columns={lineColumns} data={vendorBill.lines || []} />
      <h3 style={{ marginTop: '1.5rem' }}>Payments</h3>
      <Table columns={paymentColumns} data={vendorBill.payments || []} emptyMessage="No payments yet" />
      <Modal isOpen={paymentOpen} onClose={() => setPaymentOpen(false)} title="Record Payment">
        <PaymentForm
          initialValues={{ contactId: vendorBill.contactId || vendorBill.contact?.id, billId: id, amount: remaining }}
          maxAmount={remaining}
          onSubmit={handlePayment}
          onCancel={() => setPaymentOpen(false)}
        />
      </Modal>
    </PageShell>
  );
};

export default VendorBillDetailPage;
