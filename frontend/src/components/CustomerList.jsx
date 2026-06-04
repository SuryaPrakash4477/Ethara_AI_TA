import React, { useState, useEffect } from 'react';

function CustomerList({ apiBase, refreshTrigger, triggerRefresh }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Fields
  const [formFields, setFormFields] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/customers`);
      if (!res.ok) throw new Error('Failed to retrieve customer directory.');
      const data = await res.json();
      setCustomers(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error fetching customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [apiBase, refreshTrigger]);

  const handleOpenModal = () => {
    setFormFields({ name: '', email: '', phone: '' });
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

    // Validations
    if (!formFields.name.trim()) return setError('Full name is required.');
    if (!formFields.email.trim()) return setError('Email address is required.');
    
    // Quick regex for email structure
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formFields.email.trim())) {
      return setError('Please provide a valid email address.');
    }

    const payload = {
      name: formFields.name,
      email: formFields.email.trim(),
      phone: formFields.phone ? formFields.phone.trim() : null
    };

    try {
      const res = await fetch(`${apiBase}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.detail || 'Failed to register customer.');
      }

      setSuccess('Customer registered successfully!');
      setTimeout(() => setSuccess(null), 3000);
      handleCloseModal();
      triggerRefresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer? This action is permanent.')) return;

    try {
      const res = await fetch(`${apiBase}/customers/${customerId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to delete customer.');
      }
      setSuccess('Customer deleted successfully.');
      setTimeout(() => setSuccess(null), 3000);
      triggerRefresh();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  // Search filter
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Customer Management</h1>
          <p className="text-muted">Register and review registered business contacts and emails</p>
        </div>
        <button id="add-customer-btn" className="btn btn-primary" onClick={handleOpenModal}>
          + Add Customer
        </button>
      </div>

      {success && <div className="alert alert-success">✅ {success}</div>}
      {error && !isModalOpen && <div className="alert alert-danger">⚠️ {error}</div>}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <input
          id="customer-search"
          type="text"
          placeholder="Search customers by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="card">
        {loading ? (
          <div className="text-center text-muted">Retrieving customer directory...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center text-muted">No customers found. Register a new customer to begin.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(c => (
                  <tr key={c.id}>
                    <td className="font-bold">{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone || <span className="text-muted">Not provided</span>}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => handleDeleteCustomer(c.id)}
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
            <h2>Add Customer</h2>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              Create a unique client profile. Email must be unique.
            </p>

            {error && <div className="alert alert-danger">⚠️ {error}</div>}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  id="customer-name-input"
                  type="text"
                  name="name"
                  value={formFields.name}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  id="customer-email-input"
                  type="email"
                  name="email"
                  value={formFields.email}
                  onChange={handleInputChange}
                  placeholder="e.g. john.doe@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  id="customer-phone-input"
                  type="text"
                  name="phone"
                  value={formFields.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. +1 (555) 019-2834"
                />
              </div>

              <div className="flex mt-4 gap-3" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button id="customer-submit-btn" type="submit" className="btn btn-primary">
                  Register Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerList;
