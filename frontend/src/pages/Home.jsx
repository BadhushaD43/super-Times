import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard.jsx';
import { getImage } from '../assets/images.js';
import { API_BASE_URL as API } from '../lib/api.js';
import {
  FaChevronLeft,
  FaChevronRight,
  FaGlasses,
  FaHeadset,
  FaRegClock,
  FaShieldAlt,
  FaShoppingBag,
  FaShoePrints,
  FaSprayCan,
  FaStopwatch,
  FaTruck,
  FaUndo,
} from 'react-icons/fa';

const HERO_BACKGROUNDS = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1541643600914-78b084683702?w=1600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=1600&q=80&auto=format&fit=crop',
];
const HERO_IMAGE_OPACITY = 0.64;
const HERO_FADE_MS = 1200;
const HERO_INTERVAL_MS = 4500;

const CATEGORIES = [
  { name: 'Footwear', icon: FaShoePrints, desc: 'Men, Women & Kids', link: '/products?category=Footwear' },
  { name: 'Sunglasses', icon: FaGlasses, desc: 'Men, Women & Kids', link: '/products?category=Sunglasses' },
  { name: 'Watches', icon: FaStopwatch, desc: 'Luxury & Casual', link: '/products?category=Watches' },
  { name: 'Wall Clocks', icon: FaRegClock, desc: 'Modern & Classic', link: '/products?category=Wall Clocks' },
  { name: 'Perfumes', icon: FaSprayCan, desc: 'Signature scents', link: '/products?category=Perfumes' },
];

const FEATURES = [
  { icon: <FaTruck />, title: 'Free Delivery', desc: 'On orders above Rs. 1999' },
  { icon: <FaShieldAlt />, title: 'Authentic Products', desc: '100% genuine guarantee' },
  { icon: <FaHeadset />, title: '24/7 Support', desc: 'Always here to help' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.2 },
  transition: { duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] },
});

