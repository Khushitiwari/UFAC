import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contactsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import ContactForm from '../../components/forms/ContactForm.jsx';
import PaginationBar from '../../components/common/PaginationBar.jsx';
import ViewToggle from '../../components/common/ViewToggle.jsx';
import KanbanBoard, { Avatar } from '../../components/common/KanbanBoard.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useViewMode } from '../../hooks/useViewMode.js';
import { useContacts } from '../../hooks/useContacts.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { canWrite, canManagePortalUsers } from '../../utils/permissions.js';

const typeLabel = (type) => {
  if (type === 'VENDOR') return 'Vendor';
  if (type === 'BOTH') return 'Customer & Vendor';
  return 'Customer';
};

const ContactsListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const write = canWrite(user);
  const managePortal = canManagePortalUsers(user);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useViewMode('ufac-contacts-view');
  const debouncedSearch = useDebounce(search);
  const { items, meta, loading, refreshing, error, refetch, page, nextPage, prevPage } = useContacts({
    search: debouncedSearch || undefined,
  });

  const columns = useMemo(
    () => [
      {
        key: 'avatar',
        label: '',
        render: (row) => <Avatar name={row.name} imageUrl={row.imageUrl} size={32} />,
      },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'type', label: 'Type', render: (row) => typeLabel(row.type) },
      { key: 'phone', label: 'Phone', render: (row) => row.phone || '—' },
      {
        key: 'portal',
        label: 'Portal',
        render: (row) => (row.user ? 'Yes' : '—'),
      },
    ],
    [],
  );

  const handleCreate = useCallback(
    async (formData) => {
      await contactsApi.create(formData);
      setModalOpen(false);
      showToast(
        formData.portalUser ? 'Contact and portal user created' : 'Contact created',
        'success',
      );
      await refetch();
    },
    [refetch, showToast],
  );

  const renderKanbanCard = useCallback(
    (contact) => (
      <>
        <Avatar name={contact.name} imageUrl={contact.imageUrl} size={48} />
        <div className="kanban-card-body">
          <strong>{contact.name}</strong>
          <span className={`type-badge type-${contact.type.toLowerCase()}`}>{typeLabel(contact.type)}</span>
          <p>{contact.email}</p>
          <p>{contact.phone || 'No phone'}</p>
          {contact.user && <span className="portal-badge">Portal active</span>}
        </div>
      </>
    ),
    [],
  );

  return (
    <>
      <PageShell
        title="Contact Master"
        subtitle="Customers, vendors, and portal users"
        actions={write ? <Button onClick={() => setModalOpen(true)}>+ New</Button> : null}
      >
        <div className="master-toolbar">
          <input
            className="search-input"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <ViewToggle viewMode={viewMode} onChange={setViewMode} />
        </div>

        {error && <div className="alert-error">{error}</div>}

        {viewMode === 'list' ? (
          <>
            <Table
              loading={loading}
              refreshing={refreshing}
              columns={columns}
              data={items}
              onRowClick={(row) => navigate(`/contacts/${row.id}`)}
            />
            <PaginationBar meta={meta} page={page} onPrev={prevPage} onNext={nextPage} />
          </>
        ) : (
          <>
            <KanbanBoard
              items={items}
              loading={loading}
              refreshing={refreshing}
              onCardClick={(row) => navigate(`/contacts/${row.id}`)}
              renderCard={renderKanbanCard}
              emptyMessage="No contacts yet"
            />
            <PaginationBar meta={meta} page={page} onPrev={prevPage} onNext={nextPage} />
          </>
        )}
      </PageShell>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Contact" size="lg">
        <ContactForm
          onSubmit={handleCreate}
          onCancel={() => setModalOpen(false)}
          submitLabel="Confirm"
          allowPortalUser={managePortal}
        />
      </Modal>
    </>
  );
};

export default ContactsListPage;
