import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticAccountsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import AnalyticAccountForm from '../../components/forms/AnalyticAccountForm.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import PaginationBar from '../../components/common/PaginationBar.jsx';
import { useAnalyticAccounts } from '../../hooks/useAnalyticAccounts.js';

const AnalyticAccountsListPage = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const { items, meta, loading, error, refetch, page, nextPage, prevPage } = useAnalyticAccounts();

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
    <PageShell title="Analytic Accounts" actions={<Button onClick={() => setModalOpen(true)}>+ New</Button>}>
      {error && <div className="alert-error">{error}</div>}
      {loading ? <LoadingSpinner /> : <Table columns={columns} data={items} onRowClick={(r) => navigate(`/analytic-accounts/${r.id}`)} />}
      <PaginationBar meta={meta} page={page} onPrev={prevPage} onNext={nextPage} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Analytic Account">
        <AnalyticAccountForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
      </Modal>
    </PageShell>
  );
};

export default AnalyticAccountsListPage;
