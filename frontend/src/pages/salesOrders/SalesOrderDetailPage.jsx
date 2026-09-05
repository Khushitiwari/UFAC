import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { customerInvoicesApi, salesOrdersApi, contactsApi, productsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Button from '../../components/common/Button.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import SalesOrderForm from '../../components/forms/SalesOrderForm.jsx';
import AsyncPageGate from '../../components/common/AsyncPageGate.jsx';
import { useSalesOrder } from '../../hooks/useSalesOrders.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { canWrite, canDelete } from '../../utils/permissions.js';
import { formatCurrency, formatDate } from '../../utils/format.js';
import { useToast } from '../../context/ToastContext.jsx';

const SalesOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const write = canWrite(user);
  const del = canDelete(user);
  const { salesOrder, loading, error, refetch } = useSalesOrder(id);
  const [generating, setGenerating] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => { refetch(); }, [refetch]);

  useEffect(() => {
    if (!editOpen) return;
    (async () => {
      const [cRes, pRes] = await Promise.all([
        contactsApi.list({ limit: 100 }),
        productsApi.list({ limit: 100 }),
      ]);
      setContacts((cRes.data.data.contacts ?? []).filter((c) => c.type === 'CUSTOMER' || c.type === 'BOTH'));
      setProducts(pRes.data.data.products ?? []);
    })();
  }, [editOpen]);

  const lineColumns = useMemo(() => [
    { key: 'product', label: 'Product', render: (r) => r.product?.name || r.productId },
    { key: 'quantity', label: 'Qty' },
    { key: 'unitPrice', label: 'Unit Price', render: (r) => formatCurrency(r.unitPrice) },
    { key: 'tax', label: 'Tax', render: (r) => formatCurrency(r.tax) },
  ], []);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      const { data } = await customerInvoicesApi.createFromSO({
        salesOrderId: id,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 86400000),
      });
      const invoice = data.data.customerInvoice ?? data.data;
      navigate(`/customer-invoices/${invoice.id}`);
    } finally {
      setGenerating(false);
    }
  }, [id, navigate]);

  const handleUpdate = useCallback(async (data) => {
    await salesOrdersApi.update(id, data);
    showToast('Sales order updated', 'success');
    setEditOpen(false);
    await refetch();
  }, [id, refetch, showToast]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Delete this sales order?')) return;
    await salesOrdersApi.remove(id);
    navigate('/sales-orders');
  }, [id, navigate]);

  const canGenerate = write && salesOrder?.status === 'CONFIRMED';
  const canModify = write && salesOrder?.status !== 'INVOICED';

  return (
    <AsyncPageGate loading={loading} hasContent={!loading} label="Loading sales order...">
      {error && <div className="alert-error">{error}</div>}
      {!salesOrder && !loading && <div className="alert-error">Not found</div>}
      {salesOrder && (
    <PageShell
      title={`SO ${salesOrder.number || salesOrder.id?.slice(0, 8)}`}
      actions={
        <>
          {canGenerate && (
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generating...' : 'Generate Invoice'}
            </Button>
          )}
          {canModify && <Button variant="secondary" onClick={() => setEditOpen(true)}>Edit</Button>}
          {canModify && del && <Button variant="secondary" onClick={handleDelete}>Delete</Button>}
          <Link to="/sales-orders"><Button variant="secondary">Back</Button></Link>
        </>
      }
    >
      <div className="card" style={{ marginBottom: '1rem' }}>
        <p><strong>Customer:</strong> {salesOrder.contact?.name || '—'}</p>
        <p><strong>Date:</strong> {formatDate(salesOrder.date)}</p>
        <p><strong>Status:</strong> {salesOrder.status}</p>
        <p><strong>Total:</strong> {formatCurrency(salesOrder.totalAmount)}</p>
      </div>
      <Table columns={lineColumns} data={salesOrder.lines || []} />
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Sales Order">
        <SalesOrderForm
          initialValues={salesOrder}
          contacts={contacts}
          products={products}
          onSubmit={handleUpdate}
          onCancel={() => setEditOpen(false)}
          submitLabel="Update"
        />
      </Modal>
    </PageShell>
      )}
    </AsyncPageGate>
  );
};

export default SalesOrderDetailPage;
