import Button from './Button.jsx';

const PaginationBar = ({ meta, page, onPrev, onNext }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
    <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
      Page {meta.page ?? page} of {meta.totalPages ?? 1} ({meta.total ?? 0} total)
    </span>
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Button variant="secondary" onClick={onPrev} disabled={page <= 1}>
        Previous
      </Button>
      <Button variant="secondary" onClick={onNext} disabled={page >= (meta.totalPages || 1)}>
        Next
      </Button>
    </div>
  </div>
);

export default PaginationBar;
