import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { journalEntriesApi, journalsApi, accountsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Button from '../../components/common/Button.jsx';
import JournalEntryForm from '../../components/forms/JournalEntryForm.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const JournalEntryPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [journals, setJournals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [jRes, aRes] = await Promise.all([
          journalsApi.list({ limit: 100 }),
          accountsApi.list({ limit: 100 }),
        ]);
        setJournals(jRes.data.data.journals ?? []);
        setAccounts(aRes.data.data.accounts ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = useCallback(
    async (data) => {
      await journalEntriesApi.create(data);
      showToast('Journal entry posted', 'success');
      navigate('/journals/entries');
    },
    [navigate, showToast],
  );

  if (loading) return <LoadingSpinner label="Loading..." />;

  return (
    <PageShell
      title="Manual Journal Entry"
      actions={<Link to="/journals"><Button variant="secondary">Back</Button></Link>}
    >
      <div className="card">
        <JournalEntryForm journals={journals} accounts={accounts} onSubmit={handleSubmit} />
      </div>
    </PageShell>
  );
};

export default JournalEntryPage;
