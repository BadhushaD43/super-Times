import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { apiUrl } from '../lib/api.js';

const About = () => {
  const [gallery, setGallery] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    axios.get(apiUrl('/admin/gallery/'))
      .then(res => setGallery([...res.data].reverse()))
      .catch(() => {});
  }, []);

  const openLightbox = (i) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prev = (e) => { e.stopPropagation(); setLightboxIndex(i => (i - 1 + gallery.length) % gallery.length); };
  const next = (e) => { e.stopPropagation(); setLightboxIndex(i => (i + 1) % gallery.length); };

  const stats = [
    { label: 'Happy Customers', value: '10,000+' },
    { label: 'Products', value: '500+' },
    { label: 'Years in Business', value: '50+' },
    { label: 'Cities Served', value: '50+' },
  ];

  const founders = [
    { name: 'Nowshath', role: 'Co-Founder & CEO', bio: 'Nowshath has 50+ years of experience in luxury retail. His passion for premium timepieces and footwear inspired the creation of Super Times.', avatar: 'NS' },
    { name: 'Sheik Nizhar', role: 'Co-Founder & COO', bio: 'Nizhar brings deep expertise in supply chain and customer experience, ensuring every order reaches you with care and speed.', avatar: 'SN' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--black)' }}>

      <motion.section className="hero min-h-screen flex items-center px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
        <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col md:flex-row gap-10 md:gap-16 items-center justify-center py-16">
          <div className="flex justify-center md:justify-start flex-shrink-0">
            <img
              src="/super-times-logo.png"
              alt="Super Times Watches and Footwear logo"
              className="w-56 sm:w-72 md:w-80 object-contain"
            />
          </div>
          <div className="text-center md:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--primary)' }}>Our Story</p>
            <h1 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>About <span style={{ color: 'var(--primary)' }}>Super Times</span></h1>
            <p className="text-base md:text-lg leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
              We curate the finest Footwear, Watches, Wall Clocks &amp; Perfumes — bringing luxury to your doorstep since 2016.
            </p>
            <p className="text-sm md:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Located in the heart of the city, Super Times is your one-stop destination for premium lifestyle accessories — trusted by over 10,000 happy customers across India.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Our Story */}
      <section className="py-20 md:py-28" style={{ background: 'var(--black-soft)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--primary)' }}>Who We Are</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>Our History</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="p-6 md:p-8 rounded-2xl" style={{ background: 'var(--black-card)', border: '1px solid var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4" style={{ background: 'rgba(251,176,59,0.15)', color: 'var(--primary)' }}>🏪</div>
              <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>How It Started</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Super Times was born from a simple belief — everyone deserves access to premium lifestyle products without compromise. What started as a small curated collection in 2016 has grown into a trusted destination for thousands of customers across India.
              </p>
            </div>
            <div className="p-6 md:p-8 rounded-2xl" style={{ background: 'var(--black-card)', border: '1px solid var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4" style={{ background: 'rgba(251,176,59,0.15)', color: 'var(--primary)' }}>🤝</div>
              <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Our Promise</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                We partner directly with manufacturers and artisans to bring you authentic products at fair prices. Every item in our catalog is hand-picked for quality, design, and durability — because you deserve nothing less.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12" style={{ background: 'var(--black-soft)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(s => (
              <motion.div key={s.label} initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }}>
                <div className="text-4xl font-bold mb-2" style={{ color: 'var(--primary)' }}>{s.value}</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="py-10 md:py-16 container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12" style={{ color: 'var(--text-primary)' }}>Meet the Founders</h2>
        <div className="grid sm:grid-cols-2 gap-6 md:gap-10 max-w-4xl mx-auto">
          {founders.map(f => (
            <motion.div key={f.name} className="flex flex-col sm:flex-row gap-4 md:gap-6 items-start p-4 md:p-6 rounded-2xl"
              style={{ background: 'var(--black-card)', border: '1px solid var(--border)' }}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-black text-2xl font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                {f.avatar}
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{f.name}</h3>
                <p className="text-sm mb-2" style={{ color: 'var(--primary)' }}>{f.role}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.bio}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="py-10 md:py-16" style={{ background: 'var(--black-soft)' }}>
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12" style={{ color: 'var(--text-primary)' }}>Our Gallery</h2>
          {gallery.length === 0 ? (
            <p className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>No gallery photos yet. Admin can upload photos from the admin panel.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {gallery.slice(0, 8).map((img, i) => (
                <motion.div key={img.filename} className="overflow-hidden rounded-xl cursor-pointer"
                  style={{ border: '1px solid var(--border)' }}
                  initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }} onClick={() => openLightbox(i)}
                >
                  <img src={apiUrl(img.url)} alt={img.filename}
                    className="w-full h-48 object-cover hover:scale-110 transition-transform duration-300" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {lightboxIndex !== null && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={closeLightbox}>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white text-xl z-10" style={{ background: 'rgba(255,255,255,0.15)' }}>&#8249;</button>
          <img src={apiUrl(gallery[lightboxIndex].url)} alt=""
            className="max-w-full max-h-[90vh] rounded-xl object-contain" onClick={e => e.stopPropagation()} />
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white text-xl z-10" style={{ background: 'rgba(255,255,255,0.15)' }}>&#8250;</button>
          <button onClick={closeLightbox} className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-white text-lg" style={{ background: 'rgba(255,255,255,0.15)' }}>&#10005;</button>
          <p className="absolute bottom-4 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{lightboxIndex + 1} / {gallery.length}</p>
        </div>
      )}
    </div>
  );
};

export default About;
