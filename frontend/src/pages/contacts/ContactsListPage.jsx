import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contactsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import ContactForm from '../../components/forms/ContactForm.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import PaginationBar from '../../components/common/PaginationBar.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useContacts } from '../../hooks/useContacts.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { canWrite } from '../../utils/permissions.js';

const ContactsListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const write = canWrite(user);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const debouncedSearch = useDebounce(search);
  const { items, meta, loading, error, refetch, page, nextPage, prevPage } = useContacts({ search: debouncedSearch || undefined });

  const columns = useMemo(
    () => [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'type', label: 'Type' },
      { key: 'status', label: 'Status' },
      { key: 'phone', label: 'Phone', render: (row) => row.phone || '—' },
    ],
    [],
  );

  const handleCreate = useCallback(
    async (formData) => {
      await contactsApi.create(formData);
      setModalOpen(false);
      await refetch();
    },
    [refetch],
  );

  return (
    <PageShell title="Contacts" actions={write ? <Button onClick={() => setModalOpen(true)}>+ New Contact</Button> : null}>
      <div style={{ marginBottom: '1rem' }}>
        <input
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', width: '280px' }}
        />
      </div>
      {error && <div className="alert-error">{error}</div>}
      {loading ? <LoadingSpinner label="Loading contacts..." /> : (
        <Table columns={columns} data={items} onRowClick={(row) => navigate(`/contacts/${row.id}`)} />
      )}
      <PaginationBar meta={meta} page={page} onPrev={prevPage} onNext={nextPage} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Contact">
        <ContactForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
      </Modal>
    </PageShell>
  );
};

export default ContactsListPage;
