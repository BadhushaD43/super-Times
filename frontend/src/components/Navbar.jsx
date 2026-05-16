import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  FaBars,
  FaChevronDown,
  FaChild,
  FaFemale,
  FaGlasses,
  FaLayerGroup,
  FaLongArrowAltRight,
  FaMale,
  FaRegClock,
  FaShoePrints,
  FaSprayCan,
  FaStopwatch,
  FaTimes,
} from 'react-icons/fa';

const CATEGORIES = [
  { name: 'Footwear', icon: FaShoePrints, desc: 'Everyday and statement pairs', sub: ['Men', 'Women', 'Kids'] },
  { name: 'Sunglasses', icon: FaGlasses, desc: 'Sharp frames for every look', sub: ['Men', 'Women', 'Kids'] },
  { name: 'Watches', icon: FaStopwatch, desc: 'Classic and modern timepieces', sub: ['Men', 'Women', 'Kids'] },
  { name: 'Wall Clocks', icon: FaRegClock, desc: 'Modern clocks for refined spaces' },
  { name: 'Perfumes', icon: FaSprayCan, desc: 'Signature scents and daily favourites' },
];

const SUBCATEGORY_ICONS = {
  Men: FaMale,
  Women: FaFemale,
  Kids: FaChild,
};

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMobileCat, setOpenMobileCat] = useState(null);
  const dropRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const close = () => {
    setDropOpen(false);
    setMobileOpen(false);
    setOpenMobileCat(null);
  };

  const toggleMobileCat = (name) => setOpenMobileCat(o => o === name ? null : name);

  const navLinkCls = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-yellow-400' : 'text-[var(--text-secondary)] hover:text-yellow-400'}`;

  return (
    <>
      <nav className="public-site-nav absolute inset-x-0 top-0 z-50" style={{ background: 'transparent', borderBottom: 'none', boxShadow: 'none' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold tracking-wider flex-shrink-0 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
            <img src="/super-times-logo.png" alt="Super Times logo" className="w-12 h-12 object-contain" />
            Super Times
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/" end className={navLinkCls}>Home</NavLink>
            <NavLink to="/about" className={navLinkCls}>About</NavLink>

            <div
              className="relative"
              ref={dropRef}
              onMouseEnter={() => setDropOpen(true)}
              onMouseLeave={() => setDropOpen(false)}
            >
              <button
                onClick={() => setDropOpen(o => !o)}
                className="flex items-center gap-1.5 text-sm font-medium transition-colors py-5"
                style={{ color: dropOpen ? 'var(--primary)' : 'var(--text-secondary)' }}
              >
                Products
                <FaChevronDown className={`text-xs transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropOpen && (
                <div
                  className="product-dropdown absolute top-full left-0 rounded-lg shadow-2xl z-50"
                >
                  <div className="p-2">
                    {CATEGORIES.map(cat => {
                      const Icon = cat.icon;
                      return (
                        <div key={cat.name} className="product-dropdown-row">
                          <Link
                            to={`/products?category=${cat.name}`}
                            onClick={close}
                            className="product-dropdown-link"
                          >
                            <span className="product-dropdown-icon"><Icon /></span>
                            <span className="flex-1">
                              <span className="block text-sm font-bold">{cat.name}</span>
                              <span className="block text-xs">{cat.desc}</span>
                            </span>
                            {cat.sub && <FaChevronDown className="-rotate-90 text-xs" />}
                          </Link>

                          {cat.sub && (
                            <div className="product-submenu">
                              {cat.sub.map(sub => {
                                const SubIcon = SUBCATEGORY_ICONS[sub] || FaLayerGroup;
                                return (
                                  <Link
                                    key={sub}
                                    to={`/products?category=${cat.name}&sub=${sub}`}
                                    onClick={close}
                                    className="product-submenu-link"
                                  >
                                    <SubIcon className="text-xs" /> {sub}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <div className="pt-2 mt-2" style={{ borderTop: '1px solid var(--border)' }}>
                      <Link
                        to="/products"
                        onClick={close}
                        className="inline-flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-all"
                        style={{ background: 'var(--primary)', color: '#111' }}
                      >
                        All Products <FaLongArrowAltRight />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <NavLink to="/contact" className={navLinkCls}>Contact</NavLink>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/admin" className="btn-primary px-4 py-2 text-sm">Admin</Link>
                <button onClick={() => { logout(); navigate('/'); }} className="text-sm px-3 py-2 rounded-lg border transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  Logout
                </button>
              </div>
            )}
            <button className="md:hidden p-2 rounded-lg" style={{ color: 'var(--text-secondary)' }} onClick={() => setMobileOpen(o => !o)}>
              {mobileOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={close} />

          <div className="relative w-80 max-w-full h-full overflow-y-auto flex flex-col" style={{ background: 'var(--black-soft)', borderRight: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <Link to="/" onClick={close} className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                <img src="/super-times-logo.png" alt="Super Times logo" className="w-10 h-10 object-contain" /> Super Times
              </Link>
              <button onClick={close} className="p-2 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                <FaTimes />
              </button>
            </div>

            <div className="flex-1 px-5 py-4 space-y-1">
              {[{ to: '/', label: 'Home' }, { to: '/about', label: 'About' }, { to: '/contact', label: 'Contact' }].map(l => (
                <Link key={l.to} to={l.to} onClick={close}
                  className="block py-3 text-sm font-medium border-b transition-colors hover:text-yellow-400"
                  style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
                  {l.label}
                </Link>
              ))}

              <div className="pt-3">
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--primary)' }}>Products</p>
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <div key={cat.name} className="mb-1">
                      {cat.sub ? (
                        <>
                          <button
                            onClick={() => toggleMobileCat(cat.name)}
                            className="w-full flex items-center justify-between py-2.5 text-sm font-semibold border-b transition-colors hover:text-yellow-400"
                            style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}>
                            <span className="flex items-center gap-2">
                              <Icon style={{ color: 'var(--primary)' }} /> {cat.name}
                            </span>
                            <FaChevronDown className={`text-xs transition-transform duration-200 ${openMobileCat === cat.name ? 'rotate-180' : ''}`} style={{ color: 'var(--primary)' }} />
                          </button>
                          {openMobileCat === cat.name && (
                            <div className="py-1 space-y-0" style={{ borderBottom: '1px solid var(--border)' }}>
                              <Link to={`/products?category=${cat.name}`} onClick={close}
                                className="block px-3 py-2 text-sm font-semibold transition-colors hover:text-yellow-400"
                                style={{ color: 'var(--primary)' }}>
                                All {cat.name}
                              </Link>
                              {cat.sub.map(sub => {
                                const SubIcon = SUBCATEGORY_ICONS[sub] || FaLayerGroup;
                                return (
                                  <Link key={sub} to={`/products?category=${cat.name}&sub=${sub}`} onClick={close}
                                    className="flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:text-yellow-400"
                                    style={{ color: 'var(--text-secondary)' }}>
                                    <SubIcon className="text-xs" /> {cat.name} / {sub}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </>
                      ) : (
                        <Link to={`/products?category=${cat.name}`} onClick={close}
                          className="flex items-center gap-2 py-2.5 text-sm font-semibold border-b transition-colors hover:text-yellow-400"
                          style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}>
                          <Icon style={{ color: 'var(--primary)' }} /> {cat.name}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {isAuthenticated && (
              <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="space-y-2">
                  <Link to="/admin" onClick={close} className="block btn-primary text-center py-2 text-sm">Admin Panel</Link>
                  <button onClick={() => { logout(); close(); navigate('/'); }} className="block w-full text-center py-2 text-sm rounded-lg border transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Logout</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
