import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePizza } from '../context/PizzaContext';
import api from '../services/api';

const stepLabels = ['Base', 'Sauce', 'Cheese', 'Toppings', 'Review'];

const categoryImages = {
  'Thin Crust': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'Thick Crust': 'https://images.unsplash.com/photo-1589367920969-ab8e050eb0e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'Stuffed Crust': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'Gluten-Free': 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'Whole Wheat': 'https://images.unsplash.com/photo-1542190104-e5ce76a66b96?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'Classic Tomato': 'https://images.unsplash.com/photo-1472476449509-f03df0f21469?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'BBQ Sauce': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'White Garlic': 'https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'Pesto': 'https://images.unsplash.com/photo-1599321955726-e048426594af?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'Hot Sauce': 'https://images.unsplash.com/photo-1553093246-17b5f58c7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'Mozzarella': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'Cheddar': 'https://images.unsplash.com/photo-1618164436241-ecaf3fec2eeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'Parmesan': 'https://images.unsplash.com/photo-1589361730071-70bf85746ee4?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'Gouda': 'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'Vegan Cheese': 'https://images.unsplash.com/photo-1615486171447-49fbf1a1cb8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'Mushrooms': 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'Bell Peppers': 'https://images.unsplash.com/photo-1563514981440-621b1069b2d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'Onions': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'Olives': 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'Tomatoes': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'Spinach': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'Jalapeños': 'https://images.unsplash.com/photo-1506807803487-111005a8b7fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'Corn': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'Pepperoni': 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'Chicken': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'Sausage': 'https://images.unsplash.com/photo-1585325701165-351af916e581?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'Bacon': 'https://images.unsplash.com/photo-1608681140082-c64998394b99?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  'Ham': 'https://images.unsplash.com/photo-1595085350917-8e3b33362a5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
};

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80';

