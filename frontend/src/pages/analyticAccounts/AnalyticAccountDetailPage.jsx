import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { analyticAccountsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import AnalyticAccountForm from '../../components/forms/AnalyticAccountForm.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { useAnalyticAccount } from '../../hooks/useAnalyticAccounts.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { canWrite, canDelete } from '../../utils/permissions.js';

const AnalyticAccountDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const write = canWrite(user);
  const del = canDelete(user);
  const { analyticAccount, loading, error, refetch } = useAnalyticAccount(id);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => { refetch(); }, [refetch]);

  const handleUpdate = useCallback(async (data) => {
    await analyticAccountsApi.update(id, data);
    setEditOpen(false);
    await refetch();
  }, [id, refetch]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Delete?')) return;
    await analyticAccountsApi.remove(id);
    navigate('/analytic-accounts');
  }, [id, navigate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert-error">{error}</div>;
  if (!analyticAccount) return <div className="alert-error">Not found</div>;

  return (
    <PageShell title={analyticAccount.name} actions={<>{write && <Button variant="secondary" onClick={() => setEditOpen(true)}>Edit</Button>}{del && <Button variant="secondary" onClick={handleDelete}>Delete</Button>}<Link to="/analytic-accounts"><Button variant="secondary">Back</Button></Link></>}>
      <div className="card">
        <p><strong>Type:</strong> {analyticAccount.type}</p>
        <p><strong>Status:</strong> {analyticAccount.status}</p>
      </div>
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit">
        <AnalyticAccountForm initialValues={analyticAccount} onSubmit={handleUpdate} onCancel={() => setEditOpen(false)} submitLabel="Update" />
      </Modal>
    </PageShell>
  );
};

export default AnalyticAccountDetailPage;
