import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext.jsx';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { API_BASE_URL as API } from '../lib/api.js';
const STATUS_COLORS = { pending: '#f59e0b', processing: '#3b82f6', shipped: '#8b5cf6', delivered: '#10b981', cancelled: '#ef4444' };
const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(null);

  const headers = { Authorization: `Bearer ${token || localStorage.getItem('token')}` };

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = () => {
    axios.get(`${API}/orders/`, { headers }).then(r => setOrders(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  const updateStatus = async (id, status) => {
    const order = orders.find(o => o.id === id);
    await axios.put(`${API}/orders/${id}`, { ...order, status }, { headers });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
  };

  const confirmOrder = async (id) => {
    setConfirming(id);
    try {
      await axios.post(`${API}/admin/orders/${id}/confirm`, {}, { headers });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'processing' } : o));
      if (selected?.id === id) setSelected(prev => ({ ...prev, status: 'processing' }));
      alert('Order confirmed! Confirmation email sent to customer.');
    } catch (e) {
      alert(e.response?.data?.detail || 'Confirm failed');
    } finally {
      setConfirming(null);
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    await axios.delete(`${API}/orders/${id}`, { headers });
    setOrders(prev => prev.filter(o => o.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]" style={{ color: 'var(--text-secondary)' }}>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Order Management</h1>

      <div className="rounded-xl border overflow-x-auto" style={{ background: 'var(--black-card)', borderColor: 'var(--border)' }}>
        {orders.length === 0 ? (
          <p className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>No orders found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['ID', 'Customer', 'Phone', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-4 py-3 cursor-pointer text-yellow-400 hover:underline" onClick={() => setSelected(o)}>#{o.id}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{o.customer_name}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{o.phone}</td>
                  <td className="px-4 py-3 font-semibold text-yellow-400">₹{o.total_price}</td>
                  <td className="px-4 py-3">
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                      className="text-xs px-2 py-1 rounded-lg border-0 outline-none cursor-pointer capitalize"
                      style={{ background: `${STATUS_COLORS[o.status]}20`, color: STATUS_COLORS[o.status] }}>
                      {STATUSES.map(s => <option key={s} value={s} style={{ background: 'var(--black-card)', color: 'var(--text-primary)' }}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      {o.status === 'pending' && (
                        <button onClick={() => confirmOrder(o.id)} disabled={confirming === o.id}
                          className="text-xs px-3 py-1 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50">
                          {confirming === o.id ? '...' : <span className="inline-flex items-center gap-1"><FaCheck /> Confirm</span>}
                        </button>
                      )}
                      <button onClick={() => deleteOrder(o.id)} className="text-xs px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSelected(null)}>
          <div className="rounded-2xl border p-6 w-full max-w-md mx-4" style={{ background: 'var(--black-card)', borderColor: 'var(--border)' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Order #{selected.id}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-xl" aria-label="Close order details"><FaTimes /></button>
            </div>
            <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <p><span className="text-gray-400">Customer:</span> <span style={{ color: 'var(--text-primary)' }}>{selected.customer_name}</span></p>
              <p><span className="text-gray-400">Email:</span> {selected.email}</p>
              <p><span className="text-gray-400">Phone:</span> {selected.phone}</p>
              <p><span className="text-gray-400">Address:</span> {selected.address}, {selected.district}, {selected.state} - {selected.pincode}</p>
              <p><span className="text-gray-400">Total:</span> <span className="text-yellow-400 font-semibold">₹{selected.total_price}</span></p>
              <p><span className="text-gray-400">Status:</span>
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs capitalize" style={{ background: `${STATUS_COLORS[selected.status]}20`, color: STATUS_COLORS[selected.status] }}>{selected.status}</span>
              </p>
              <p><span className="text-gray-400">Date:</span> {new Date(selected.created_at).toLocaleString()}</p>
            </div>
            {selected.status === 'pending' && (
              <button onClick={() => { confirmOrder(selected.id); setSelected(null); }}
                className="mt-4 w-full py-2 rounded-lg text-sm font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">
                <span className="inline-flex items-center justify-center gap-2"><FaCheck /> Confirm Order & Send Email</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
