import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext.jsx';
import { FaBoxOpen, FaChartBar, FaEnvelope, FaRupeeSign, FaShoppingCart, FaStar, FaCalendarDay } from 'react-icons/fa';
import { API_BASE_URL as API } from '../lib/api.js';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="rounded-xl p-6 border" style={{ background: 'var(--black-card)', borderColor: 'var(--border)' }}>
    <div className="flex items-center justify-between mb-3">
      <span className="w-11 h-11 rounded-lg flex items-center justify-center text-lg" style={{ background: `${color}18`, color }}>
        <Icon />
      </span>
      <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: `${color}20`, color }}>{label}</span>
    </div>
    <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{value ?? '-'}</p>
  </div>
);

const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token || localStorage.getItem('token')}` };
    Promise.all([
      axios.get(`${API}/admin/stats/`, { headers }),
      axios.get(`${API}/orders/`, { headers }),
    ]).then(([statsRes, ordersRes]) => {
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data.slice(0, 5));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statusColor = { pending: '#f59e0b', processing: '#3b82f6', shipped: '#8b5cf6', delivered: '#10b981', cancelled: '#ef4444' };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]" style={{ color: 'var(--text-secondary)' }}>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Products" value={stats?.total_products} icon={FaBoxOpen} color="#f59e0b" />
        <StatCard label="Orders" value={stats?.total_orders} icon={FaShoppingCart} color="#3b82f6" />
        <StatCard label="Revenue" value={stats ? `Rs. ${stats.total_revenue.toLocaleString()}` : null} icon={FaRupeeSign} color="#10b981" />
        <StatCard label="Today's Orders" value={stats?.new_orders_today} icon={FaCalendarDay} color="#8b5cf6" />
        <StatCard label="Avg Order" value={stats ? `Rs. ${stats.avg_order_value}` : null} icon={FaChartBar} color="#ec4899" />
        <StatCard label="Reviews" value={stats?.total_reviews} icon={FaStar} color="#f59e0b" />
        <StatCard label="Contacts" value={stats?.total_contacts} icon={FaEnvelope} color="#06b6d4" />
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--black-card)', borderColor: 'var(--border)' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Orders</h2>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>No orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['ID', 'Customer', 'Total', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-6 py-3 text-left font-medium" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id} className="border-b hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-6 py-3" style={{ color: 'var(--text-primary)' }}>#{o.id}</td>
                  <td className="px-6 py-3" style={{ color: 'var(--text-primary)' }}>{o.customer_name}</td>
                  <td className="px-6 py-3" style={{ color: 'var(--text-primary)' }}>Rs. {o.total_price}</td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                      style={{ background: `${statusColor[o.status] || '#6b7280'}20`, color: statusColor[o.status] || '#6b7280' }}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-3" style={{ color: 'var(--text-secondary)' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
