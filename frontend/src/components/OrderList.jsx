import React, { useState, useEffect } from 'react';

function OrderList({ apiBase, refreshTrigger, triggerRefresh }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Form State
  const [orderCustomer, setOrderCustomer] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordRes, prodRes, custRes] = await Promise.all([
        fetch(`${apiBase}/orders`),
        fetch(`${apiBase}/products`),
        fetch(`${apiBase}/customers`)
      ]);

      if (!ordRes.ok || !prodRes.ok || !custRes.ok) {
        throw new Error('Failed to fetch orders, products, or customers data.');
      }

      const ordersData = await ordRes.json();
      const productsData = await prodRes.json();
      const customersData = await custRes.json();

      setOrders(ordersData);
      setProducts(productsData);
      setCustomers(customersData);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error fetching orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiBase, refreshTrigger]);

  const handleOpenCreateModal = () => {
    setOrderCustomer('');
    setOrderItems([{ product_id: '', quantity: 1 }]);
    setIsCreateOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateOpen(false);
    setError(null);
  };

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setIsDetailsOpen(false);
  };

  // Add a row to items builder
  const handleAddRow = () => {
    setOrderItems(prev => [...prev, { product_id: '', quantity: 1 }]);
  };

  // Remove a row from items builder
  const handleRemoveRow = (index) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  // Handle value change for item builder row
  const handleItemChange = (index, field, value) => {
    setOrderItems(prev => {
      const updated = [...prev];
      if (field === 'quantity') {
        updated[index][field] = parseInt(value) || 0;
      } else {
        updated[index][field] = value;
      }
      return updated;
    });
  };

  // Real-time order total computation (frontend preview)
  const calculateTotalPreview = () => {
    let total = 0;
    orderItems.forEach(item => {
      const product = products.find(p => p.id === parseInt(item.product_id));
      if (product) {
        total += product.price * item.quantity;
      }
    });
    return total;
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();

    if (!orderCustomer) {
      return setError('Please select a customer.');
    }

    if (orderItems.length === 0) {
      return setError('An order must contain at least one item line.');
    }

    // Validate rows
    for (let i = 0; i < orderItems.length; i++) {
      const row = orderItems[i];
      if (!row.product_id) {
        return setError(`Please select a product for item line ${i + 1}.`);
      }
      if (row.quantity <= 0) {
        return setError(`Quantity for line ${i + 1} must be greater than zero.`);
      }

      // Check stock limits (frontend friendly alert)
      const prod = products.find(p => p.id === parseInt(row.product_id));
      if (prod && prod.quantity < row.quantity) {
        return setError(`Insufficient inventory for product '${prod.name}'. In stock: ${prod.quantity}, requested: ${row.quantity}.`);
      }
    }

    const payload = {
      customer_id: parseInt(orderCustomer),
      items: orderItems.map(item => ({
        product_id: parseInt(item.product_id),
        quantity: item.quantity
      }))
    };

    try {
      const res = await fetch(`${apiBase}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.detail || 'Failed to submit order.');
      }

      setSuccess('Order successfully placed!');
      setTimeout(() => setSuccess(null), 3000);
      handleCloseCreateModal();
      triggerRefresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel/delete this order? Inventory will be automatically restocked.')) return;

    try {
      const res = await fetch(`${apiBase}/orders/${orderId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to cancel order.');
      }
      setSuccess('Order successfully cancelled. Stock levels restored.');
      setTimeout(() => setSuccess(null), 3000);
      triggerRefresh();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Order Registry</h1>
          <p className="text-muted">Place client orders and track real-time fulfillment status</p>
        </div>
        <button id="add-order-btn" className="btn btn-primary" onClick={handleOpenCreateModal}>
          + Create Order
        </button>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}
      {error && !isCreateOpen && <div className="alert alert-danger">⚠️ {error}</div>}

      <div className="card">
        {loading ? (
          <div className="text-center text-muted">Retrieving order registry...</div>
        ) : orders.length === 0 ? (
          <div className="text-center text-muted">No orders found. Click 'Create Order' to submit the first order.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Order Total</th>
                  <th>Order Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td>
                      <code>#ORD-{o.id.toString().padStart(4, '0')}</code>
                    </td>
                    <td className="font-bold">{o.customer ? o.customer.name : 'Unknown Customer'}</td>
                    <td className="font-bold" style={{ color: 'var(--success)' }}>
                      ${o.total_amount.toFixed(2)}
                    </td>
                    <td>{new Date(o.created_at).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-small mr-2"
                        onClick={() => handleOpenDetails(o)}
                      >
                        View Items
                      </button>
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => handleDeleteOrder(o.id)}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal - Create Order */}
      {isCreateOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <h2>New Order Checkout</h2>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              Select a customer and specify products. Stock levels will update automatically.
            </p>

            {error && <div className="alert alert-danger">⚠️ {error}</div>}

            <form onSubmit={handleCreateOrder}>
              <div className="form-group">
                <label>Select Customer</label>
                <select
                  id="order-customer-select"
                  value={orderCustomer}
                  onChange={(e) => setOrderCustomer(e.target.value)}
                  required
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="order-items-builder">
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700 }}>
                  Order Products Line Items
                </label>

                {orderItems.map((item, index) => (
                  <div className="builder-row" key={index}>
                    <div>
                      <label style={{ fontSize: '0.75rem' }}>Product</label>
                      <select
                        id={`product-select-${index}`}
                        value={item.product_id}
                        onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                        required
                      >
                        <option value="">-- Choose Product --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                            {p.name} - ${p.price.toFixed(2)} ({p.quantity} left)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem' }}>Qty</label>
                      <input
                        id={`quantity-input-${index}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      {orderItems.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger"
                          style={{ padding: '0.75rem 1rem' }}
                          onClick={() => handleRemoveRow(index)}
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-secondary mt-2"
                  style={{ width: '100%', borderStyle: 'dashed' }}
                  onClick={handleAddRow}
                >
                  + Add Another Product Item
                </button>
              </div>

              <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', margin: '1.5rem 0' }}>
                <span className="text-muted">Estimated Total (pre-tax):</span>
                <span className="stat-value" style={{ fontSize: '1.75rem', color: 'var(--success)' }}>
                  ${calculateTotalPreview().toFixed(2)}
                </span>
              </div>

              <div className="flex gap-3" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseCreateModal}>
                  Cancel
                </button>
                <button id="order-submit-btn" type="submit" className="btn btn-primary">
                  Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Order Details */}
      {isDetailsOpen && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <h2>Order Details Breakdown</h2>
            <div className="text-muted" style={{ marginBottom: '1.5rem' }}>
              <code>#ORD-{selectedOrder.id.toString().padStart(4, '0')}</code>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem', borderStyle: 'dashed' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Customer Profile Details</h4>
              <p><strong>Name:</strong> {selectedOrder.customer ? selectedOrder.customer.name : 'N/A'}</p>
              <p><strong>Email:</strong> {selectedOrder.customer ? selectedOrder.customer.email : 'N/A'}</p>
              <p><strong>Phone:</strong> {selectedOrder.customer && selectedOrder.customer.phone ? selectedOrder.customer.phone : 'Not provided'}</p>
            </div>

            <h3>Ordered Line Items</h3>
            <div className="table-container" style={{ margin: '1rem 0' }}>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU Code</th>
                    <th>Price Each</th>
                    <th>Qty Ordered</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map(item => (
                    <tr key={item.id}>
                      <td className="font-bold">{item.product ? item.product.name : 'Unknown Product'}</td>
                      <td>
                        <code>{item.product ? item.product.sku : 'N/A'}</code>
                      </td>
                      <td>${item.price.toFixed(2)}</td>
                      <td className="font-bold">{item.quantity}</td>
                      <td className="font-bold text-right">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
              <span className="font-bold">Total Calculated Amount:</span>
              <span className="stat-value" style={{ fontSize: '2rem', color: 'var(--success)' }}>
                ${selectedOrder.total_amount.toFixed(2)}
              </span>
            </div>

            <div className="flex mt-4" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-primary" onClick={handleCloseDetails}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderList;
