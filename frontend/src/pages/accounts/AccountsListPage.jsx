import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import AccountForm from '../../components/forms/AccountForm.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import PaginationBar from '../../components/common/PaginationBar.jsx';
import { useAccounts } from '../../hooks/useAccounts.js';

const AccountsListPage = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const { items, meta, loading, error, refetch, page, nextPage, prevPage } = useAccounts();

  const columns = useMemo(() => [
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type' },
    { key: 'isActive', label: 'Active', render: (r) => (r.isActive !== false ? 'Yes' : 'No') },
  ], []);

  const handleCreate = useCallback(async (data) => {
    await accountsApi.create(data);
    setModalOpen(false);
    await refetch();
  }, [refetch]);

  return (
    <PageShell title="Chart of Accounts" actions={<Button onClick={() => setModalOpen(true)}>+ New Account</Button>}>
      {error && <div className="alert-error">{error}</div>}
      {loading ? <LoadingSpinner /> : <Table columns={columns} data={items} onRowClick={(r) => navigate(`/accounts/${r.id}`)} />}
      <PaginationBar meta={meta} page={page} onPrev={prevPage} onNext={nextPage} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Account">
        <AccountForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
      </Modal>
    </PageShell>
  );
};

export default AccountsListPage;
