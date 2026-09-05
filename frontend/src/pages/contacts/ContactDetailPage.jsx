import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { contactsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import ContactForm from '../../components/forms/ContactForm.jsx';
import PortalUserForm from '../../components/forms/PortalUserForm.jsx';
import AsyncPageGate from '../../components/common/AsyncPageGate.jsx';
import { Avatar } from '../../components/common/KanbanBoard.jsx';
import { useContact } from '../../hooks/useContacts.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { canWrite, canDelete, canManagePortalUsers } from '../../utils/permissions.js';
import { formatDate } from '../../utils/format.js';

const ContactDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const write = canWrite(user);
  const del = canDelete(user);
  const managePortal = canManagePortalUsers(user);
  const { contact, loading, error, refetch } = useContact(id);
  const [editOpen, setEditOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleUpdate = useCallback(
    async (data) => {
      await contactsApi.update(id, data);
      setEditOpen(false);
      showToast('Contact updated', 'success');
      await refetch();
    },
    [id, refetch, showToast],
  );

  const handleCreatePortalUser = useCallback(
    async (data) => {
      await contactsApi.createPortalUser(id, data);
      setPortalOpen(false);
      showToast('Portal user created', 'success');
      await refetch();
    },
    [id, refetch, showToast],
  );

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Delete this contact?')) return;
    try {
      await contactsApi.remove(id);
      showToast('Contact deleted', 'success');
      navigate('/contacts');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete contact', 'error');
    }
  }, [id, navigate, showToast]);

  return (
    <AsyncPageGate loading={loading} hasContent={!loading} label="Loading contact...">
      {error && <div className="alert-error">{error}</div>}
      {!contact && !loading && <div className="alert-error">Contact not found</div>}
      {contact && (
        <>
          <PageShell
            title={contact.name}
            subtitle={contact.email}
            actions={
              <>
                {write && (
                  <Button variant="secondary" onClick={() => setEditOpen(true)}>
                    Edit
                  </Button>
                )}
                {managePortal && !contact.user && (
                  <Button onClick={() => setPortalOpen(true)}>Create Portal User</Button>
                )}
                {del && (
                  <Button variant="danger" onClick={handleDelete}>
                    Delete
                  </Button>
                )}
                <Link to="/contacts">
                  <Button variant="secondary">Back</Button>
                </Link>
              </>
            }
          >
            <div className="detail-header-card">
              <Avatar name={contact.name} imageUrl={contact.imageUrl} size={64} />
              <div>
                <span className={`type-badge type-${contact.type.toLowerCase()}`}>{contact.type}</span>
                <p>{contact.phone || 'No phone'}</p>
              </div>
            </div>
            <dl className="detail-grid">
              <div className="detail-item">
                <dt>Status</dt>
                <dd>{contact.status}</dd>
              </div>
              <div className="detail-item">
                <dt>Address</dt>
                <dd>{contact.address || '—'}</dd>
              </div>
              <div className="detail-item">
                <dt>Tax ID</dt>
                <dd>{contact.taxId || '—'}</dd>
              </div>
              <div className="detail-item">
                <dt>Portal User</dt>
                <dd>{contact.user ? `${contact.user.name} (${contact.user.email})` : 'Not created'}</dd>
              </div>
              {contact.createdAt && (
                <div className="detail-item">
                  <dt>Created</dt>
                  <dd>{formatDate(contact.createdAt)}</dd>
                </div>
              )}
            </dl>
          </PageShell>

          <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Contact" size="lg">
            <ContactForm
              initialValues={contact}
              onSubmit={handleUpdate}
              onCancel={() => setEditOpen(false)}
              submitLabel="Update"
              allowPortalUser={false}
              showPortalFields={false}
            />
          </Modal>

          <Modal isOpen={portalOpen} onClose={() => setPortalOpen(false)} title="Create Portal User">
            <PortalUserForm
              contact={contact}
              onSubmit={handleCreatePortalUser}
              onCancel={() => setPortalOpen(false)}
            />
          </Modal>
        </>
      )}
    </AsyncPageGate>
  );
};

export default ContactDetailPage;
