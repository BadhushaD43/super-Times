import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext.jsx';
import { FaTrash, FaUpload } from 'react-icons/fa';
import { API_BASE_URL as API, apiUrl } from '../lib/api.js';

const AdminGallery = () => {
  const { token } = useAuth();
  const [gallery, setGallery] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState([]);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = () => {
    axios.get(`${API}/admin/gallery/`).then(res => setGallery(res.data)).catch(() => {});
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    setPreview(files.map(f => ({ file: f, url: URL.createObjectURL(f) })));
  };

  const handleUpload = async () => {
    if (!preview.length) return;
    setUploading(true);
    try {
      for (const item of preview) {
        const fd = new FormData();
        fd.append('file', item.file);
        await axios.post(`${API}/admin/gallery/upload`, fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
      }
      setPreview([]);
      fetchGallery();
    } catch {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm('Delete this image?')) return;
    await axios.delete(`${API}/admin/gallery/${filename}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchGallery();
  };

  const cardStyle = { background: 'var(--black-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem' };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Gallery Management</h1>

        {/* Upload area */}
        <div style={cardStyle} className="mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Upload Photos</h2>
          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors"
            style={{ borderColor: 'var(--primary)', background: 'var(--black-soft)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,183,3,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--black-soft)'}
          >
            <FaUpload className="text-4xl mb-3" style={{ color: 'var(--primary)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Click to select images (JPG, PNG, WEBP)</span>
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
          </label>

          {preview.length > 0 && (
            <div className="mt-6">
              <p className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>{preview.length} file(s) selected:</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                {preview.map((p, i) => (
                  <img key={i} src={p.url} alt="" className="w-full h-24 object-cover rounded-lg" style={{ border: '1px solid var(--border)' }} />
                ))}
              </div>
              <button onClick={handleUpload} disabled={uploading} className="btn-primary px-8 py-3 mr-4">
                {uploading ? 'Uploading...' : `Upload ${preview.length} Photo(s)`}
              </button>
              <button onClick={() => setPreview([])} className="px-6 py-3 rounded-lg transition-colors"
                style={{ background: 'var(--black-soft)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Gallery grid */}
        <div style={cardStyle}>
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
            Uploaded Photos <span style={{ color: 'var(--primary)' }}>({gallery.length})</span>
          </h2>
          {gallery.length === 0 ? (
            <p className="text-center py-10" style={{ color: 'var(--text-secondary)' }}>No photos uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map(img => (
                <div key={img.filename} className="relative group rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <img src={apiUrl(img.url)} alt={img.filename} className="w-full h-40 object-cover" />
                  <button onClick={() => handleDelete(img.filename)}
                    className="absolute top-2 right-2 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: '#dc2626', color: 'white' }}>
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
};

export default AdminGallery;
