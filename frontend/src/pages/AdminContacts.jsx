import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext.jsx';
import { FaTimes } from 'react-icons/fa';
import { API_BASE_URL as API } from '../lib/api.js';

const AdminContacts = () => {
  const { token } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${token || localStorage.getItem('token')}` };

  useEffect(() => {
    axios.get(`${API}/contacts/`, { headers }).then(r => setContacts(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contact?')) return;
    await axios.delete(`${API}/contacts/${id}`, { headers });
    setContacts(prev => prev.filter(c => c.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]" style={{ color: 'var(--text-secondary)' }}>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Contact Management</h1>

      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--black-card)', borderColor: 'var(--border)' }}>
        {contacts.length === 0 ? (
          <p className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>No contacts yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['ID', 'Name', 'Email', 'Phone', 'Message', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contacts.map(c => (
                <tr key={c.id} className="border-b hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>#{c.id}</td>
                  <td className="px-4 py-3 font-medium cursor-pointer text-yellow-400 hover:underline" onClick={() => setSelected(c)}>{c.name}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{c.email}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{c.phone}</td>
                  <td className="px-4 py-3 max-w-xs truncate" style={{ color: 'var(--text-secondary)' }}>{c.message}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(c.id)} className="text-xs px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSelected(null)}>
          <div className="rounded-2xl border p-6 w-full max-w-md mx-4" style={{ background: 'var(--black-card)', borderColor: 'var(--border)' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Contact Details</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-xl" aria-label="Close contact details"><FaTimes /></button>
            </div>
            <div className="space-y-3 text-sm">
              <p><span className="text-gray-400">Name:</span> <span style={{ color: 'var(--text-primary)' }}>{selected.name}</span></p>
              <p><span className="text-gray-400">Email:</span> <span style={{ color: 'var(--text-primary)' }}>{selected.email}</span></p>
              <p><span className="text-gray-400">Phone:</span> <span style={{ color: 'var(--text-primary)' }}>{selected.phone}</span></p>
              <p><span className="text-gray-400">Date:</span> <span style={{ color: 'var(--text-secondary)' }}>{new Date(selected.created_at).toLocaleString()}</span></p>
              <div>
                <p className="text-gray-400 mb-1">Message:</p>
                <p className="p-3 rounded-lg text-sm leading-relaxed" style={{ background: 'var(--black-soft)', color: 'var(--text-primary)' }}>{selected.message}</p>
              </div>
            </div>
            <button onClick={() => handleDelete(selected.id)} className="mt-4 w-full py-2 rounded-lg text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">Delete Contact</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;
