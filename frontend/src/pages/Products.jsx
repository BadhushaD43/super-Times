import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard.jsx';
import { FaSearch, FaChevronLeft, FaChevronRight, FaTimes, FaLongArrowAltRight } from 'react-icons/fa';
import { API_BASE_URL as API } from '../lib/api.js';

const CATEGORIES = [
  { name: 'Footwear',   sub: ['Men', 'Women', 'Kids'] },
  { name: 'Sunglasses', sub: ['Men', 'Women', 'Kids'] },
  { name: 'Watches',    sub: ['Men', 'Women', 'Kids'] },
  { name: 'Wall Clocks' },
  { name: 'Perfumes' },
];

/* ── Horizontal slider row ── */
const SliderRow = ({ title, products, viewAllLink }) => {
  const ref = useRef();
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * 280, behavior: 'smooth' });

  if (!products.length) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        <div className="flex items-center gap-3">
          <Link to={viewAllLink} className="inline-flex items-center gap-1 text-xs font-medium hover:underline" style={{ color: 'var(--primary)' }}>
            View All <FaLongArrowAltRight />
          </Link>
          <button onClick={() => scroll(-1)} className="p-1.5 rounded-full border transition-colors hover:border-yellow-400" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}><FaChevronLeft className="text-xs" /></button>
          <button onClick={() => scroll(1)}  className="p-1.5 rounded-full border transition-colors hover:border-yellow-400" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}><FaChevronRight className="text-xs" /></button>
        </div>
      </div>
      <div ref={ref} className="flex gap-5 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {products.map(p => (
          <div key={p.id} className="flex-shrink-0" style={{ width: '220px' }}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Main page ── */
const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const activeCategory = searchParams.get('category') || '';
  const activeSub      = searchParams.get('sub') || '';

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/products/?limit=200`)
      .then(r => setAllProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setSearchParams({});
  };

  const clearSearch = () => { setSearch(''); setSearchInput(''); };

  // Filter logic
  const filtered = allProducts.filter(p => {
    if (search) {
      const q = search.toLowerCase();
      return p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.model_number?.toLowerCase().includes(q);
    }
    if (activeCategory) {
      if (p.category?.toLowerCase() !== activeCategory.toLowerCase()) return false;
      if (activeSub && p.subcategory?.toLowerCase() !== activeSub.toLowerCase()) return false;
    }
    return true;
  });

  const isFiltered = search || activeCategory;

  // Group by category for slider view
  const grouped = CATEGORIES.map(cat => ({
    cat,
    products: allProducts.filter(p => p.category === cat.name),
  })).filter(g => g.products.length > 0);

  const btnStyle = (active) => ({
    background: active ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'var(--black-card)',
    color: active ? '#111' : 'var(--text-secondary)',
    border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
    fontWeight: active ? '700' : '500',
  });

  const currentCat = CATEGORIES.find(c => c.name === activeCategory);

  return (
    <div className="min-h-screen pt-24 pb-8 md:pt-28 md:pb-10" style={{ background: 'var(--black)' }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8">

        {/* Page header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Our Products</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Premium quality, curated for you</p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-6 md:mb-8">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-secondary)' }} />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search products, categories, models..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none"
              style={{ background: 'var(--black-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <button type="submit" className="btn-primary px-5 py-2.5 text-sm rounded-xl">Search</button>
          {search && (
            <button type="button" onClick={clearSearch} className="px-3 py-2.5 rounded-xl border text-sm transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              <FaTimes />
            </button>
          )}
        </form>

        {/* Category filter pills */}
        {!search && (
          <div className="flex flex-wrap gap-2 mb-3 md:mb-4 justify-center">
            <button onClick={() => setSearchParams({})} className="px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm transition-all" style={btnStyle(!activeCategory)}>All</button>
            {CATEGORIES.map(cat => (
              <button key={cat.name} onClick={() => setSearchParams({ category: cat.name })} className="px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm transition-all" style={btnStyle(activeCategory === cat.name && !activeSub)}>
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Subcategory pills */}
        {!search && currentCat?.sub && (
          <div className="flex flex-wrap gap-2 mb-6 md:mb-8 justify-center">
            <button onClick={() => setSearchParams({ category: activeCategory })} className="px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm transition-all" style={btnStyle(!activeSub)}>All {activeCategory}</button>
            {currentCat.sub.map(sub => (
              <button key={sub} onClick={() => setSearchParams({ category: activeCategory, sub })} className="px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm transition-all" style={btnStyle(activeSub === sub)}>
                {sub}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {Array(8).fill().map((_, i) => <div key={i} className="rounded-xl h-60 md:h-72 animate-pulse" style={{ background: 'var(--black-card)' }} />)}
          </div>
        ) : isFiltered ? (
          /* Filtered / search results — grid */
          <>
            {search && (
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<span style={{ color: 'var(--primary)' }}>{search}</span>"
              </p>
            )}
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'rgba(255,183,3,0.14)', color: 'var(--primary)' }}>
                  <FaSearch />
                </div>
                <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No products found</p>
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Try a different search term or browse by category</p>
                <button onClick={clearSearch} className="btn-primary px-6 py-2 text-sm">Clear Search</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {filtered.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </>
        ) : (
          /* Default — sliders per category */
          grouped.map(({ cat, products }) => (
            <SliderRow
              key={cat.name}
              title={cat.name}
              products={products}
              viewAllLink={`/products?category=${cat.name}`}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Products;
