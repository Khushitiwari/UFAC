import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { paymentsApi, customerInvoicesApi, contactsApi, productsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Button from '../../components/common/Button.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import PaymentForm from '../../components/forms/PaymentForm.jsx';
import CustomerInvoiceForm from '../../components/forms/CustomerInvoiceForm.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { useCustomerInvoice } from '../../hooks/useCustomerInvoices.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { canWrite, canDelete } from '../../utils/permissions.js';
import { formatCurrency, formatDate } from '../../utils/format.js';
import { useToast } from '../../context/ToastContext.jsx';

const CustomerInvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const write = canWrite(user);
  const del = canDelete(user);
  const { customerInvoice, loading, error, refetch } = useCustomerInvoice(id);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => { refetch(); }, [refetch]);

  useEffect(() => {
    if (!editOpen) return;
    (async () => {
      const [cRes, pRes] = await Promise.all([contactsApi.list({ limit: 100 }), productsApi.list({ limit: 100 })]);
      setContacts((cRes.data.data.contacts ?? []).filter((c) => c.type === 'CUSTOMER' || c.type === 'BOTH'));
      setProducts(pRes.data.data.products ?? []);
    })();
  }, [editOpen]);

  const paidAmount = useMemo(
    () => (customerInvoice?.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0),
    [customerInvoice],
  );
  const remaining = useMemo(
    () => Math.max(0, Number(customerInvoice?.totalAmount || 0) - paidAmount),
    [customerInvoice, paidAmount],
  );

  const lineColumns = useMemo(() => [
    { key: 'product', label: 'Product', render: (r) => r.product?.name || r.productId },
    { key: 'quantity', label: 'Qty' },
    { key: 'unitPrice', label: 'Unit Price', render: (r) => formatCurrency(r.unitPrice) },
    { key: 'tax', label: 'Tax', render: (r) => formatCurrency(r.tax) },
  ], []);

  const paymentColumns = useMemo(() => [
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'method', label: 'Method' },
    { key: 'amount', label: 'Amount', render: (r) => formatCurrency(r.amount) },
  ], []);

  const handlePayment = useCallback(
    async (data) => {
      await paymentsApi.create({
        ...data,
        invoiceId: id,
        contactId: customerInvoice.contactId || customerInvoice.contact?.id,
      });
      showToast('Payment recorded', 'success');
      setPaymentOpen(false);
      await refetch();
    },
    [id, customerInvoice, refetch, showToast],
  );

  const handleUpdate = useCallback(async (data) => {
    await customerInvoicesApi.update(id, data);
    showToast('Customer invoice updated', 'success');
    setEditOpen(false);
    await refetch();
  }, [id, refetch, showToast]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Delete this customer invoice?')) return;
    await customerInvoicesApi.remove(id);
    navigate('/customer-invoices');
  }, [id, navigate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert-error">{error}</div>;
  if (!customerInvoice) return <div className="alert-error">Not found</div>;

  const hasPayments = (customerInvoice.payments || []).length > 0;
  const canModify = write && !hasPayments;

  return (
    <PageShell
      title={`Invoice ${customerInvoice.number || customerInvoice.id?.slice(0, 8)}`}
      actions={
        <>
          {write && <Button onClick={() => setPaymentOpen(true)} disabled={remaining <= 0}>Record Payment</Button>}
          {canModify && <Button variant="secondary" onClick={() => setEditOpen(true)}>Edit</Button>}
          {canModify && del && <Button variant="secondary" onClick={handleDelete}>Delete</Button>}
          <Link to="/customer-invoices"><Button variant="secondary">Back</Button></Link>
        </>
      }
    >
      <div className="card" style={{ marginBottom: '1rem' }}>
        <p><strong>Customer:</strong> {customerInvoice.contact?.name || '—'}</p>
        <p><strong>Invoice Date:</strong> {formatDate(customerInvoice.invoiceDate)}</p>
        <p><strong>Status:</strong> {customerInvoice.status}</p>
        <p><strong>Total:</strong> {formatCurrency(customerInvoice.totalAmount)}</p>
        <p><strong>Paid:</strong> {formatCurrency(paidAmount)}</p>
        <p><strong>Remaining:</strong> {formatCurrency(remaining)}</p>
      </div>
      <Table columns={lineColumns} data={customerInvoice.lines || []} />
      <h3 style={{ marginTop: '1.5rem' }}>Payments</h3>
      <Table columns={paymentColumns} data={customerInvoice.payments || []} emptyMessage="No payments yet" />
      <Modal isOpen={paymentOpen} onClose={() => setPaymentOpen(false)} title="Record Payment">
        <PaymentForm
          initialValues={{ contactId: customerInvoice.contactId || customerInvoice.contact?.id, invoiceId: id, amount: remaining }}
          maxAmount={remaining}
          onSubmit={handlePayment}
          onCancel={() => setPaymentOpen(false)}
        />
      </Modal>
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Customer Invoice">
        <CustomerInvoiceForm
          initialValues={customerInvoice}
          contacts={contacts}
          products={products}
          onSubmit={handleUpdate}
          onCancel={() => setEditOpen(false)}
          submitLabel="Update"
        />
      </Modal>
    </PageShell>
  );
};

export default CustomerInvoiceDetailPage;
