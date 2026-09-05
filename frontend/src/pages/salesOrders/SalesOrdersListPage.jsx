import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesOrdersApi, contactsApi, productsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import SalesOrderForm from '../../components/forms/SalesOrderForm.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import PaginationBar from '../../components/common/PaginationBar.jsx';
import { useSalesOrders } from '../../hooks/useSalesOrders.js';
import { formatCurrency, formatDate } from '../../utils/format.js';

const SalesOrdersListPage = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);
  const { items, meta, loading, error, refetch, page, nextPage, prevPage } = useSalesOrders();

  useEffect(() => {
    (async () => {
      const [cRes, pRes] = await Promise.all([contactsApi.list({ limit: 100 }), productsApi.list({ limit: 100 })]);
      setContacts(cRes.data.data.contacts ?? []);
      setProducts(pRes.data.data.products ?? []);
    })();
  }, []);

  const columns = useMemo(() => [
    { key: 'number', label: 'Number', render: (r) => r.number || r.id?.slice(0, 8) },
    { key: 'contact', label: 'Customer', render: (r) => r.contact?.name || '—' },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'status', label: 'Status' },
    { key: 'totalAmount', label: 'Total', render: (r) => formatCurrency(r.totalAmount) },
  ], []);

  const handleCreate = useCallback(async (data) => {
    await salesOrdersApi.create(data);
    setModalOpen(false);
    await refetch();
  }, [refetch]);

  return (
    <PageShell title="Sales Orders" actions={<Button onClick={() => setModalOpen(true)}>+ New SO</Button>}>
      {error && <div className="alert-error">{error}</div>}
      {loading ? <LoadingSpinner /> : <Table columns={columns} data={items} onRowClick={(r) => navigate(`/sales-orders/${r.id}`)} />}
      <PaginationBar meta={meta} page={page} onPrev={prevPage} onNext={nextPage} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Sales Order">
        <SalesOrderForm contacts={contacts.filter((c) => c.type === 'CUSTOMER' || c.type === 'BOTH')} products={products} onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
      </Modal>
    </PageShell>
  );
};

export default SalesOrdersListPage;
