import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageShell from '../../components/common/PageShell.jsx';
import Button from '../../components/common/Button.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { usePayment } from '../../hooks/usePayments.js';
import { formatCurrency, formatDate } from '../../utils/format.js';

const PaymentDetailPage = () => {
  const { id } = useParams();
  const { payment, loading, error, refetch } = usePayment(id);

  useEffect(() => { refetch(); }, [refetch]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert-error">{error}</div>;
  if (!payment) return <div className="alert-error">Not found</div>;

  return (
    <PageShell title="Payment Detail" actions={<Link to="/payments"><Button variant="secondary">Back</Button></Link>}>
      <div className="card">
        <p><strong>Date:</strong> {formatDate(payment.date)}</p>
        <p><strong>Contact:</strong> {payment.contact?.name || '—'}</p>
        <p><strong>Method:</strong> {payment.method}</p>
        <p><strong>Amount:</strong> {formatCurrency(payment.amount)}</p>
        <p><strong>Reference:</strong> {payment.reference || '—'}</p>
        {payment.billId && <p><strong>Bill ID:</strong> <Link to={`/vendor-bills/${payment.billId}`}>{payment.billId}</Link></p>}
        {payment.invoiceId && <p><strong>Invoice ID:</strong> <Link to={`/customer-invoices/${payment.invoiceId}`}>{payment.invoiceId}</Link></p>}
      </div>
    </PageShell>
  );
};

export default PaymentDetailPage;
