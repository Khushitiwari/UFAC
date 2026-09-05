import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { budgetsApi, analyticAccountsApi } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import PageShell from '../../components/common/PageShell.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import BudgetForm from '../../components/forms/BudgetForm.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import PaginationBar from '../../components/common/PaginationBar.jsx';
import { useBudgets } from '../../hooks/useBudgets.js';
import { formatCurrency, formatDate } from '../../utils/format.js';

const BudgetsListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [analyticAccounts, setAnalyticAccounts] = useState([]);
  const { items, meta, loading, error, refetch, page, nextPage, prevPage } = useBudgets();

  useEffect(() => {
    analyticAccountsApi.list({ limit: 100 }).then((res) => {
      setAnalyticAccounts(res.data.data.analyticAccounts ?? []);
    });
  }, []);

  const columns = useMemo(() => [
    { key: 'name', label: 'Name' },
    { key: 'periodStart', label: 'Start', render: (r) => formatDate(r.periodStart) },
    { key: 'periodEnd', label: 'End', render: (r) => formatDate(r.periodEnd) },
    { key: 'plannedAmount', label: 'Planned', render: (r) => formatCurrency(r.plannedAmount) },
  ], []);

  const handleCreate = useCallback(async (data) => {
    await budgetsApi.create({ ...data, responsiblePersonId: data.responsiblePersonId || user?.id });
    setModalOpen(false);
    await refetch();
  }, [refetch, user]);

  return (
    <PageShell title="Budget" actions={<Button onClick={() => setModalOpen(true)}>+ New Budget</Button>}>
      {error && <div className="alert-error">{error}</div>}
      {loading ? <LoadingSpinner /> : <Table columns={columns} data={items} onRowClick={(r) => navigate(`/budgets/${r.id}`)} />}
      <PaginationBar meta={meta} page={page} onPrev={prevPage} onNext={nextPage} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Budget">
        <BudgetForm
          analyticAccounts={analyticAccounts}
          initialValues={{ responsiblePersonId: user?.id || '' }}
          onSubmit={handleCreate}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </PageShell>
  );
};

export default BudgetsListPage;
