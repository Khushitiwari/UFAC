import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { customerInvoicesApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Button from '../../components/common/Button.jsx';
import Table from '../../components/common/Table.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { useSalesOrder } from '../../hooks/useSalesOrders.js';
import { formatCurrency, formatDate } from '../../utils/format.js';

const SalesOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { salesOrder, loading, error, refetch } = useSalesOrder(id);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { refetch(); }, [refetch]);

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

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert-error">{error}</div>;
  if (!salesOrder) return <div className="alert-error">Not found</div>;

  const canGenerate = salesOrder.status === 'CONFIRMED';

  return (
    <PageShell
      title={`SO ${salesOrder.number || salesOrder.id?.slice(0, 8)}`}
      actions={
        <>
          <Button onClick={handleGenerate} disabled={!canGenerate || generating}>
            {generating ? 'Generating...' : 'Generate Invoice'}
          </Button>
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
    </PageShell>
  );
};

export default SalesOrderDetailPage;
