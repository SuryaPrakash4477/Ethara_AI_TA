import React, { useState, useEffect } from 'react';

function ProductList({ apiBase, refreshTrigger, triggerRefresh }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentProductId, setCurrentProductId] = useState(null);

  // Form Fields
  const [formFields, setFormFields] = useState({
    name: '',
    sku: '',
    price: '',
    quantity: ''
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/products`);
      if (!res.ok) throw new Error('Failed to retrieve products catalog.');
      const data = await res.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error fetching products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [apiBase, refreshTrigger]);

  const handleOpenAddModal = () => {
    setModalMode('add');
    setFormFields({ name: '', sku: '', price: '', quantity: '' });
    setCurrentProductId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setModalMode('edit');
    setFormFields({
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: product.quantity
    });
    setCurrentProductId(product.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Frontend validations
    if (!formFields.name.trim()) return setError('Product name is required.');
    if (!formFields.sku.trim()) return setError('SKU code is required.');
    if (parseFloat(formFields.price) < 0) return setError('Price must be non-negative.');
    if (parseInt(formFields.quantity) < 0) return setError('Quantity must be non-negative.');

    const payload = {
      name: formFields.name,
      sku: formFields.sku,
      price: parseFloat(formFields.price),
      quantity: parseInt(formFields.quantity)
    };

    try {
      let res;
      if (modalMode === 'add') {
        res = await fetch(`${apiBase}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${apiBase}/products/${currentProductId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.detail || 'An error occurred during product registration.');
      }

      setSuccess(modalMode === 'add' ? 'Product created successfully!' : 'Product details updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
      handleCloseModal();
      triggerRefresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`${apiBase}/products/${productId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to delete product.');
      }
      setSuccess('Product successfully deleted.');
      setTimeout(() => setSuccess(null), 3000);
      triggerRefresh();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  // Filter products locally by search query
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Product Catalog</h1>
          <p className="text-muted">Manage system products, stock levels, and SKUs</p>
        </div>
        <button id="add-product-btn" className="btn btn-primary" onClick={handleOpenAddModal}>
          + Add Product
        </button>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}
      {error && !isModalOpen && <div className="alert alert-danger">⚠️ {error}</div>}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <input
          id="product-search"
          type="text"
          placeholder="Search products by name or SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="card">
        {loading ? (
          <div className="text-center text-muted">Retrieving products catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-muted">No products matching the search query found.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>SKU Code</th>
                  <th>Unit Price</th>
                  <th>In Stock</th>
                  <th>Inventory Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="font-bold">{p.name}</div>
                    </td>
                    <td>
                      <code>{p.sku}</code>
                    </td>
                    <td>${p.price.toFixed(2)}</td>
                    <td className="font-bold">{p.quantity}</td>
                    <td>
                      {p.quantity === 0 ? (
                        <span className="badge badge-danger">Out of stock</span>
                      ) : p.quantity <= 5 ? (
                        <span className="badge badge-warning">Low stock</span>
                      ) : (
                        <span className="badge badge-success">In stock</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-small mr-2"
                        onClick={() => handleOpenEditModal(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => handleDeleteProduct(p.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{modalMode === 'add' ? 'Create New Product' : 'Modify Product'}</h2>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              Ensure values are valid. SKU must be unique across the catalog.
            </p>

            {error && <div className="alert alert-danger">⚠️ {error}</div>}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input
                  id="product-name-input"
                  type="text"
                  name="name"
                  value={formFields.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Ergonomic Mechanical Keyboard"
                  required
                />
              </div>

              <div className="form-group">
                <label>SKU / Item Code</label>
                <input
                  id="product-sku-input"
                  type="text"
                  name="sku"
                  value={formFields.sku}
                  onChange={handleInputChange}
                  placeholder="e.g. KB-MECH-01"
                  required
                  disabled={modalMode === 'edit'}
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    id="product-price-input"
                    type="number"
                    step="0.01"
                    name="price"
                    value={formFields.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Quantity In Stock</label>
                  <input
                    id="product-quantity-input"
                    type="number"
                    name="quantity"
                    value={formFields.quantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="flex mt-4 gap-3" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button id="product-submit-btn" type="submit" className="btn btn-primary">
                  {modalMode === 'add' ? 'Create Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductList;
