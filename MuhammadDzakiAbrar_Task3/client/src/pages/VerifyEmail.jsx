import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function VerifyEmail() {
  const { token } = useParams();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-email/${token}`);
        setMessage(res.data.message);
      } catch (err) {
        setError(err.response?.data?.message || 'Verification failed');
      } finally { setLoading(false); }
    };
    verify();
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        {loading ? (
          <><div className="logo" style={{ fontSize: '3rem' }}>⏳</div><h2>Verifying your email...</h2><div className="spinner" style={{ marginTop: 20 }}></div></>
        ) : message ? (
          <><div className="logo" style={{ fontSize: '3rem' }}>✅</div><h2>Email Verified!</h2><p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px' }}>{message}</p><Link to="/login" className="btn btn-primary btn-lg">Go to Login</Link></>
        ) : (
          <><div className="logo" style={{ fontSize: '3rem' }}>❌</div><h2>Verification Failed</h2><p style={{ color: 'var(--red)', margin: '12px 0 24px' }}>{error}</p><Link to="/login" className="btn btn-secondary btn-lg">Back to Login</Link></>
        )}
      </div>
    </div>
  );
}
