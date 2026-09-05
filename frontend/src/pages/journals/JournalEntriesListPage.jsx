import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../components/common/PageShell.jsx';
import Table from '../../components/common/Table.jsx';
import Button from '../../components/common/Button.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import PaginationBar from '../../components/common/PaginationBar.jsx';
import { useJournalEntries } from '../../hooks/useJournalEntries.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { canWrite } from '../../utils/permissions.js';
import { formatCurrency, formatDate } from '../../utils/format.js';

const JournalEntriesListPage = () => {
  const { user } = useAuth();
  const write = canWrite(user);
  const { items, meta, loading, error, page, nextPage, prevPage } = useJournalEntries();

  const columns = useMemo(
    () => [
      { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
      { key: 'reference', label: 'Reference', render: (r) => r.reference || '—' },
      { key: 'journal', label: 'Journal', render: (r) => r.journal?.name || '—' },
      { key: 'sourceType', label: 'Source' },
      {
        key: 'debit',
        label: 'Debit',
        render: (r) => formatCurrency((r.items || []).reduce((s, i) => s + Number(i.debit || 0), 0)),
      },
      {
        key: 'credit',
        label: 'Credit',
        render: (r) => formatCurrency((r.items || []).reduce((s, i) => s + Number(i.credit || 0), 0)),
      },
    ],
    [],
  );

  return (
    <PageShell
      title="Journal Entries"
      actions={
        write ? (
          <Link to="/journals/entry/new">
            <Button>+ Manual Entry</Button>
          </Link>
        ) : null
      }
    >
      {error && <div className="alert-error">{error}</div>}
      {loading ? (
        <LoadingSpinner label="Loading journal entries..." />
      ) : (
        <Table columns={columns} data={items} emptyMessage="No journal entries yet" />
      )}
      <PaginationBar meta={meta} page={page} onPrev={prevPage} onNext={nextPage} />
    </PageShell>
  );
};

export default JournalEntriesListPage;
