import TableSkeleton from './TableSkeleton.jsx';

export const Avatar = ({ name, imageUrl, size = 40 }) => {
  const initial = (name?.trim()?.charAt(0) || '?').toUpperCase();

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name || 'Contact'}
        className="avatar avatar-image"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.4 }} aria-hidden="true">
      {initial}
    </div>
  );
};

const KanbanBoard = ({ items, loading, refreshing, onCardClick, renderCard, emptyMessage = 'No records found' }) => {
  if (loading && !items?.length) {
    return <TableSkeleton columns={3} rows={4} />;
  }

  if (!items?.length) {
    return <p className="table-empty">{emptyMessage}</p>;
  }

  return (
    <div className={`kanban-board ${refreshing ? 'is-refreshing' : ''}`}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="kanban-card"
          onClick={() => onCardClick?.(item)}
        >
          {renderCard(item)}
        </button>
      ))}
    </div>
  );
};

export default KanbanBoard;
