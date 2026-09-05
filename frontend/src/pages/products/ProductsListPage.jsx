import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import ProductForm from '../../components/forms/ProductForm.jsx';
import PaginationBar from '../../components/common/PaginationBar.jsx';
import ViewToggle from '../../components/common/ViewToggle.jsx';
import KanbanBoard, { Avatar } from '../../components/common/KanbanBoard.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useViewMode } from '../../hooks/useViewMode.js';
import { useProducts } from '../../hooks/useProducts.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { canWrite } from '../../utils/permissions.js';
import { formatCurrency } from '../../utils/format.js';

const ProductsListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const write = canWrite(user);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useViewMode('ufac-products-view');
  const debouncedSearch = useDebounce(search);
  const { items, meta, loading, refreshing, error, refetch, page, nextPage, prevPage } = useProducts({
    search: debouncedSearch || undefined,
  });

  const columns = useMemo(
    () => [
      {
        key: 'avatar',
        label: '',
        render: (row) => <Avatar name={row.name} size={32} />,
      },
      { key: 'name', label: 'Product' },
      { key: 'category', label: 'Category' },
      { key: 'type', label: 'Type' },
      { key: 'salesPrice', label: 'Sales Price', render: (r) => formatCurrency(r.salesPrice) },
      { key: 'cost', label: 'Cost', render: (r) => formatCurrency(r.cost) },
    ],
    [],
  );

  const handleCreate = useCallback(
    async (data) => {
      await productsApi.create(data);
      setModalOpen(false);
      await refetch();
    },
    [refetch],
  );

  const renderKanbanCard = useCallback(
    (product) => (
      <>
        <Avatar name={product.name} size={48} />
        <div className="kanban-card-body">
          <strong>{product.name}</strong>
          <span className="type-badge">{product.type}</span>
          <p>{product.category}</p>
          <div className="kanban-card-metrics">
            <span>Sale: {formatCurrency(product.salesPrice)}</span>
            <span>Cost: {formatCurrency(product.cost)}</span>
          </div>
        </div>
      </>
    ),
    [],
  );

  return (
    <>
      <PageShell
        title="Product Master"
        subtitle="Goods, services, and combos"
        actions={write ? <Button onClick={() => setModalOpen(true)}>+ New</Button> : null}
      >
        <div className="master-toolbar">
          <input
            className="search-input"
            placeholder="Search products..."
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
              onRowClick={(r) => navigate(`/products/${r.id}`)}
            />
            <PaginationBar meta={meta} page={page} onPrev={prevPage} onNext={nextPage} />
          </>
        ) : (
          <>
            <KanbanBoard
              items={items}
              loading={loading}
              refreshing={refreshing}
              onCardClick={(r) => navigate(`/products/${r.id}`)}
              renderCard={renderKanbanCard}
              emptyMessage="No products yet"
            />
            <PaginationBar meta={meta} page={page} onPrev={prevPage} onNext={nextPage} />
          </>
        )}
      </PageShell>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Product">
        <ProductForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
      </Modal>
    </>
  );
};

export default ProductsListPage;
