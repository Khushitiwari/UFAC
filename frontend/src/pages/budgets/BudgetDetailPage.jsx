import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { budgetsApi, analyticAccountsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import BudgetForm from '../../components/forms/BudgetForm.jsx';
import PageSkeleton from '../../components/common/PageSkeleton.jsx';
import { useBudget } from '../../hooks/useBudgets.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { canWrite, canDelete } from '../../utils/permissions.js';
import { formatCurrency, formatDate } from '../../utils/format.js';
import { useToast } from '../../context/ToastContext.jsx';

const BudgetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const write = canWrite(user);
  const del = canDelete(user);
  const { budget, loading, error, refetch } = useBudget(id);
  const [editOpen, setEditOpen] = useState(false);
  const [analyticAccounts, setAnalyticAccounts] = useState([]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    analyticAccountsApi.list({ limit: 100 }).then((res) => {
      setAnalyticAccounts(res.data.data.analyticAccounts ?? []);
    });
  }, []);

  const handleUpdate = useCallback(
    async (data) => {
      await budgetsApi.update(id, data);
      setEditOpen(false);
      showToast('Budget updated', 'success');
      await refetch();
    },
    [id, refetch, showToast],
  );

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Delete budget?')) return;
    try {
      await budgetsApi.remove(id);
      showToast('Budget deleted', 'success');
      navigate('/budgets');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete budget', 'error');
    }
  }, [id, navigate, showToast]);

  if (loading && !budget) return <PageSkeleton />;
  if (error && !budget) return <div className="alert-error">{error}</div>;
  if (!budget) return <div className="alert-error">Budget not found</div>;

  return (
    <>
      <PageShell
        title={budget.name}
        subtitle={`${formatDate(budget.periodStart)} – ${formatDate(budget.periodEnd)}`}
        actions={
          <>
            {write && (
              <Button variant="secondary" onClick={() => setEditOpen(true)}>
                Edit
              </Button>
            )}
            {del && (
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            )}
            <Link to="/budgets">
              <Button variant="secondary">Back</Button>
            </Link>
          </>
        }
      >
        <dl className="detail-grid">
          <div className="detail-item">
            <dt>Planned Amount</dt>
            <dd>{formatCurrency(budget.plannedAmount)}</dd>
          </div>
          <div className="detail-item">
            <dt>Analytic Account</dt>
            <dd>{budget.analyticAccount?.name || budget.analyticAccountId}</dd>
          </div>
          <div className="detail-item">
            <dt>Responsible Person</dt>
            <dd>{budget.responsiblePerson?.name || budget.responsiblePersonId}</dd>
          </div>
        </dl>
      </PageShell>
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Budget">
        <BudgetForm
          initialValues={budget}
          analyticAccounts={analyticAccounts}
          currentUser={user}
          onSubmit={handleUpdate}
          onCancel={() => setEditOpen(false)}
          submitLabel="Update"
        />
      </Modal>
    </>
  );
};

export default BudgetDetailPage;
