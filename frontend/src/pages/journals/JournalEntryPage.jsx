import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { journalEntriesApi, journalsApi, accountsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Button from '../../components/common/Button.jsx';
import JournalEntryForm from '../../components/forms/JournalEntryForm.jsx';
import AsyncPageGate from '../../components/common/AsyncPageGate.jsx';
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
      try {
        await journalEntriesApi.create({
          ...data,
          date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date,
          reference: data.reference?.trim() || undefined,
          items: data.items.map(({ accountId, debit, credit, description, analyticAccountId }) => ({
            accountId,
            debit,
            credit,
            ...(description?.trim() ? { description: description.trim() } : {}),
            ...(analyticAccountId ? { analyticAccountId } : {}),
          })),
        });
        showToast('Journal entry posted', 'success');
        navigate('/journals/entries');
      } catch (err) {
        showToast(err.response?.data?.error || 'Failed to post journal entry', 'error');
        throw err;
      }
    },
    [navigate, showToast],
  );

  return (
    <AsyncPageGate loading={loading} hasContent={!loading} label="Loading...">
      {!loading && (
    <PageShell
      title="Manual Journal Entry"
      actions={<Link to="/journals"><Button variant="secondary">Back</Button></Link>}
    >
      <div className="card">
        <JournalEntryForm journals={journals} accounts={accounts} onSubmit={handleSubmit} />
      </div>
    </PageShell>
      )}
    </AsyncPageGate>
  );
};

export default JournalEntryPage;