export default function PizzaBuilder() {
  const navigate = useNavigate();
  const pizza = usePizza();
  const [menu, setMenu] = useState({ bases: [], sauces: [], cheeses: [], veggies: [], meats: [] });
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/pizza/menu').then(res => { setMenu(res.data); setLoading(false); })
      .catch(() => { setError('Failed to load menu'); setLoading(false); });
  }, []);

  const handlePayment = async () => {
    if (!pizza.base || !pizza.sauce || !pizza.cheese) { setError('Please select base, sauce, and cheese'); return; }
    setOrderLoading(true); setError('');
    try {
      const payRes = await api.post('/payment/create-order', { amount: pizza.totalPrice });
      const { orderId, amount, currency, keyId } = payRes.data;

      const options = {
        key: keyId, amount, currency, order_id: orderId, name: 'Oasis Pizza',
        description: 'Custom Pizza Order',
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/payment/verify', response);
            if (verifyRes.data.verified) {
              await api.post('/orders', {
                items: pizza.getOrderItems(), totalPrice: pizza.totalPrice,
                paymentId: response.razorpay_payment_id, razorpayOrderId: response.razorpay_order_id,
              });
              pizza.reset();
              navigate('/orders');
            }
          } catch { setError('Payment verification failed'); }
          setOrderLoading(false);
        },
        modal: { ondismiss: () => setOrderLoading(false) },
        theme: { color: '#B32821' },
      };

      if (window.Razorpay) {
        new window.Razorpay(options).open();
      } else {
        // Fallback: place order without payment in dev
        await api.post('/orders', { items: pizza.getOrderItems(), totalPrice: pizza.totalPrice, paymentId: 'test_' + Date.now() });
        pizza.reset();
        navigate('/orders');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
      setOrderLoading(false);
    }
  };

  const renderOptions = (items, selected, onSelect, multi = false) => (
    <div className="option-grid">
      {items.map(item => {
        const isSelected = multi
          ? (Array.isArray(selected) && selected.some(s => s._id === item._id))
          : (selected?._id === item._id);
        return (
          <div key={item._id} className={`option-card ${isSelected ? 'selected' : ''}`} onClick={() => onSelect(item)}>
            <span className="check-mark">✓</span>
            <div className="option-img-wrapper" style={{ border: isSelected ? '2px solid #B32821' : '1px solid #e0e0e0' }}>
              <img 
                src={categoryImages[item.name] || DEFAULT_IMG} 
                alt={item.name} 
                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMG; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            <div className="option-name">{item.name}</div>
            <div className="option-desc" style={{minHeight: '36px'}}>{item.description}</div>
            <div className="option-price">${item.price.toFixed(2)}</div>
          </div>
        );
      })}
    </div>
  );

  if (loading) return <div className="page"><div className="spinner"></div></div>;

  const steps = [
    { title: 'Choose Your Base', desc: 'Select a pizza base to start', content: renderOptions(menu.bases, pizza.base, pizza.setBase) },
    { title: 'Pick Your Sauce', desc: 'Add the perfect sauce', content: renderOptions(menu.sauces, pizza.sauce, pizza.setSauce) },
    { title: 'Select Cheese', desc: 'Choose your favorite cheese', content: renderOptions(menu.cheeses, pizza.cheese, pizza.setCheese) },
    {
      title: 'Add Toppings', desc: 'Select veggies and meats',
      content: (
        <>
          <h3 style={{ margin: '16px 0 16px', color: '#1f8b4c', textTransform: 'uppercase', fontSize: '1rem' }}>Veggies</h3>
          {renderOptions(menu.veggies, pizza.veggies, pizza.toggleVeggie, true)}
          <h3 style={{ margin: '32px 0 16px', color: '#B32821', textTransform: 'uppercase', fontSize: '1rem' }}>Meats</h3>
          {renderOptions(menu.meats, pizza.meat, pizza.toggleMeat, true)}
        </>
      ),
    },
    {
      title: 'Review Order', desc: 'Check your pizza before ordering',
      content: (
        <div className="review-card">
          <h3>Your Custom Pizza</h3>
          {pizza.base && <div className="review-item"><span className="item-name">Base: {pizza.base.name}</span><span className="item-price">${pizza.base.price.toFixed(2)}</span></div>}
          {pizza.sauce && <div className="review-item"><span className="item-name">Sauce: {pizza.sauce.name}</span><span className="item-price">${pizza.sauce.price.toFixed(2)}</span></div>}
          {pizza.cheese && <div className="review-item"><span className="item-name">Cheese: {pizza.cheese.name}</span><span className="item-price">${pizza.cheese.price.toFixed(2)}</span></div>}
          {pizza.veggies.map(v => <div key={v._id} className="review-item"><span className="item-name">Veggie: {v.name}</span><span className="item-price">${v.price.toFixed(2)}</span></div>)}
          {pizza.meat.map(m => <div key={m._id} className="review-item"><span className="item-name">Meat: {m.name}</span><span className="item-price">${m.price.toFixed(2)}</span></div>)}
          <div className="review-total">
            <span className="total-label">Total</span>
            <span className="total-price">${pizza.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="page" style={{ background: '#ffffff' }}>
      <div className="container builder-page" style={{ padding: '40px 0' }}>
        <div className="builder-header">
          <h1>Create Your Own</h1>
        </div>
        <div className="builder-steps">
          {stepLabels.map((label, i) => (
            <div key={label} className={`builder-step ${pizza.step === i ? 'active' : ''} ${pizza.step > i ? 'completed' : ''}`} onClick={() => pizza.setStep(i)}>
              <span className="builder-step-num">{pizza.step > i ? '✓' : (i + 1)}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className="builder-content">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="builder-section">
            <h2 style={{ textTransform: 'none', fontSize: '1.8rem' }}>{steps[pizza.step].title}</h2>
            <p>{steps[pizza.step].desc}</p>
            {steps[pizza.step].content}
          </div>
          <div className="builder-nav">
            <button className="btn btn-secondary" onClick={pizza.prevStep} disabled={pizza.step === 0} style={{ borderRadius: '4px' }}>← Previous</button>
            {pizza.step < 4 ? (
              <button className="btn btn-primary" onClick={pizza.nextStep} style={{ borderRadius: '4px' }}>Next →</button>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={handlePayment} disabled={orderLoading} style={{ borderRadius: '4px' }}>
                {orderLoading ? 'Processing...' : `Pay $${pizza.totalPrice.toFixed(2)}`}
              </button>
            )}
          </div>
          {pizza.totalPrice > 0 && (
            <div className="builder-price-bar">
              <span className="price-label">Current Total</span>
              <span className="price-value">${pizza.totalPrice.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
