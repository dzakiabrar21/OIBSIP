import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const pizzaImages = {
  'margherita': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  'pepperoni': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  'veggie': 'https://images.unsplash.com/photo-1576458088443-04a19bb13da6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  'bbq-chicken': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  'hawaiian': 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  'meat-lovers': 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
};

export default function Dashboard() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/pizza/featured');
        setFeatured(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="page" style={{ background: '#ffffff' }}>
      <div className="container dashboard">
        
        {/* HERO SECTION MATCHING MOCKUP */}
        <div className="welcome-banner" style={{ background: '#f8f8f8', color: '#111', padding: '60px', display: 'flex', alignItems: 'center', gap: '40px' }}>
          <div className="welcome-banner-content" style={{ flex: 1 }}>
            <h2 style={{ color: '#111', fontSize: '3rem', fontWeight: 800, textTransform: 'none' }}>Build Your Pizza</h2>
            <p style={{ color: '#555', fontSize: '1.2rem', marginBottom: '32px' }}>Perfect, artisan-style with real ingredients.</p>
            <Link to="/build" className="btn btn-primary btn-lg" style={{ background: '#B32821', color: '#fff', border: 'none', borderRadius: '4px' }}>
              Build Your Pizza
            </Link>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <img 
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Delicious Pizza" 
              style={{ width: '100%', maxWidth: '400px', borderRadius: '50%', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', objectFit: 'cover', aspectRatio: '1/1' }} 
            />
          </div>
        </div>

        <div className="dashboard-header" style={{ marginTop: '60px', textAlign: 'left' }}>
          <h1 style={{ fontSize: '2rem', textTransform: 'none' }}>Available Pizzas</h1>
        </div>

        {loading ? <div className="spinner"></div> : (
          <div className="pizza-grid" style={{ gap: '32px' }}>
            {featured.map(pizza => (
              <div key={pizza.id} className="pizza-card" style={{ border: 'none', boxShadow: 'none' }}>
                <div className="pizza-card-image" style={{ height: '240px', background: 'transparent', border: 'none', overflow: 'hidden', borderRadius: '8px' }}>
                  <img 
                    src={pizzaImages[pizza.image] || pizzaImages['margherita']} 
                    alt={pizza.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} 
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>
                <div className="pizza-card-body" style={{ padding: '20px 0' }}>
                  <h3 style={{ fontSize: '1.2rem', textTransform: 'none', marginBottom: '8px', fontWeight: 700 }}>{pizza.name}</h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '16px' }}>{pizza.description}</p>
                  <div className="pizza-card-footer" style={{ justifyContent: 'flex-start', gap: '16px' }}>
                    <span className="pizza-price" style={{ fontSize: '1.1rem', color: '#111' }}>${pizza.price.toFixed(2)}</span>
                    <Link to="/build" className="btn btn-outline btn-sm" style={{ borderColor: '#e0e0e0', color: '#111', borderRadius: '4px' }}>Order Now</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
