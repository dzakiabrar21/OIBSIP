import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';

const statusSteps = ['Order Received', 'In the Kitchen', 'Sent to Delivery', 'Delivered'];
const statusIcons = ['📋', '👨‍🍳', '🚗', '✅'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my-orders');
        setOrders(res.data);
      } catch (err) { console.error('Failed to fetch orders', err); }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('orderStatusUpdate', (data) => {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === data.orderId ? { ...order, status: data.status } : order
        )
      );
    });

    return () => socket.off('orderStatusUpdate');
  }, [socket]);

  const getStatusIndex = (status) => {
    if (status === 'Cancelled') return -1;
    return statusSteps.indexOf(status);
  };

  if (loading) return <div className="page"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="container" style={{ padding: '32px 0' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: 8 }}>📦 My Orders</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track your pizza deliveries in real-time</p>
        </div>

        {orders.length === 0 ? (
          <div className="auth-card" style={{ textAlign: 'center', margin: '0 auto' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🍕</div>
            <h3>No orders yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>You haven't ordered any pizzas yet.</p>
            <a href="/build" className="btn btn-primary">Build a Pizza</a>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => {
              const currentStep = getStatusIndex(order.status);
              
              return (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div>
                      <span className="order-id">Order #{order._id.slice(-6).toUpperCase()}</span>
                      <div className="order-date">{new Date(order.createdAt).toLocaleString()}</div>
                    </div>
                    <span className={`order-status status-${order.status === 'Sent to Delivery' ? 'delivery' : order.status.split(' ')[0].toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>

                  {order.status !== 'Cancelled' && (
                    <div className="status-tracker">
                      {statusSteps.map((step, i) => (
                        <div key={step} className={`status-step ${i <= currentStep ? (i < currentStep || currentStep === 3 ? 'completed' : 'active') : ''}`}>
                          <div className="status-dot">{statusIcons[i]}</div>
                          <div className="status-label">{step}</div>
                          <div className="status-line"></div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="order-items">
                    {order.items.base?.name && <span className="order-item-tag">Base: {order.items.base.name}</span>}
                    {order.items.sauce?.name && <span className="order-item-tag">Sauce: {order.items.sauce.name}</span>}
                    {order.items.cheese?.name && <span className="order-item-tag">Cheese: {order.items.cheese.name}</span>}
                    {order.items.veggies?.map(v => <span key={v.item} className="order-item-tag">Veggie: {v.name}</span>)}
                    {order.items.meat?.map(m => <span key={m.item} className="order-item-tag">Meat: {m.name}</span>)}
                  </div>

                  <div className="order-footer">
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Payment: </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: order.isPaid ? 'var(--green)' : 'var(--text-primary)' }}>
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                    <span className="order-total">${order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
