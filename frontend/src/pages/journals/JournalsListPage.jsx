import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { journalsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import JournalForm from '../../components/forms/JournalForm.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import PaginationBar from '../../components/common/PaginationBar.jsx';
import { useJournals } from '../../hooks/useJournals.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { canWrite } from '../../utils/permissions.js';

const JournalsListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const write = canWrite(user);
  const [modalOpen, setModalOpen] = useState(false);
  const { items, meta, loading, error, refetch, page, nextPage, prevPage } = useJournals();

  const columns = useMemo(() => [
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type' },
  ], []);

  const handleCreate = useCallback(async (data) => {
    await journalsApi.create(data);
    setModalOpen(false);
    await refetch();
  }, [refetch]);

  return (
    <PageShell
      title="Journals"
      actions={
        write ? (
          <>
            <Link to="/journals/entry/new"><Button variant="secondary">Manual Entry</Button></Link>
            <Button onClick={() => setModalOpen(true)}>+ New Journal</Button>
          </>
        ) : null
      }
    >
      {error && <div className="alert-error">{error}</div>}
      {loading ? <LoadingSpinner /> : <Table columns={columns} data={items} onRowClick={(r) => navigate(`/journals/${r.id}`)} />}
      <PaginationBar meta={meta} page={page} onPrev={prevPage} onNext={nextPage} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Journal">
        <JournalForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
      </Modal>
    </PageShell>
  );
};

export default JournalsListPage;
