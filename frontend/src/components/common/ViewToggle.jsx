const ViewToggle = ({ viewMode, onChange }) => (
  <div className="view-toggle" role="group" aria-label="View mode">
    <button
      type="button"
      className={viewMode === 'list' ? 'active' : ''}
      onClick={() => onChange('list')}
      title="List view"
      aria-pressed={viewMode === 'list'}
    >
      <span className="view-toggle-icon" aria-hidden="true">☰</span>
      <span>List</span>
    </button>
    <button
      type="button"
      className={viewMode === 'kanban' ? 'active' : ''}
      onClick={() => onChange('kanban')}
      title="Kanban view"
      aria-pressed={viewMode === 'kanban'}
    >
      <span className="view-toggle-icon" aria-hidden="true">▦</span>
      <span>Kanban</span>
    </button>
  </div>
);

export default ViewToggle;
