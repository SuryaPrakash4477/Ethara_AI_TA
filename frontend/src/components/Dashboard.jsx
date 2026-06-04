import React, { useState, useEffect } from 'react';

function Dashboard({ apiBase, triggerTabChange, refreshTrigger }) {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    lowStockCount: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const [prodRes, custRes, orderRes] = await Promise.all([
          fetch(`${apiBase}/products`),
          fetch(`${apiBase}/customers`),
          fetch(`${apiBase}/orders`),
        ]);

        if (!prodRes.ok || !custRes.ok || !orderRes.ok) {
          throw new Error('Failed to fetch dashboard metrics');
        }

        const products = await prodRes.json();
        const customers = await custRes.json();
        const orders = await orderRes.json();

        const lowStock = products.filter(p => p.quantity <= 5);

        setStats({
          totalProducts: products.length,
          totalCustomers: customers.length,
          totalOrders: orders.length,
          lowStockCount: lowStock.length,
        });

        setLowStockProducts(lowStock);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Error connecting to the backend API. Please make sure the services are running.');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [apiBase, refreshTrigger]);

  if (loading) {
    return (
      <div className="text-center mt-4">
        <div className="text-muted">Loading dashboard intelligence analytics...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <h1>Operations Dashboard</h1>
        <div className="text-muted">Real-time enterprise metrics</div>
      </div>

      {error && <div className="alert alert-danger">⚠️ {error}</div>}

      <div className="dashboard-grid">
        <div 
          className="card stat-card" 
          onClick={() => triggerTabChange('products')} 
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-label">Total Products</div>
          <div className="stat-value-row">
            <div className="stat-value">{stats.totalProducts}</div>
            <div className="stat-icon">📦</div>
          </div>
        </div>

        <div 
          className="card stat-card stat-purple" 
          onClick={() => triggerTabChange('customers')} 
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-label">Total Customers</div>
          <div className="stat-value-row">
            <div className="stat-value">{stats.totalCustomers}</div>
            <div className="stat-icon">👥</div>
          </div>
        </div>

        <div 
          className="card stat-card stat-success" 
          onClick={() => triggerTabChange('orders')} 
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-label">Total Orders</div>
          <div className="stat-value-row">
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-icon">🛒</div>
          </div>
        </div>

        <div className="card stat-card stat-danger">
          <div className="stat-label">Low Stock Alerts</div>
          <div className="stat-value-row">
            <div className="stat-value">{stats.lowStockCount}</div>
            <div className="stat-icon">⚠️</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Critical Inventory Stock Alerts</h2>
        <p className="text-muted mt-2" style={{ marginBottom: '1.25rem' }}>
          Products below the safety threshold (quantity &le; 5 units)
        </p>

        {lowStockProducts.length === 0 ? (
          <div className="alert alert-success">
            ✅ All products are fully stocked. No active alerts.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU Code</th>
                  <th>Price</th>
                  <th>Units In Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map(p => (
                  <tr key={p.id}>
                    <td className="font-bold">{p.name}</td>
                    <td><code>{p.sku}</code></td>
                    <td>${p.price.toFixed(2)}</td>
                    <td className="font-bold" style={{ color: p.quantity === 0 ? 'var(--danger)' : 'var(--warning)' }}>
                      {p.quantity}
                    </td>
                    <td>
                      {p.quantity === 0 ? (
                        <span className="badge badge-danger">Out of Stock</span>
                      ) : (
                        <span className="badge badge-warning">Low Stock</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
