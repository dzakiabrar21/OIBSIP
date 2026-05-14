import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';

const statusOptions = ['Order Received', 'In the Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled'];

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine initial tab from URL
  const getTabFromUrl = () => {
    if (location.pathname.includes('/inventory')) return 'inventory';
    if (location.pathname.includes('/orders')) return 'orders';
    return 'stats';
  };
  
  const [activeTab, setActiveTab] = useState(getTabFromUrl());
  const [stats, setStats] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const socket = useSocket();

  useEffect(() => {
    setActiveTab(getTabFromUrl());
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(tab === 'stats' ? '/admin' : `/admin/${tab}`);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, invRes, ordRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/inventory'),
        api.get('/admin/orders')
      ]);
      setStats(statsRes.data);
      setInventory(invRes.data);
      setOrders(ordRes.data);
    } catch (err) {
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('newOrder', (data) => {
      setMessage(`New Order Received: #${data.orderId.slice(-6).toUpperCase()}`);
      loadData(); // Refresh data on new order
      setTimeout(() => setMessage(''), 5000);
    });

    return () => socket.off('newOrder');
  }, [socket]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      window.alert(`✅ SUCCESS!\nOrder #${orderId.slice(-6).toUpperCase()} has been successfully updated to: "${newStatus}"`);
    } catch (err) {
      window.alert('❌ FAILED: Could not update order status.');
      setError('Failed to update status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSeedInventory = async () => {
    if (!window.confirm('This will seed the inventory with default items. Continue?')) return;
    try {
      await api.post('/admin/seed-inventory');
      loadData();
      setMessage('Inventory seeded successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to seed inventory');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) return <div className="page"><div className="spinner"></div></div>;

  return (
    <div className="admin-layout">
      {message && <div className="toast-container"><div className="toast toast-success">{message}</div></div>}
      {error && <div className="toast-container"><div className="toast toast-error">{error}</div></div>}
      
      <div className="admin-sidebar">
        <h3 style={{ padding: '0 16px', marginBottom: 16, color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Admin Panel</h3>
        <div className="admin-sidebar-nav">
          <button className={`admin-nav-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => handleTabChange('stats')}>
            <span className="admin-nav-icon">📊</span> Dashboard
          </button>
          <button className={`admin-nav-item ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => handleTabChange('inventory')}>
            <span className="admin-nav-icon">🥫</span> Inventory
          </button>
          <button className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => handleTabChange('orders')}>
            <span className="admin-nav-icon">📋</span> Orders
          </button>
        </div>
      </div>

      <div className="admin-main">
        {activeTab === 'stats' && (
          <div>
            <h1 style={{ marginBottom: 24 }}>Dashboard Stats</h1>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-value">${stats?.totalRevenue.toFixed(2)}</div>
                <div className="stat-label">Total Revenue</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-value">{stats?.totalOrders}</div>
                <div className="stat-label">Total Orders</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔥</div>
                <div className="stat-value">{stats?.pendingOrders}</div>
                <div className="stat-label">Pending Orders</div>
              </div>
              <div className="stat-card" style={{ borderColor: stats?.lowStockCount > 0 ? 'var(--red)' : 'var(--border)' }}>
                <div className="stat-icon">⚠️</div>
                <div className="stat-value" style={{ color: stats?.lowStockCount > 0 ? 'var(--red)' : 'inherit' }}>{stats?.lowStockCount}</div>
                <div className="stat-label">Low Stock Items</div>
              </div>
            </div>

            <h2 style={{ marginBottom: 16 }}>Recent Orders</h2>
            <div className="orders-list">
              {stats?.recentOrders.map(order => (
                <div key={order._id} className="order-card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>#{order._id.slice(-6).toUpperCase()}</strong> - {order.user?.name}
                    </div>
                    <span className={`order-status status-${order.status === 'Sent to Delivery' ? 'delivery' : order.status.split(' ')[0].toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h1>Inventory Management</h1>
              {inventory.length === 0 && (
                <button className="btn btn-primary" onClick={handleSeedInventory}>Seed Initial Inventory</button>
              )}
            </div>
            
            <div style={{ overflowX: 'auto', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Threshold</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => (
                    <tr key={item._id}>
                      <td style={{ fontWeight: 500 }}>{item.name}</td>
                      <td><span className="category-badge">{item.category}</span></td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: item.stock <= item.threshold ? 'var(--red)' : 'inherit' }}>
                          {item.stock}
                        </span>
                      </td>
                      <td>{item.threshold}</td>
                      <td>
                        {item.stock === 0 ? <span className="stock-badge stock-critical">Out of Stock</span> :
                         item.stock <= item.threshold ? <span className="stock-badge stock-low">Low Stock</span> :
                         <span className="stock-badge stock-ok">In Stock</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h1 style={{ marginBottom: 24 }}>Order Management</h1>
            <div className="orders-list">
              {orders.map(order => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div>
                      <span className="order-id">Order #{order._id.slice(-6).toUpperCase()}</span>
                      <div className="order-date">{new Date(order.createdAt).toLocaleString()}</div>
                      <div style={{ marginTop: 4, fontSize: '0.85rem' }}>User: {order.user?.name}</div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        style={{ padding: '6px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                      >
                        {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="order-items" style={{ background: 'var(--bg-secondary)', padding: 12, borderRadius: 8 }}>
                    {order.items.base?.name && <span className="order-item-tag">Base: {order.items.base.name}</span>}
                    {order.items.sauce?.name && <span className="order-item-tag">Sauce: {order.items.sauce.name}</span>}
                    {order.items.cheese?.name && <span className="order-item-tag">Cheese: {order.items.cheese.name}</span>}
                    {order.items.veggies?.map(v => <span key={v.item} className="order-item-tag">Veggie: {v.name}</span>)}
                    {order.items.meat?.map(m => <span key={m.item} className="order-item-tag">Meat: {m.name}</span>)}
                  </div>
                  <div style={{ marginTop: 12, textAlign: 'right', fontWeight: 'bold' }}>
                    Total: ${order.totalPrice.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
