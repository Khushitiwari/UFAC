import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticAccountsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import AnalyticAccountForm from '../../components/forms/AnalyticAccountForm.jsx';
import PaginationBar from '../../components/common/PaginationBar.jsx';
import { useAnalyticAccounts } from '../../hooks/useAnalyticAccounts.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { canWrite } from '../../utils/permissions.js';

const AnalyticAccountsListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const write = canWrite(user);
  const [modalOpen, setModalOpen] = useState(false);
  const { items, meta, loading, refreshing, error, refetch, page, nextPage, prevPage } = useAnalyticAccounts();

  const columns = useMemo(() => [
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
  ], []);

  const handleCreate = useCallback(async (data) => {
    await analyticAccountsApi.create(data);
    setModalOpen(false);
    await refetch();
  }, [refetch]);

  return (
    <PageShell title="Analytic Accounts" actions={write ? <Button onClick={() => setModalOpen(true)}>+ New</Button> : null}>
      {error && <div className="alert-error">{error}</div>}
      <Table loading={loading} refreshing={refreshing} columns={columns} data={items} onRowClick={(r) => navigate(`/analytic-accounts/${r.id}`)} />
      <PaginationBar meta={meta} page={page} onPrev={prevPage} onNext={nextPage} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Analytic Account">
        <AnalyticAccountForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
      </Modal>
    </PageShell>
  );
};

export default AnalyticAccountsListPage;
