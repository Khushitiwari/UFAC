import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { journalsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import JournalForm from '../../components/forms/JournalForm.jsx';
import AsyncPageGate from '../../components/common/AsyncPageGate.jsx';
import { useJournal } from '../../hooks/useJournals.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { canWrite, canDelete } from '../../utils/permissions.js';

const JournalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const write = canWrite(user);
  const del = canDelete(user);
  const { journal, loading, error, refetch } = useJournal(id);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => { refetch(); }, [refetch]);

  const handleUpdate = useCallback(async (data) => {
    await journalsApi.update(id, data);
    setEditOpen(false);
    await refetch();
  }, [id, refetch]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Delete this journal?')) return;
    await journalsApi.remove(id);
    navigate('/journals');
  }, [id, navigate]);

  return (
    <AsyncPageGate loading={loading} hasContent={!loading} label="Loading journal...">
      {error && <div className="alert-error">{error}</div>}
      {!journal && !loading && <div className="alert-error">Not found</div>}
      {journal && (
    <PageShell title={journal.name} actions={<>{write && <Button variant="secondary" onClick={() => setEditOpen(true)}>Edit</Button>}{del && <Button variant="secondary" onClick={handleDelete}>Delete</Button>}<Link to="/journals"><Button variant="secondary">Back</Button></Link></>}>
      <div className="card"><p><strong>Type:</strong> {journal.type}</p></div>
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Journal">
        <JournalForm initialValues={journal} onSubmit={handleUpdate} onCancel={() => setEditOpen(false)} submitLabel="Update" />
      </Modal>
    </PageShell>
      )}
    </AsyncPageGate>
  );
};

export default JournalDetailPage;
