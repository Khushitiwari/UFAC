import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { accountsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import AccountForm from '../../components/forms/AccountForm.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { useAccount } from '../../hooks/useAccounts.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { canWrite, canDelete } from '../../utils/permissions.js';

const AccountDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const write = canWrite(user);
  const del = canDelete(user);
  const { account, loading, error, refetch } = useAccount(id);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => { refetch(); }, [refetch]);

  const handleUpdate = useCallback(async (data) => {
    await accountsApi.update(id, data);
    setEditOpen(false);
    await refetch();
  }, [id, refetch]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Delete this account?')) return;
    await accountsApi.remove(id);
    navigate('/accounts');
  }, [id, navigate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert-error">{error}</div>;
  if (!account) return <div className="alert-error">Not found</div>;

  return (
    <PageShell title={account.name} actions={<>{write && <Button variant="secondary" onClick={() => setEditOpen(true)}>Edit</Button>}{del && <Button variant="secondary" onClick={handleDelete}>Delete</Button>}<Link to="/accounts"><Button variant="secondary">Back</Button></Link></>}>
      <div className="card">
        <p><strong>Type:</strong> {account.type}</p>
        <p><strong>Active:</strong> {account.isActive !== false ? 'Yes' : 'No'}</p>
      </div>
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Account">
        <AccountForm initialValues={account} onSubmit={handleUpdate} onCancel={() => setEditOpen(false)} submitLabel="Update" />
      </Modal>
    </PageShell>
  );
};

export default AccountDetailPage;
