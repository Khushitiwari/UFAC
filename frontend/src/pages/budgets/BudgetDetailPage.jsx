import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { budgetsApi, analyticAccountsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import BudgetForm from '../../components/forms/BudgetForm.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { useBudget } from '../../hooks/useBudgets.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { canWrite, canDelete } from '../../utils/permissions.js';
import { formatCurrency, formatDate } from '../../utils/format.js';

const BudgetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const write = canWrite(user);
  const del = canDelete(user);
  const { budget, loading, error, refetch } = useBudget(id);
  const [editOpen, setEditOpen] = useState(false);
  const [analyticAccounts, setAnalyticAccounts] = useState([]);

  useEffect(() => { refetch(); }, [refetch]);
  useEffect(() => {
    analyticAccountsApi.list({ limit: 100 }).then((res) => setAnalyticAccounts(res.data.data.analyticAccounts ?? []));
  }, []);

  const handleUpdate = useCallback(async (data) => {
    await budgetsApi.update(id, data);
    setEditOpen(false);
    await refetch();
  }, [id, refetch]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Delete budget?')) return;
    await budgetsApi.remove(id);
    navigate('/budgets');
  }, [id, navigate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert-error">{error}</div>;
  if (!budget) return <div className="alert-error">Not found</div>;

  return (
    <PageShell title={budget.name} actions={<>{write && <Button variant="secondary" onClick={() => setEditOpen(true)}>Edit</Button>}{del && <Button variant="secondary" onClick={handleDelete}>Delete</Button>}<Link to="/budgets"><Button variant="secondary">Back</Button></Link></>}>
      <div className="card">
        <p><strong>Period:</strong> {formatDate(budget.periodStart)} – {formatDate(budget.periodEnd)}</p>
        <p><strong>Planned:</strong> {formatCurrency(budget.plannedAmount)}</p>
        <p><strong>Analytic Account:</strong> {budget.analyticAccount?.name || budget.analyticAccountId}</p>
      </div>
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Budget">
        <BudgetForm initialValues={budget} analyticAccounts={analyticAccounts} onSubmit={handleUpdate} onCancel={() => setEditOpen(false)} submitLabel="Update" />
      </Modal>
    </PageShell>
  );
};

export default BudgetDetailPage;
