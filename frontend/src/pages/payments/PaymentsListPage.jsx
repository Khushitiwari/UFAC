import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contactsApi, vendorBillsApi, customerInvoicesApi, paymentsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import PaymentForm from '../../components/forms/PaymentForm.jsx';
import PaginationBar from '../../components/common/PaginationBar.jsx';
import { usePayments } from '../../hooks/usePayments.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { canWrite } from '../../utils/permissions.js';
import { formatCurrency, formatDate } from '../../utils/format.js';
import { useToast } from '../../context/ToastContext.jsx';

const PaymentsListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const write = canWrite(user);
  const { items, meta, loading, refreshing, error, refetch, page, nextPage, prevPage } = usePayments();
  const [modalOpen, setModalOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [bills, setBills] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    if (!modalOpen) return;
    (async () => {
      const [cRes, bRes, iRes] = await Promise.all([
        contactsApi.list({ limit: 100 }),
        vendorBillsApi.list({ limit: 100 }),
        customerInvoicesApi.list({ limit: 100 }),
      ]);
      setContacts(cRes.data.data.contacts ?? []);
      setBills((bRes.data.data.vendorBills ?? []).filter((b) => b.status !== 'PAID'));
      setInvoices((iRes.data.data.customerInvoices ?? []).filter((i) => i.status !== 'PAID'));
    })();
  }, [modalOpen]);

  const columns = useMemo(() => [
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'contact', label: 'Contact', render: (r) => r.contact?.name || '—' },
    { key: 'method', label: 'Method' },
    { key: 'amount', label: 'Amount', render: (r) => formatCurrency(r.amount) },
    { key: 'reference', label: 'Reference', render: (r) => r.reference || '—' },
  ], []);

  const handleCreate = useCallback(async (data) => {
    await paymentsApi.create(data);
    showToast('Payment recorded', 'success');
    setModalOpen(false);
    await refetch();
  }, [refetch, showToast]);

  return (
    <PageShell
      title="Payments"
      actions={write ? <Button onClick={() => setModalOpen(true)}>+ Record Payment</Button> : null}
    >
      {error && <div className="alert-error">{error}</div>}
      <Table loading={loading} refreshing={refreshing} columns={columns} data={items} onRowClick={(r) => navigate(`/payments/${r.id}`)} />
      <PaginationBar meta={meta} page={page} onPrev={prevPage} onNext={nextPage} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Record Payment">
        <PaymentForm
          standalone
          contacts={contacts}
          bills={bills}
          invoices={invoices}
          onSubmit={handleCreate}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </PageShell>
  );
};

export default PaymentsListPage;
