import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { purchaseOrdersApi, contactsApi, productsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import PurchaseOrderForm from '../../components/forms/PurchaseOrderForm.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import PaginationBar from '../../components/common/PaginationBar.jsx';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders.js';
import { formatCurrency, formatDate } from '../../utils/format.js';

const PurchaseOrdersListPage = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);
  const { items, meta, loading, error, refetch, page, nextPage, prevPage } = usePurchaseOrders();

  useEffect(() => {
    (async () => {
      const [cRes, pRes] = await Promise.all([
        contactsApi.list({ limit: 100, type: 'VENDOR' }),
        productsApi.list({ limit: 100 }),
      ]);
      setContacts(cRes.data.data.contacts ?? []);
      setProducts(pRes.data.data.products ?? []);
    })();
  }, []);

  const columns = useMemo(() => [
    { key: 'number', label: 'Number', render: (r) => r.number || r.id?.slice(0, 8) },
    { key: 'contact', label: 'Vendor', render: (r) => r.contact?.name || '—' },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'status', label: 'Status' },
    { key: 'totalAmount', label: 'Total', render: (r) => formatCurrency(r.totalAmount) },
  ], []);

  const handleCreate = useCallback(async (data) => {
    await purchaseOrdersApi.create(data);
    setModalOpen(false);
    await refetch();
  }, [refetch]);

  return (
    <PageShell title="Purchase Orders" actions={<Button onClick={() => setModalOpen(true)}>+ New PO</Button>}>
      {error && <div className="alert-error">{error}</div>}
      {loading ? <LoadingSpinner /> : <Table columns={columns} data={items} onRowClick={(r) => navigate(`/purchase-orders/${r.id}`)} />}
      <PaginationBar meta={meta} page={page} onPrev={prevPage} onNext={nextPage} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Purchase Order">
        <PurchaseOrderForm contacts={contacts} products={products} onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
      </Modal>
    </PageShell>
  );
};

export default PurchaseOrdersListPage;
