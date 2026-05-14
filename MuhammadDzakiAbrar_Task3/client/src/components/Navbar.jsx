import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const socket = useSocket();
  const [notification, setNotification] = useState('');

  useEffect(() => {
    // Only listen for users, admins have their own dashboard notifications
    if (!socket || isAdmin) return;

    const handleStatusUpdate = (data) => {
      const message = `🔔 PENGUMUMAN!\nPesananmu #${data.orderId.slice(-6).toUpperCase()} sekarang statusnya: ${data.status}`;
      setNotification(message);
      
      // Also trigger a browser alert for strong validation/popup as requested
      window.alert(message);
      
      setTimeout(() => setNotification(''), 7000);
    };

    socket.on('orderStatusUpdate', handleStatusUpdate);

    return () => socket.off('orderStatusUpdate', handleStatusUpdate);
  }, [socket, isAdmin]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      navigate('/login');
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Global Toast Notification for Users */}
      {notification && (
        <div className="toast-container" style={{ top: '88px', right: '24px', zIndex: 9999 }}>
          <div className="toast toast-success" style={{ padding: '20px', fontSize: '1rem', borderLeft: '5px solid #1f8b4c', whiteSpace: 'pre-line' }}>
            {notification}
          </div>
        </div>
      )}

      <nav className="navbar">
        <div className="navbar-inner">
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="navbar-logo">
            <span className="logo-icon">🍕</span>
            <span className="logo-text">Oasis Pizza</span>
          </Link>
          <div className="navbar-links">
            {isAdmin ? (
              <>
                <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Dashboard</Link>
                <Link to="/admin/inventory" className={location.pathname === '/admin/inventory' ? 'active' : ''}>Inventory</Link>
                <Link to="/admin/orders" className={location.pathname === '/admin/orders' ? 'active' : ''}>Orders</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Menu</Link>
                <Link to="/build" className={location.pathname === '/build' ? 'active' : ''}>Build</Link>
                <Link to="/orders" className={location.pathname === '/orders' ? 'active' : ''}>Orders</Link>
              </>
            )}
            <div className="nav-user">
              <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''} style={{ textDecoration: 'none' }}>
                <div className="nav-avatar" style={{ margin: 0 }}>{user.name?.charAt(0).toUpperCase()}</div>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
