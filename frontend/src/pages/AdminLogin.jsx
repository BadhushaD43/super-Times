import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(username.trim(), password);
    setLoading(false);
    if (result.ok) navigate('/admin');
    else setError(result.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--black)' }}>
      <div className="max-w-md w-full rounded-2xl p-8 shadow-2xl" style={{ background: 'var(--black-card)', border: '1px solid var(--border)' }}>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold mb-6 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <FaArrowLeft className="text-xs" /> Back to Site
        </Link>
        <h2 className="text-3xl font-bold text-center mb-2" style={{ color: 'var(--primary)' }}>Admin Login</h2>
        <p className="text-center text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Sign in to manage your store</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Username</label>
            <input
              type="text" value={username} onChange={e => setUsername(e.target.value)} required
              className="w-full px-4 py-3 rounded-lg focus:outline-none"
              style={{ background: 'var(--black-soft)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-4 py-3 rounded-lg focus:outline-none"
              style={{ background: 'var(--black-soft)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full btn-primary text-lg py-3">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center mt-5 text-xs" style={{ color: 'var(--text-secondary)' }}>
          demo: <span style={{ color: 'var(--primary)' }}>admin / admin123</span>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
