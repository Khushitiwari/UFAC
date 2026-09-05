import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerInvoicesApi, contactsApi, productsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import CustomerInvoiceForm from '../../components/forms/CustomerInvoiceForm.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import PaginationBar from '../../components/common/PaginationBar.jsx';
import { useCustomerInvoices } from '../../hooks/useCustomerInvoices.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { canWrite } from '../../utils/permissions.js';
import { formatCurrency, formatDate } from '../../utils/format.js';

const CustomerInvoicesListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const write = canWrite(user);
  const [modalOpen, setModalOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);
  const { items, meta, loading, error, refetch, page, nextPage, prevPage } = useCustomerInvoices();

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
    { key: 'invoiceDate', label: 'Date', render: (r) => formatDate(r.invoiceDate) },
    { key: 'status', label: 'Status' },
    { key: 'totalAmount', label: 'Total', render: (r) => formatCurrency(r.totalAmount) },
  ], []);

  const handleCreate = useCallback(async (data) => {
    await customerInvoicesApi.create(data);
    setModalOpen(false);
    await refetch();
  }, [refetch]);

  return (
    <PageShell title="Customer Invoices" actions={write ? <Button onClick={() => setModalOpen(true)}>+ New Invoice</Button> : null}>
      {error && <div className="alert-error">{error}</div>}
      {loading ? <LoadingSpinner /> : <Table columns={columns} data={items} onRowClick={(r) => navigate(`/customer-invoices/${r.id}`)} />}
      <PaginationBar meta={meta} page={page} onPrev={prevPage} onNext={nextPage} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Customer Invoice">
        <CustomerInvoiceForm contacts={contacts.filter((c) => c.type === 'CUSTOMER' || c.type === 'BOTH')} products={products} onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
      </Modal>
    </PageShell>
  );
};

export default CustomerInvoicesListPage;
