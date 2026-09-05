import { useCallback, useEffect, useMemo, useState } from 'react';
import { contactsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import ContactForm from '../../components/forms/ContactForm.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { usePagination } from '../../hooks/usePagination.js';

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const { page, limit, nextPage, prevPage } = usePagination();
  const debouncedSearch = useDebounce(search);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await contactsApi.list({ page, limit, search: debouncedSearch || undefined });
      setContacts(data.data.contacts);
      setMeta(data.data.meta);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const columns = useMemo(
    () => [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'type', label: 'Type' },
      { key: 'status', label: 'Status' },
      {
        key: 'phone',
        label: 'Phone',
        render: (row) => row.phone || '—',
      },
    ],
    [],
  );

  const handleCreate = useCallback(
    async (formData) => {
      setError('');
      try {
        await contactsApi.create(formData);
        setModalOpen(false);
        await fetchContacts();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to create contact');
      }
    },
    [fetchContacts],
  );

  return (
    <PageShell
      title="Contacts"
      actions={
        <Button onClick={() => setModalOpen(true)}>+ New Contact</Button>
      }
    >
      <div style={{ marginBottom: '1rem' }}>
        <input
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', width: '280px' }}
        />
      </div>
      {error && <div className="alert-error">{error}</div>}
      {loading ? <LoadingSpinner label="Loading contacts..." /> : <Table columns={columns} data={contacts} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
          Page {meta.page} of {meta.totalPages} ({meta.total} total)
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" onClick={prevPage} disabled={page <= 1}>
            Previous
          </Button>
          <Button variant="secondary" onClick={nextPage} disabled={page >= (meta.totalPages || 1)}>
            Next
          </Button>
        </div>
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Contact">
        {error && <div className="alert-error">{error}</div>}
        <ContactForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
      </Modal>
    </PageShell>
  );
};

export default ContactsPage;
