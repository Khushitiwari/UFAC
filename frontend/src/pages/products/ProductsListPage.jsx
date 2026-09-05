import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import ProductForm from '../../components/forms/ProductForm.jsx';
import PaginationBar from '../../components/common/PaginationBar.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
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
  const debouncedSearch = useDebounce(search);
  const { items, meta, loading, refreshing, error, refetch, page, nextPage, prevPage } = useProducts({ search: debouncedSearch || undefined });

  const columns = useMemo(
    () => [
      { key: 'name', label: 'Name' },
      { key: 'type', label: 'Type' },
      { key: 'category', label: 'Category' },
      { key: 'salesPrice', label: 'Sales Price', render: (r) => formatCurrency(r.salesPrice) },
      { key: 'cost', label: 'Cost', render: (r) => formatCurrency(r.cost) },
    ],
    [],
  );

  const handleCreate = useCallback(async (data) => {
    await productsApi.create(data);
    setModalOpen(false);
    await refetch();
  }, [refetch]);

  return (
    <PageShell title="Products" actions={write ? <Button onClick={() => setModalOpen(true)}>+ New Product</Button> : null}>
      <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginBottom: '1rem', padding: '0.5rem', width: 280 }} />
      {error && <div className="alert-error">{error}</div>}
      <Table loading={loading} refreshing={refreshing} columns={columns} data={items} onRowClick={(r) => navigate(`/products/${r.id}`)} />
      <PaginationBar meta={meta} page={page} onPrev={prevPage} onNext={nextPage} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Product">
        <ProductForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
      </Modal>
    </PageShell>
  );
};

export default ProductsListPage;
