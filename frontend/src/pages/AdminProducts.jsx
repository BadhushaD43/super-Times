import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext.jsx';
import { FaEdit, FaTrash, FaPlus, FaUpload, FaTimes, FaStar } from 'react-icons/fa';
import { API_BASE_URL as API } from '../lib/api.js';

const CATEGORIES = ['Footwear', 'Sunglasses', 'Watches', 'Wall Clocks', 'Perfumes'];
const SUBCATEGORIES = { Footwear: ['Men', 'Women', 'Kids'], Sunglasses: ['Men', 'Women', 'Kids'], Watches: ['Men', 'Women', 'Kids'] };

const EMPTY = { name: '', title: '', category: '', subcategory: '', model_number: '', price: '', description: '', images: [] };

const inputCls = "w-full px-3 py-2 rounded-lg border text-sm outline-none";
const inputStyle = { background: 'var(--black-soft)', borderColor: 'var(--border)', color: 'var(--text-primary)' };

const AdminProducts = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [imageFiles, setImageFiles] = useState([null, null, null]); // up to 3 slots
  const [imagePreviews, setImagePreviews] = useState([null, null, null]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(null);
  const fileRefs = [useRef(), useRef(), useRef()];

  const headers = { Authorization: `Bearer ${token || localStorage.getItem('token')}` };

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = () => {
    axios.get(`${API}/products/`).then(r => setProducts(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  const openAdd = () => {
    setForm(EMPTY);
    setImageFiles([null, null, null]);
    setImagePreviews([null, null, null]);
    setModal('add');
  };

  const openEdit = (p) => {
    setForm({ ...p, model_number: p.model_number || '', subcategory: p.subcategory || '', images: p.images || [] });
    const previews = [null, null, null];
    (p.images || []).slice(0, 3).forEach((url, i) => { previews[i] = url.startsWith('http') ? url : `${API}${url}`; });
    setImagePreviews(previews);
    setImageFiles([null, null, null]);
    setModal(p);
  };

  const handleImageSelect = (idx, file) => {
    if (!file) return;
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];
    newFiles[idx] = file;
    newPreviews[idx] = URL.createObjectURL(file);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const removeImage = (idx) => {
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];
    newFiles[idx] = null;
    newPreviews[idx] = null;
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
    // Also remove from form.images if editing
    if (modal !== 'add') {
      const imgs = [...(form.images || [])];
      imgs[idx] = undefined;
      setForm(f => ({ ...f, images: imgs.filter(Boolean) }));
    }
  };

  const uploadImages = async () => {
    const urls = modal !== 'add' ? [...(form.images || [])] : [];
    // Rebuild: for each slot, if new file → upload, else keep existing preview URL
    const result = [];
    for (let i = 0; i < 3; i++) {
      if (imageFiles[i]) {
        const fd = new FormData();
        fd.append('file', imageFiles[i]);
        const res = await axios.post(`${API}/admin/products/upload-image`, fd, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' }
        });
        result.push(res.data.url);
      } else if (imagePreviews[i] && modal !== 'add') {
        // Keep existing URL (strip API base if needed)
        const url = imagePreviews[i].replace(API, '');
        result.push(url);
      }
    }
    return result;
  };

  const handleSave = async () => {
    if (!form.name || !form.category || !form.price) return alert('Name, category and price are required.');
    setSaving(true);
    try {
      const uploadedImages = await uploadImages();
      const payload = {
        name: form.name, title: form.title, category: form.category,
        subcategory: form.subcategory || null, model_number: form.model_number || null,
        price: parseFloat(form.price), description: form.description,
        image_key: uploadedImages[0] || null, images: uploadedImages,
      };
      if (modal === 'add') {
        await axios.post(`${API}/products/`, payload, { headers });
      } else {
        await axios.put(`${API}/products/${modal.id}`, payload, { headers });
      }
      fetchProducts();
      setModal(null);
    } catch (e) {
      alert(e.response?.data?.detail || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await axios.delete(`${API}/products/${id}`, { headers });
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const hasSub = SUBCATEGORIES[form.category];

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]" style={{ color: 'var(--text-secondary)' }}>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Product Management</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-yellow-400 text-black hover:bg-yellow-300 transition-colors">
          <FaPlus /> Add Product
        </button>
      </div>

      <div className="rounded-xl border overflow-x-auto" style={{ background: 'var(--black-card)', borderColor: 'var(--border)' }}>
        {products.length === 0 ? (
          <p className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>No products found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Image', 'Name', 'Model', 'Category', 'Price', 'Rating', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-4 py-3">
                    {p.images?.[0]
                      ? <img src={p.images[0].startsWith('http') ? p.images[0] : `${API}${p.images[0]}`} alt="" className="w-12 h-12 object-cover rounded-lg" />
                      : <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xs" style={{ background: 'var(--black-soft)', color: 'var(--text-secondary)' }}>No img</div>
                    }
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{p.model_number || '—'}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{p.category}{p.subcategory ? ` / ${p.subcategory}` : ''}</td>
                  <td className="px-4 py-3 text-yellow-400 font-semibold">₹{p.price}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                    <span className="inline-flex items-center gap-1"><FaStar style={{ color: 'var(--primary)' }} /> {p.rating} ({p.total_reviews})</span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openEdit(p)} className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"><FaEdit /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setModal(null)}>
          <div className="rounded-2xl border p-6 w-full max-w-lg max-h-[92vh] overflow-y-auto" style={{ background: 'var(--black-card)', borderColor: 'var(--border)' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{modal === 'add' ? 'Add Product' : 'Edit Product'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white text-xl" aria-label="Close product modal"><FaTimes /></button>
            </div>

            <div className="space-y-3">
              {/* Name */}
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Name *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} style={inputStyle} />
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Title</label>
                <input value={form.title} onChange={e => set('title', e.target.value)} className={inputCls} style={inputStyle} />
              </div>

              {/* Model Number */}
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Model Name / Number</label>
                <input value={form.model_number} onChange={e => set('model_number', e.target.value)} className={inputCls} style={inputStyle} placeholder="e.g. NK-AIR-2024" />
              </div>

              {/* Category + Subcategory */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Category *</label>
                  <select value={form.category} onChange={e => set('category', e.target.value)} className={inputCls} style={inputStyle}>
                    <option value="">Select...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {hasSub && (
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Subcategory</label>
                    <select value={form.subcategory} onChange={e => set('subcategory', e.target.value)} className={inputCls} style={inputStyle}>
                      <option value="">Select...</option>
                      {hasSub.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Price (₹) *</label>
                <input type="number" value={form.price} onChange={e => set('price', e.target.value)} className={inputCls} style={inputStyle} />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
                <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} className={inputCls} style={inputStyle} />
              </div>

              {/* 3 Image Slots */}
              <div>
                <label className="block text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Product Images (up to 3)</label>
                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map(idx => (
                    <div key={idx} className="relative">
                      {imagePreviews[idx] ? (
                        <div className="relative rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                          <img src={imagePreviews[idx]} alt="" className="w-full h-24 object-cover" />
                          <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white text-xs">
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-24 rounded-lg cursor-pointer border-2 border-dashed transition-colors"
                          style={{ borderColor: 'var(--border)', background: 'var(--black-soft)' }}>
                          <FaUpload style={{ color: 'var(--text-secondary)' }} />
                          <span className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Image {idx + 1}</span>
                          <input ref={fileRefs[idx]} type="file" accept="image/*" className="hidden"
                            onChange={e => handleImageSelect(idx, e.target.files[0])} />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2 rounded-lg font-medium bg-yellow-400 text-black hover:bg-yellow-300 transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Product'}
              </button>
              <button onClick={() => setModal(null)} className="flex-1 py-2 rounded-lg font-medium border transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
