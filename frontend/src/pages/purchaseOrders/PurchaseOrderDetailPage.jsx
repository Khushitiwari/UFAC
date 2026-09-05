import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { purchaseOrdersApi, vendorBillsApi, contactsApi, productsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Button from '../../components/common/Button.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import PurchaseOrderForm from '../../components/forms/PurchaseOrderForm.jsx';
import AsyncPageGate from '../../components/common/AsyncPageGate.jsx';
import { usePurchaseOrder } from '../../hooks/usePurchaseOrders.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { canWrite, canDelete } from '../../utils/permissions.js';
import { formatCurrency, formatDate } from '../../utils/format.js';
import { useToast } from '../../context/ToastContext.jsx';

const PurchaseOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const write = canWrite(user);
  const del = canDelete(user);
  const { purchaseOrder, loading, error, refetch } = usePurchaseOrder(id);
  const [converting, setConverting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => { refetch(); }, [refetch]);

  useEffect(() => {
    if (!editOpen) return;
    (async () => {
      const [cRes, pRes] = await Promise.all([
        contactsApi.list({ limit: 100, type: 'VENDOR' }),
        productsApi.list({ limit: 100 }),
      ]);
      setContacts(cRes.data.data.contacts ?? []);
      setProducts(pRes.data.data.products ?? []);
    })();
  }, [editOpen]);

  const lineColumns = useMemo(() => [
    { key: 'product', label: 'Product', render: (r) => r.product?.name || r.productId },
    { key: 'quantity', label: 'Qty' },
    { key: 'unitPrice', label: 'Unit Price', render: (r) => formatCurrency(r.unitPrice) },
    { key: 'subtotal', label: 'Subtotal', render: (r) => formatCurrency((r.quantity || 0) * (r.unitPrice || 0)) },
  ], []);

  const handleConvert = useCallback(async () => {
    setConverting(true);
    try {
      const { data } = await vendorBillsApi.createFromPO({
        purchaseOrderId: id,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 86400000),
      });
      const bill = data.data.vendorBill ?? data.data;
      navigate(`/vendor-bills/${bill.id}`);
    } finally {
      setConverting(false);
    }
  }, [id, navigate]);

  const handleUpdate = useCallback(async (data) => {
    await purchaseOrdersApi.update(id, data);
    showToast('Purchase order updated', 'success');
    setEditOpen(false);
    await refetch();
  }, [id, refetch, showToast]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Delete this purchase order?')) return;
    await purchaseOrdersApi.remove(id);
    navigate('/purchase-orders');
  }, [id, navigate]);

  const canConvert = write && purchaseOrder?.status === 'CONFIRMED';
  const canModify = write && purchaseOrder?.status !== 'BILLED';

  return (
    <AsyncPageGate loading={loading} hasContent={!loading} label="Loading purchase order...">
      {error && <div className="alert-error">{error}</div>}
      {!purchaseOrder && !loading && <div className="alert-error">Not found</div>}
      {purchaseOrder && (
    <PageShell
      title={`PO ${purchaseOrder.number || purchaseOrder.id?.slice(0, 8)}`}
      actions={
        <>
          {canConvert && (
            <Button onClick={handleConvert} disabled={converting}>
              {converting ? 'Converting...' : 'Convert to Bill'}
            </Button>
          )}
          {canModify && <Button variant="secondary" onClick={() => setEditOpen(true)}>Edit</Button>}
          {canModify && del && <Button variant="secondary" onClick={handleDelete}>Delete</Button>}
          <Link to="/purchase-orders"><Button variant="secondary">Back</Button></Link>
        </>
      }
    >
      <div className="card" style={{ marginBottom: '1rem' }}>
        <p><strong>Vendor:</strong> {purchaseOrder.contact?.name || '—'}</p>
        <p><strong>Date:</strong> {formatDate(purchaseOrder.date)}</p>
        <p><strong>Status:</strong> {purchaseOrder.status}</p>
        <p><strong>Total:</strong> {formatCurrency(purchaseOrder.totalAmount)}</p>
        {write && !canConvert && purchaseOrder.status !== 'BILLED' && (
          <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>Convert to Bill is available when status is CONFIRMED.</p>
        )}
      </div>
      <h3>Lines</h3>
      <Table columns={lineColumns} data={purchaseOrder.lines || []} emptyMessage="No lines" />
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Purchase Order">
        <PurchaseOrderForm
          initialValues={purchaseOrder}
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

export default PurchaseOrderDetailPage;
