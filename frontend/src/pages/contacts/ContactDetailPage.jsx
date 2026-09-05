import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { contactsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import ContactForm from '../../components/forms/ContactForm.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { useContact } from '../../hooks/useContacts.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { canWrite, canDelete } from '../../utils/permissions.js';
import { formatDate } from '../../utils/format.js';

const ContactDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const write = canWrite(user);
  const del = canDelete(user);
  const { contact, loading, error, refetch } = useContact(id);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleUpdate = useCallback(
    async (data) => {
      await contactsApi.update(id, data);
      setEditOpen(false);
      await refetch();
    },
    [id, refetch],
  );

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Delete this contact?')) return;
    await contactsApi.remove(id);
    navigate('/contacts');
  }, [id, navigate]);

  if (loading) return <LoadingSpinner label="Loading contact..." />;
  if (error) return <div className="alert-error">{error}</div>;
  if (!contact) return <div className="alert-error">Contact not found</div>;

  return (
    <PageShell
      title={contact.name}
      actions={
        <>
          {write && <Button variant="secondary" onClick={() => setEditOpen(true)}>Edit</Button>}
          {del && <Button variant="secondary" onClick={handleDelete}>Delete</Button>}
          <Link to="/contacts"><Button variant="secondary">Back</Button></Link>
        </>
      }
    >
      <div className="card">
        <p><strong>Email:</strong> {contact.email}</p>
        <p><strong>Type:</strong> {contact.type}</p>
        <p><strong>Status:</strong> {contact.status}</p>
        <p><strong>Phone:</strong> {contact.phone || '—'}</p>
        <p><strong>Address:</strong> {contact.address || '—'}</p>
        <p><strong>Tax ID:</strong> {contact.taxId || '—'}</p>
        {contact.createdAt && <p><strong>Created:</strong> {formatDate(contact.createdAt)}</p>}
      </div>
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Contact">
        <ContactForm initialValues={contact} onSubmit={handleUpdate} onCancel={() => setEditOpen(false)} submitLabel="Update" />
      </Modal>
    </PageShell>
  );
};

export default ContactDetailPage;