const ProductSlider = ({ products }) => {
  const ref = useRef();
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * 260, behavior: 'smooth' });

  return (
    <div className="relative">
      <button onClick={() => scroll(-1)}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all"
        style={{ background: 'var(--black-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
        <FaChevronLeft className="text-xs" />
      </button>
      <div ref={ref} className="flex gap-5 overflow-x-auto px-1 pb-2" style={{ scrollbarWidth: 'none' }}>
        {products.map(p => (
          <div key={p.id} className="flex-shrink-0" style={{ width: '230px' }}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
      <button onClick={() => scroll(1)}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all"
        style={{ background: 'var(--black-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
        <FaChevronRight className="text-xs" />
      </button>
    </div>
  );
};

const sortLatestProducts = (products) =>
  [...products].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    if (aTime !== bTime) return bTime - aTime;
    return (b.id || 0) - (a.id || 0);
  });

const getProductImageUrl = (product) => {
  const img = product.images?.[0];
  if (!img) return null;
  if (img.startsWith('http')) return img;
  if (img.startsWith('/')) return `${API}${img}`;
  return getImage(img);
};

const LatestProductsOrbit = ({ products }) => {
  const [paused, setPaused] = useState(false);

  return (
    <div className="latest-products-stage">
      <div
        className={`latest-products-orbit ${paused ? 'is-paused' : ''}`}
      >
        {products.map((product, index) => {
          const imageUrl = getProductImageUrl(product);
          return (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="latest-product-orbit-card"
              style={{ '--rotation': `${(360 / products.length) * index}deg` }}
              aria-label={`View ${product.name}`}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
            >
              {[0, 1].map(face => (
                <span key={face} className={`latest-product-orbit-face ${face ? 'is-back' : ''}`}>
                  <span className="latest-product-orbit-media">
                    {imageUrl ? (
                      <>
                        <img
                          src={imageUrl}
                          alt={product.name}
                          onError={e => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }}
                        />
                        <span className="latest-product-orbit-placeholder latest-product-orbit-placeholder-hidden">
                          <FaShoppingBag />
                        </span>
                      </>
                    ) : (
                      <span className="latest-product-orbit-placeholder">
                        <FaShoppingBag />
                      </span>
                    )}
                  </span>
                  <span className="latest-product-orbit-info">
                    <span className="latest-product-orbit-title">{product.name}</span>
                    <span className="latest-product-orbit-price">Rs. {product.price}</span>
                  </span>
                </span>
              ))}
              <span className="latest-product-orbit-edge" aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroBgIndex, setHeroBgIndex] = useState(0);
  const heroBgIndexRef = useRef(0);
  const heroReadyRef = useRef({ 0: true });

  useEffect(() => {
    axios.get(`${API}/products/?limit=100`).then(r => setFeatured(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;

    HERO_BACKGROUNDS.forEach((src, index) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => {
        if (!cancelled) heroReadyRef.current[index] = true;
      };
      image.src = src;
      if (image.complete) heroReadyRef.current[index] = true;
    });

    const interval = setInterval(() => {
      const currentIndex = heroBgIndexRef.current;
      let nextIndex = currentIndex;

      for (let offset = 1; offset <= HERO_BACKGROUNDS.length; offset += 1) {
        const candidate = (currentIndex + offset) % HERO_BACKGROUNDS.length;
        if (heroReadyRef.current[candidate]) {
          nextIndex = candidate;
          break;
        }
      }

      if (nextIndex !== currentIndex) {
        heroBgIndexRef.current = nextIndex;
        setHeroBgIndex(nextIndex);
      }
    }, HERO_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const sortedProducts = sortLatestProducts(featured);
  const latestProducts = sortedProducts.slice(0, 10);
  // Shuffle all products randomly for the "All Products" section
  const shuffled = [...featured].sort(() => Math.random() - 0.5);

  return (
    <div style={{ background: 'var(--black)' }}>
      <section className="hero min-h-screen flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #023047 0%, #052f43 52%, #023047 100%)' }}>
        {HERO_BACKGROUNDS.map((src, index) => (
          <div
            key={src}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${src})`,
              opacity: index === heroBgIndex ? HERO_IMAGE_OPACITY : 0,
              transition: `opacity ${HERO_FADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
              zIndex: index === heroBgIndex ? 1 : 0,
            }}
          />
        ))}
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[rgba(2,48,71,0.78)] via-[rgba(2,48,71,0.48)] to-[rgba(2,48,71,0.22)]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-10 w-full py-0">
          <div className="max-w-2xl text-center md:text-left">
            <motion.span
              className="inline-block text-xs font-bold uppercase tracking-[0.25em] px-3 py-1 rounded-full mb-3 md:mb-4"
              style={{ background: 'rgba(255,183,3,0.16)', color: 'var(--primary)', border: '1px solid rgba(255,183,3,0.35)' }}
              initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}>
              Premium Lifestyle Store
            </motion.span>

            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-3 md:mb-4"
              style={{ color: 'var(--text-primary)' }}
              initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
              Time &amp; Style,{' '}
              <span style={{ color: 'var(--primary)', display: 'block' }}>Redefined.</span>
            </motion.h1>

            <motion.p
              className="text-base md:text-lg leading-relaxed mb-5 md:mb-7 max-w-xl mx-auto md:mx-0"
              style={{ color: 'var(--text-secondary)' }}
              initial={{ opacity: 0, x: -22 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}>
              Discover premium Footwear, Watches, Sunglasses, Wall Clocks &amp; Perfumes, curated for those who value quality and elegance.
            </motion.p>

            <motion.div className="flex flex-wrap gap-4 justify-center md:justify-start"
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/products" className="btn-primary text-base px-8 py-3.5 inline-block rounded-lg">
                  Shop Now
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/about"
                  className="text-base px-8 py-3.5 rounded-lg inline-block font-semibold transition-all"
                  style={{ border: '1px solid var(--primary)', color: 'var(--primary)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#111'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}>
                  Our Story
                </Link>
              </motion.div>
            </motion.div>

            <motion.div className="flex gap-6 md:gap-8 mt-8 md:mt-12 justify-center md:justify-start"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
              {[['10K+', 'Happy Customers'], ['500+', 'Products'], ['50+', 'Years']].map(([val, lbl]) => (
                <div key={lbl}>
                  <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{val}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{lbl}</p>
                </div>
              ))}
            </motion.div>
          </div>

        </div>
      </section>

      <section className="py-10 border-y" style={{ background: 'var(--black-soft)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-wrap justify-center gap-8 md:gap-20 text-center">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} className="flex w-44 flex-col items-center gap-2" {...fadeUp(i * 0.1)}>
                <div className="text-2xl" style={{ color: 'var(--primary)' }}>{f.icon}</div>
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{f.title}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 max-w-7xl mx-auto px-4 md:px-8">
        <motion.h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-10" style={{ color: 'var(--text-primary)' }} {...fadeUp()}>
          Shop by Category
        </motion.h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div key={cat.name}
                className="rounded-lg p-5 text-center cursor-pointer"
                style={{ background: 'var(--black-card)', border: '1px solid var(--border)' }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                whileHover={{ y: -8, boxShadow: '0 8px 30px rgba(255,183,3,0.18)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <Link to={cat.link}>
                  <motion.div
                    className="w-14 h-14 mx-auto mb-3 rounded-lg flex items-center justify-center text-2xl"
                    style={{ background: 'rgba(255,183,3,0.14)', color: 'var(--primary)' }}
                    whileHover={{ scale: 1.12, rotate: 4 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Icon />
                  </motion.div>
                  <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{cat.name}</h3>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{cat.desc}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="py-12 md:py-16" style={{ background: 'var(--black)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12">
          <motion.div className="flex items-center justify-between mb-8" {...fadeUp()}>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--primary)' }}>Latest Additions</p>
              <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>New Products</h2>
            </div>
            <Link to="/products" className="text-sm font-medium hover:underline" style={{ color: 'var(--primary)' }}>View All</Link>
          </motion.div>
          {loading ? (
            <div className="flex gap-5 overflow-hidden">
              {Array(5).fill().map((_, i) => (
                <div key={i} className="flex-shrink-0 rounded-lg animate-pulse" style={{ width: '230px', height: '320px', background: 'var(--black-soft)' }} />
              ))}
            </div>
          ) : latestProducts.length === 0 ? (
            <p className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>No latest products yet.</p>
          ) : (
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.6 }}>
              <LatestProductsOrbit products={latestProducts} />
            </motion.div>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16" style={{ background: 'var(--black-soft)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12">
          <motion.div className="flex items-center justify-between mb-8" {...fadeUp()}>
            <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>All Products</h2>
            <Link to="/products" className="text-sm font-medium hover:underline" style={{ color: 'var(--primary)' }}>View All</Link>
          </motion.div>
          {loading ? (
            <div className="flex gap-5 overflow-hidden">
              {Array(5).fill().map((_, i) => (
                <div key={i} className="flex-shrink-0 rounded-lg animate-pulse" style={{ width: '230px', height: '320px', background: 'var(--black-card)' }} />
              ))}
            </div>
          ) : shuffled.length === 0 ? (
            <p className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>No products yet.</p>
          ) : (
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.6 }}>
              <ProductSlider products={shuffled} />
            </motion.div>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24 relative overflow-hidden" style={{ background: 'var(--black-soft)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,183,3,0.07) 0%, transparent 65%)' }} />
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">

          {/* Heading */}
          <motion.div className="text-center mb-14" {...fadeUp()}>
            <p className="text-xs font-bold uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--primary)' }}>The Super Times Experience</p>
            <h2 className="text-3xl md:text-5xl font-bold mb-5" style={{ color: 'var(--text-primary)' }}>Crafted for Those Who<br /><span style={{ color: 'var(--primary)' }}>Demand the Best</span></h2>
            <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              From the first tick of a watch to the last step in a premium shoe — every product at Super Times is chosen with obsessive attention to quality, style, and value.
            </p>
          </motion.div>

          {/* Two-column feature rows */}
          <div className="space-y-6 mb-14">
            {[
              {
                tag: 'Our Heritage',
                title: 'Over 50 Years of Passion for Premium',
                body: 'Super Times was founded by people who grew up surrounded by fine craftsmanship. For over five decades, our family has been sourcing the world\'s finest watches, footwear, and accessories — long before it was fashionable. That legacy of taste and trust is baked into every product we carry.',
                align: 'left',
                emoji: '🕰️',
              },
              {
                tag: 'Our Promise',
                title: 'Zero Compromise on Authenticity',
                body: 'Every single item on Super Times is 100% genuine, sourced directly from verified manufacturers and authorised distributors. We refuse to stock anything we wouldn\'t proudly wear or gift ourselves. If it doesn\'t meet our standard, it doesn\'t reach your door.',
                align: 'right',
                emoji: '🛡️',
              },
              {
                tag: 'Our People',
                title: 'A Team That Actually Cares',
                body: 'Behind every order is a real person who cares about your experience. Our support team is available around the clock to answer questions, resolve issues, and make sure you\'re completely satisfied — not just with the product, but with every interaction you have with us.',
                align: 'left',
                emoji: '🤝',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className={`flex flex-col ${item.align === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'} gap-6 items-center p-6 md:p-8 rounded-2xl`}
                style={{ background: 'var(--black-card)', border: '1px solid var(--border)' }}
                initial={{ opacity: 0, x: item.align === 'right' ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div className="flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center text-5xl"
                  style={{ background: 'rgba(255,183,3,0.1)', border: '1px solid rgba(255,183,3,0.2)' }}>
                  {item.emoji}
                </div>
                <div className={`flex-1 ${item.align === 'right' ? 'md:text-right' : ''}`}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--primary)' }}>{item.tag}</p>
                  <h3 className="text-xl md:text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                  <p className="text-sm md:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.body}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div className="text-center" {...fadeUp()}>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Trusted by over 10,000 customers across India since 2016.</p>
            <Link to="/about" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="btn-primary px-12 py-3.5 inline-block text-base">Discover Our Story</Link>
          </motion.div>

        </div>
      </section>
    </div>
  );
};

export default Home;
