import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import ProductForm from '../../components/forms/ProductForm.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { useProduct } from '../../hooks/useProducts.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { canWrite, canDelete } from '../../utils/permissions.js';
import { formatCurrency } from '../../utils/format.js';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const write = canWrite(user);
  const del = canDelete(user);
  const { product, loading, error, refetch } = useProduct(id);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => { refetch(); }, [refetch]);

  const handleUpdate = useCallback(async (data) => {
    await productsApi.update(id, data);
    setEditOpen(false);
    await refetch();
  }, [id, refetch]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Delete this product?')) return;
    await productsApi.remove(id);
    navigate('/products');
  }, [id, navigate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert-error">{error}</div>;
  if (!product) return <div className="alert-error">Not found</div>;

  return (
    <PageShell title={product.name} actions={<>{write && <Button variant="secondary" onClick={() => setEditOpen(true)}>Edit</Button>}{del && <Button variant="secondary" onClick={handleDelete}>Delete</Button>}<Link to="/products"><Button variant="secondary">Back</Button></Link></>}>
      <div className="card">
        <p><strong>Type:</strong> {product.type}</p>
        <p><strong>Category:</strong> {product.category}</p>
        <p><strong>Sales Price:</strong> {formatCurrency(product.salesPrice)}</p>
        <p><strong>Cost:</strong> {formatCurrency(product.cost)}</p>
        <p><strong>Description:</strong> {product.description || '—'}</p>
      </div>
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Product">
        <ProductForm initialValues={product} onSubmit={handleUpdate} onCancel={() => setEditOpen(false)} submitLabel="Update" />
      </Modal>
    </PageShell>
  );
};

export default ProductDetailPage;
