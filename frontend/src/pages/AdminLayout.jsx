import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext.jsx';
import { FaBell, FaEnvelope, FaShoppingCart, FaSignOutAlt, FaUserShield } from 'react-icons/fa';
import { API_BASE_URL as API } from '../lib/api.js';

const AdminLayout = () => {
  const { token, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const bellRef = useRef();

  useEffect(() => {
    if (!isAuthenticated && !localStorage.getItem('token')) { navigate('/login'); return; }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    const handler = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifications = async () => {
    try {
      const headers = { Authorization: `Bearer ${token || localStorage.getItem('token')}` };
      const [ordersRes, contactsRes] = await Promise.all([
        axios.get(`${API}/orders/`, { headers }),
        axios.get(`${API}/contacts/`, { headers }),
      ]);
      const readIds = JSON.parse(localStorage.getItem('readNotifs') || '[]');
      const orderNotifs = ordersRes.data.map(o => ({
        id: `order-${o.id}`, type: 'order',
        title: `New Order #${o.id}`,
        detail: `${o.customer_name} — ₹${o.total_price}`,
        time: o.created_at,
        read: readIds.includes(`order-${o.id}`),
      }));
      const contactNotifs = contactsRes.data.map(c => ({
        id: `contact-${c.id}`, type: 'contact',
        title: `Contact: ${c.name}`,
        detail: c.message?.slice(0, 60) + (c.message?.length > 60 ? '…' : ''),
        time: c.created_at,
        read: readIds.includes(`contact-${c.id}`),
      }));
      const all = [...orderNotifs, ...contactNotifs].sort((a, b) => new Date(b.time) - new Date(a.time));
      setNotifications(all);
    } catch {}
  };

  const markRead = (id) => {
    const readIds = JSON.parse(localStorage.getItem('readNotifs') || '[]');
    if (!readIds.includes(id)) {
      localStorage.setItem('readNotifs', JSON.stringify([...readIds, id]));
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    const ids = notifications.map(n => n.id);
    localStorage.setItem('readNotifs', JSON.stringify(ids));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const navLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
      ? 'text-yellow-400 bg-yellow-400/10'
      : 'text-gray-300 hover:text-yellow-400 hover:bg-white/5'}`;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen" style={{ background: 'var(--black)' }}>
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 border-b" style={{ background: 'var(--black-card)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 font-bold text-lg mr-4 flex items-center gap-2">
              <FaUserShield /> Admin
            </span>
            <NavLink to="/admin/dashboard" className={navLinkClass}>Dashboard</NavLink>
            <NavLink to="/admin/orders" className={navLinkClass}>Order Management</NavLink>
            <NavLink to="/admin/products" className={navLinkClass}>Product Management</NavLink>
            <NavLink to="/admin/gallery" className={navLinkClass}>Gallery Management</NavLink>
            <NavLink to="/admin/contacts" className={navLinkClass}>Contact Management</NavLink>
          </div>

          <div className="flex items-center gap-3">
            {/* Bell */}
            <div className="relative" ref={bellRef}>
              <button onClick={() => setOpen(o => !o)} className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
                <FaBell className="text-xl text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-2xl border overflow-hidden z-50"
                  style={{ background: 'var(--black-card)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-yellow-400 hover:underline">Mark all read</button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center py-6 text-sm" style={{ color: 'var(--text-secondary)' }}>No notifications</p>
                    ) : notifications.map(n => (
                      <div key={n.id} onClick={() => markRead(n.id)}
                        className="px-4 py-3 border-b cursor-pointer hover:bg-white/5 transition-colors flex gap-3"
                        style={{ borderColor: 'var(--border)', background: n.read ? 'transparent' : 'rgba(255,183,3,0.12)' }}>
                        <span className="w-9 h-9 rounded-lg flex items-center justify-center mt-0.5 flex-shrink-0" style={{ background: 'rgba(255,183,3,0.14)', color: 'var(--primary)' }}>
                          {n.type === 'order' ? <FaShoppingCart /> : <FaEnvelope />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                            {!n.read && <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />}
                          </div>
                          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>{n.detail}</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(n.time).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </nav>

      <Outlet />
    </div>
  );
};

export default AdminLayout;
