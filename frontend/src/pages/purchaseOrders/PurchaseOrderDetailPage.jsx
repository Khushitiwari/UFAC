import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { vendorBillsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Button from '../../components/common/Button.jsx';
import Table from '../../components/common/Table.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { usePurchaseOrder } from '../../hooks/usePurchaseOrders.js';
import { formatCurrency, formatDate } from '../../utils/format.js';

const PurchaseOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { purchaseOrder, loading, error, refetch } = usePurchaseOrder(id);
  const [converting, setConverting] = useState(false);

  useEffect(() => { refetch(); }, [refetch]);

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

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert-error">{error}</div>;
  if (!purchaseOrder) return <div className="alert-error">Not found</div>;

  const canConvert = purchaseOrder.status === 'CONFIRMED';

  return (
    <PageShell
      title={`PO ${purchaseOrder.number || purchaseOrder.id?.slice(0, 8)}`}
      actions={
        <>
          <Button onClick={handleConvert} disabled={!canConvert || converting}>
            {converting ? 'Converting...' : 'Convert to Bill'}
          </Button>
          <Link to="/purchase-orders"><Button variant="secondary">Back</Button></Link>
        </>
      }
    >
      <div className="card" style={{ marginBottom: '1rem' }}>
        <p><strong>Vendor:</strong> {purchaseOrder.contact?.name || '—'}</p>
        <p><strong>Date:</strong> {formatDate(purchaseOrder.date)}</p>
        <p><strong>Status:</strong> {purchaseOrder.status}</p>
        <p><strong>Total:</strong> {formatCurrency(purchaseOrder.totalAmount)}</p>
        {!canConvert && <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>Convert to Bill is available when status is CONFIRMED.</p>}
      </div>
      <h3>Lines</h3>
      <Table columns={lineColumns} data={purchaseOrder.lines || []} emptyMessage="No lines" />
    </PageShell>
  );
};

export default PurchaseOrderDetailPage;
