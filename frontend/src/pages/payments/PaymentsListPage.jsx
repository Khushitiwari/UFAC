import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/common/PageShell.jsx';
import Table from '../../components/common/Table.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import PaginationBar from '../../components/common/PaginationBar.jsx';
import { usePayments } from '../../hooks/usePayments.js';
import { formatCurrency, formatDate } from '../../utils/format.js';

const PaymentsListPage = () => {
  const navigate = useNavigate();
  const { items, meta, loading, error, page, nextPage, prevPage } = usePayments();

  const columns = useMemo(() => [
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'contact', label: 'Contact', render: (r) => r.contact?.name || '—' },
    { key: 'method', label: 'Method' },
    { key: 'amount', label: 'Amount', render: (r) => formatCurrency(r.amount) },
    { key: 'reference', label: 'Reference', render: (r) => r.reference || '—' },
  ], []);

  return (
    <PageShell title="Payments">
      {error && <div className="alert-error">{error}</div>}
      {loading ? <LoadingSpinner /> : <Table columns={columns} data={items} onRowClick={(r) => navigate(`/payments/${r.id}`)} />}
      <PaginationBar meta={meta} page={page} onPrev={prevPage} onNext={nextPage} />
    </PageShell>
  );
};

export default PaymentsListPage;
