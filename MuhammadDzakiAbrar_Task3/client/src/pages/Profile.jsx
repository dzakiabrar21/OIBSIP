import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="page" style={{ background: '#fcfcfc', minHeight: '100vh', paddingTop: '0' }}>
      {/* PROFILE COVER HEADER */}
      <div className="profile-cover" style={{ 
        height: '250px', 
        width: '100%', 
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url("https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        <div className="container" style={{ position: 'relative', height: '100%' }}>
           <div className="profile-header-info" style={{ 
            position: 'absolute', 
            bottom: '-60px', 
            left: '0', 
            display: 'flex', 
            alignItems: 'flex-end', 
            gap: '24px' 
          }}>
            <div className="profile-avatar" style={{ 
              width: '150px', 
              height: '150px', 
              background: '#B32821', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '4.5rem', 
              fontWeight: 900, 
              color: '#fff',
              border: '6px solid #fff',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ paddingBottom: '20px' }}>
              <h1 className="profile-title" style={{ color: '#fff', fontSize: '2.5rem', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>{user?.name}</h1>
              <p className="profile-subtitle" style={{ color: 'rgba(255,255,255,0.9)', margin: '4px 0 0', fontSize: '1.1rem' }}>{isAdmin ? 'Store Administrator' : 'Oasis Pizza Member'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container profile-grid profile-container" style={{ marginTop: '100px', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px', paddingBottom: '60px' }}>
        
        {/* MAIN INFO CARD */}
        <div className="profile-card" style={{ background: '#fff', padding: '40px', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 2px 15px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '32px', borderBottom: '2px solid #f4f4f4', paddingBottom: '16px' }}>Account Information</h2>
          
          <div className="profile-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: '#999', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px', letterSpacing: '0.5px' }}>Full Name</label>
              <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{user?.name}</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: '#999', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px', letterSpacing: '0.5px' }}>Email Address</label>
              <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{user?.email}</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: '#999', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px', letterSpacing: '0.5px' }}>Account Status</label>
              <div style={{ color: '#1f8b4c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.2rem' }}>✓</span> Verified Account
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: '#999', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px', letterSpacing: '0.5px' }}>Member Since</label>
              <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>May 2026</div>
            </div>
          </div>

          <div style={{ marginTop: '48px', padding: '24px', background: '#fff5f5', borderRadius: '8px', border: '1px solid #ffe3e3' }}>
            <h4 style={{ color: '#B32821', margin: '0 0 8px' }}>Security & Privacy</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Your data is encrypted and secure. You can update your password via the Forgot Password feature on the login page.</p>
          </div>
        </div>

        {/* SIDEBAR ACTIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #eee' }}>
             <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Quick Actions</h3>
             <button 
              onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
              className="btn btn-outline" 
              style={{ width: '100%', marginBottom: '12px', padding: '12px', borderRadius: '6px' }}
             >
               Go to Dashboard
             </button>
             <button 
              onClick={handleLogout}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px', borderRadius: '6px', background: '#B32821', border: 'none' }}
             >
               Logout from Account
             </button>
          </div>

          <div style={{ background: '#f8f8f8', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>Version 2.4.0 (Corporate Build)</p>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#888' }}>© 2026 Oasis Pizza Inc.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
