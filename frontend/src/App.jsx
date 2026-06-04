import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import CustomerList from './components/CustomerList';
import OrderList from './components/OrderList';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const navigateTo = (tab) => {
    setActiveTab(tab);
    triggerRefresh();
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="brand">
          📦 Apex<span>Hub</span>
        </div>
        <nav className="nav-links">
          <button 
            id="nav-dashboard"
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => navigateTo('dashboard')}
          >
            Dashboard
          </button>
          <button 
            id="nav-products"
            className={`nav-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => navigateTo('products')}
          >
            Products
          </button>
          <button 
            id="nav-customers"
            className={`nav-btn ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => navigateTo('customers')}
          >
            Customers
          </button>
          <button 
            id="nav-orders"
            className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => navigateTo('orders')}
          >
            Orders
          </button>
        </nav>
      </header>

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard apiBase={API_URL} triggerTabChange={navigateTo} refreshTrigger={refreshTrigger} />
        )}
        {activeTab === 'products' && (
          <ProductList apiBase={API_URL} refreshTrigger={refreshTrigger} triggerRefresh={triggerRefresh} />
        )}
        {activeTab === 'customers' && (
          <CustomerList apiBase={API_URL} refreshTrigger={refreshTrigger} triggerRefresh={triggerRefresh} />
        )}
        {activeTab === 'orders' && (
          <OrderList apiBase={API_URL} refreshTrigger={refreshTrigger} triggerRefresh={triggerRefresh} />
        )}
      </main>
    </div>
  );
}

export default App;
