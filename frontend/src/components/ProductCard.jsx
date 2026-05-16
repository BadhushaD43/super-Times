import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingBag, FaStar } from 'react-icons/fa';
import { getImage } from '../assets/images.js';
import { apiUrl } from '../lib/api.js';

const resolveImg = (src) => {
  if (!src) return null;
  if (src.startsWith('http')) return src;
  if (src.startsWith('/')) return apiUrl(src);
  return getImage(src);
};

const ProductCard = ({ product }) => {
  const rating = Math.round(product.rating || 4);
  const imgSrc = resolveImg(product.images?.[0]);

  return (
    <div className="product-card flex flex-col h-full">
      <Link to={`/product/${product.id}`} className="product-card-media block overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={e => { e.target.style.background = 'var(--black-soft)'; e.target.src = ''; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl" style={{ background: 'var(--black-soft)', color: 'var(--primary)' }}>
            <FaShoppingBag />
          </div>
        )}
      </Link>
      <div className="p-4 flex flex-col flex-1 space-y-2">
        <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--primary)' }}>{product.category}</p>
        <h3 className="product-card-title font-bold text-sm md:text-base leading-snug" style={{ color: 'var(--text-primary)' }}>{product.name}</h3>
        {product.model_number && (
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Model: {product.model_number}</p>
        )}
        <div className="flex items-center gap-1">
          {Array(5).fill().map((_, i) => (
            <FaStar key={i} className="text-xs" style={{ color: i < rating ? 'var(--primary)' : 'var(--border)' }} />
          ))}
          <span className="text-xs ml-1" style={{ color: 'var(--text-secondary)' }}>({product.total_reviews || 0})</span>
        </div>
        <p className="text-xl font-bold" style={{ color: 'var(--gold-light)' }}>Rs. {product.price}</p>
        <div className="mt-auto pt-2">
          <Link
            to={`/product/${product.id}`}
            className="block text-center text-sm py-2 rounded-lg border font-medium transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
