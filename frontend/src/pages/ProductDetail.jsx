import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaStar, FaChevronLeft, FaChevronRight, FaCheckCircle, FaShoppingBag, FaTimes, FaArrowLeft } from 'react-icons/fa';
import ProductCard from '../components/ProductCard.jsx';
import { getImage } from '../assets/images.js';
import { API_BASE_URL as API } from '../lib/api.js';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', user_name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [buyForm, setBuyForm] = useState({ customer_name: '', phone: '', email: '', address: '', pincode: '', state: '', district: '' });
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    setCurrentImage(0);
    axios.get(`${API}/products/${id}`).then(res => setProduct(res.data)).catch(() => navigate('/')).finally(() => setLoading(false));
    axios.get(`${API}/reviews/?product_id=${id}`).then(res => setReviews(res.data)).catch(() => {});
    axios.get(`${API}/products/?limit=8`).then(res => setRelated(res.data.filter(p => p.id !== parseInt(id)).slice(0, 4))).catch(() => {});
  }, [id]);

  const images = product?.images?.filter(Boolean) || [];
  const getImgUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${API}${url}`;
    return getImage(url);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.user_name.trim() || !reviewForm.comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/reviews/`, { ...reviewForm, product_id: parseInt(id) });
      setReviews(prev => [res.data, ...prev]);
      setReviewForm({ rating: 5, comment: '', user_name: '' });
      // Update local product rating
      setProduct(prev => ({ ...prev, total_reviews: prev.total_reviews + 1 }));
    } catch {} finally { setSubmitting(false); }
  };

  const handleBuySubmit = async (e) => {
    e.preventDefault();
    setOrdering(true);
    try {
      await axios.post(`${API}/orders/`, { ...buyForm, products: [{ [id]: 1 }], total_price: product.price });
      alert('Order placed successfully! You will receive a confirmation once the admin processes your order.');
      setShowBuyModal(false);
      setBuyForm({ customer_name: '', phone: '', email: '', address: '', pincode: '', state: '', district: '' });
    } catch { alert('Order failed. Please try again.'); }
    finally { setOrdering(false); }
  };

  const StarRow = ({ value, onChange, size = 'text-xl' }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(r => (
        <button key={r} type="button" onClick={() => onChange(r)}>
          <FaStar className={`${size} transition-colors`} style={{ color: r <= value ? 'var(--primary)' : 'var(--border)' }} />
        </button>
      ))}
    </div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ color: 'var(--text-primary)' }}>Loading...</div>;
  if (!product) return null;

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : product.rating;
  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star, count: reviews.filter(r => Math.round(r.rating) === star).length
  }));

  return (
    <div className="min-h-screen pt-24 pb-8 md:pt-28 md:pb-12" style={{ background: 'var(--black)' }}>
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-lg border text-sm font-semibold transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--black-card)' }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.color = 'var(--primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <FaArrowLeft className="text-xs" /> Back
        </button>

        {/* Product section */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-start mb-10 md:mb-16">

          {/* Images */}
          <div className="space-y-4">
            <div className="relative w-full rounded-2xl overflow-hidden" style={{ background: 'var(--black-card)', aspectRatio: '1/1' }}>
              {images.length > 0 ? (
                <img src={getImgUrl(images[currentImage])} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl" style={{ background: 'var(--black-soft)', color: 'var(--primary)' }}>
                  <FaShoppingBag />
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setCurrentImage(p => (p - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors">
                    <FaChevronLeft />
                  </button>
                  <button onClick={() => setCurrentImage(p => (p + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors">
                    <FaChevronRight />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <img key={i} src={getImgUrl(img)} alt="" onClick={() => setCurrentImage(i)}
                    className="w-20 h-20 object-cover rounded-lg cursor-pointer flex-shrink-0 transition-all"
                    style={{ border: `2px solid ${i === currentImage ? 'var(--primary)' : 'var(--border)'}` }} />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <p className="text-sm uppercase tracking-widest mb-2" style={{ color: 'var(--primary)' }}>
              {product.category}{product.subcategory ? ` / ${product.subcategory}` : ''}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{product.name}</h1>
            {product.model_number && (
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Model: {product.model_number}</p>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-0.5">
                {Array(5).fill().map((_, i) => (
                  <FaStar key={i} className="text-sm" style={{ color: i < Math.round(avgRating) ? 'var(--primary)' : 'var(--border)' }} />
                ))}
              </div>
              <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>{avgRating}</span>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>({reviews.length || product.total_reviews} reviews)</span>
            </div>

            <p className="text-3xl md:text-4xl font-bold mb-4 md:mb-6" style={{ color: 'var(--gold-light)' }}>₹{product.price}</p>
            <p className="text-sm md:text-base leading-relaxed mb-6 md:mb-8" style={{ color: 'var(--text-secondary)' }}>{product.description}</p>

            <button onClick={() => setShowBuyModal(true)}
              className="w-full py-4 rounded-xl text-lg font-bold transition-colors"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: '#111' }}>
              Buy Now — Cash on Delivery
            </button>
          </div>
        </div>

        {/* Reviews section */}
        <div className="border-t pt-8 md:pt-12" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8" style={{ color: 'var(--text-primary)' }}>Customer Reviews</h2>

          {/* Rating summary */}
          {reviews.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-6 md:gap-8 items-center sm:items-start mb-8 md:mb-10 p-4 md:p-6 rounded-2xl" style={{ background: 'var(--black-card)', border: '1px solid var(--border)' }}>
              <div className="text-center flex-shrink-0">
                <p className="text-6xl font-bold" style={{ color: 'var(--primary)' }}>{avgRating}</p>
                <div className="flex justify-center gap-0.5 my-1">
                  {Array(5).fill().map((_, i) => (
                    <FaStar key={i} className="text-sm" style={{ color: i < Math.round(avgRating) ? 'var(--primary)' : 'var(--border)' }} />
                  ))}
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{reviews.length} reviews</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {ratingDist.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-4 text-right" style={{ color: 'var(--text-secondary)' }}>{star}</span>
                    <FaStar className="text-xs flex-shrink-0" style={{ color: 'var(--primary)' }} />
                    <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: 'var(--black-soft)' }}>
                      <div className="h-full rounded-full" style={{ background: 'var(--primary)', width: reviews.length ? `${(count / reviews.length) * 100}%` : '0%' }} />
                    </div>
                    <span className="w-4" style={{ color: 'var(--text-secondary)' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-8 md:mb-10">
            {reviews.map(review => (
              <div key={review.id} className="p-5 rounded-xl" style={{ background: 'var(--black-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{review.user_name}</p>
                      <FaCheckCircle className="text-xs text-green-400" title="Verified Purchase" />
                    </div>
                    <div className="flex gap-0.5 mt-1">
                      {Array(5).fill().map((_, i) => (
                        <FaStar key={i} className="text-xs" style={{ color: i < review.rating ? 'var(--primary)' : 'var(--border)' }} />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{review.comment}</p>
              </div>
            ))}
          </div>

          {/* Write review form */}
          <div className="p-6 rounded-2xl" style={{ background: 'var(--black-card)', border: '1px solid var(--border)' }}>
            <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Write a Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Your Name</label>
                <input value={reviewForm.user_name} onChange={e => setReviewForm(f => ({ ...f, user_name: e.target.value }))}
                  placeholder="Enter your name" required
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ background: 'var(--black-soft)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Rating</label>
                <StarRow value={reviewForm.rating} onChange={r => setReviewForm(f => ({ ...f, rating: r }))} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Review</label>
                <textarea rows={3} value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  placeholder="Share your experience with this product..." required
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
                  style={{ background: 'var(--black-soft)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              </div>
              <button type="submit" disabled={submitting}
                className="px-8 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                style={{ background: 'var(--primary)', color: '#111' }}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-10 md:mt-16">
            <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8" style={{ color: 'var(--text-primary)' }}>You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* Buy Modal */}
      {showBuyModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', zIndex: 9999 }}
          onClick={() => setShowBuyModal(false)}
        >
          <div
            className="rounded-2xl w-full max-w-md overflow-y-auto"
            style={{
              background: 'var(--black-card)',
              border: '1px solid var(--border)',
              maxHeight: 'calc(100vh - 2rem)',
              padding: '1.5rem',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Complete Your Order</h2>
              <button onClick={() => setShowBuyModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white" aria-label="Close order form"><FaTimes /></button>
            </div>

            {/* Product preview */}
            <div className="flex items-center gap-3 p-3 rounded-xl mb-5" style={{ background: 'var(--black-soft)', border: '1px solid var(--border)' }}>
              {images[0] && <img src={getImgUrl(images[0])} alt="" className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />}
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{product.name}</p>
                <p className="font-bold" style={{ color: 'var(--primary)' }}>₹{product.price}</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleBuySubmit} className="space-y-3">
              {/* Name + Phone — full width each */}
              <input type="text" placeholder="Full Name" value={buyForm.customer_name} required
                onChange={e => setBuyForm(f => ({ ...f, customer_name: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                style={{ background: 'var(--black-soft)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              <input type="tel" placeholder="Phone Number" value={buyForm.phone} required
                onChange={e => setBuyForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                style={{ background: 'var(--black-soft)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              <input type="email" placeholder="Email Address" value={buyForm.email} required
                onChange={e => setBuyForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                style={{ background: 'var(--black-soft)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              <textarea rows={2} placeholder="Full Address" value={buyForm.address} required
                onChange={e => setBuyForm(f => ({ ...f, address: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-none"
                style={{ background: 'var(--black-soft)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              {/* Pincode + State — 2 cols */}
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Pincode" value={buyForm.pincode} required
                  onChange={e => setBuyForm(f => ({ ...f, pincode: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                  style={{ background: 'var(--black-soft)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                <input type="text" placeholder="State" value={buyForm.state} required
                  onChange={e => setBuyForm(f => ({ ...f, state: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                  style={{ background: 'var(--black-soft)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              </div>
              {/* District — full width */}
              <input type="text" placeholder="District" value={buyForm.district} required
                onChange={e => setBuyForm(f => ({ ...f, district: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                style={{ background: 'var(--black-soft)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button type="button" onClick={() => setShowBuyModal(false)}
                  className="py-2.5 rounded-lg text-sm font-medium border transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Cancel</button>
                <button type="submit" disabled={ordering}
                  className="py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: '#111' }}>
                  {ordering ? 'Placing...' : 'Place Order (COD)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
