import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaFacebookF, FaTwitter, FaYoutube, FaWhatsapp, FaMapMarkerAlt, FaPhone, FaEnvelope, FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer style={{ background: 'var(--black-soft)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">

        {/* Brand */}
        <div>
          <Link to="/" className="text-2xl font-bold tracking-wider flex items-center gap-2" style={{ color: 'var(--primary)' }}>
            <img src="/super-times-logo.png" alt="Super Times logo" className="w-16 h-16 object-contain" />
            Super Times
          </Link>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Premium Footwear, Watches, Sunglasses, Wall Clocks & Perfumes — crafted for those who value quality since 2016.
          </p>
          {/* Social */}
          <div className="flex gap-3 mt-5">
            {[
              { icon: <FaInstagram />, href: 'https://instagram.com', label: 'Instagram' },
              { icon: <FaFacebookF />, href: 'https://facebook.com', label: 'Facebook' },
              { icon: <FaTwitter />, href: 'https://twitter.com', label: 'Twitter' },
              { icon: <FaYoutube />, href: 'https://youtube.com', label: 'YouTube' },
              { icon: <FaWhatsapp />, href: 'https://wa.me/919876543210', label: 'WhatsApp' },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all hover:scale-110"
                style={{ background: 'var(--black-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--primary)' }}>Quick Links</h3>
          <ul className="space-y-2">
            {[
              { to: '/', label: 'Home' },
              { to: '/about', label: 'About Us' },
              { to: '/products', label: 'All Products' },
              { to: '/contact', label: 'Contact Us' },
            ].map(l => (
              <li key={l.to}>
                <Link to={l.to} className="text-sm transition-colors hover:text-yellow-400" style={{ color: 'var(--text-secondary)' }}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact / Location */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--primary)' }}>Find Us</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <FaMapMarkerAlt className="mt-0.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                123 Market Street, Bandra West,<br />Mumbai — 400050, India
              </span>
            </li>
            <li className="flex items-center gap-3">
              <FaPhone className="flex-shrink-0" style={{ color: 'var(--primary)' }} />
              <a href="tel:+919876543210" className="text-sm transition-colors hover:text-yellow-400" style={{ color: 'var(--text-secondary)' }}>
                +91 98765 43210
              </a>
            </li>
            <li className="flex items-center gap-3">
              <FaEnvelope className="flex-shrink-0" style={{ color: 'var(--primary)' }} />
              <a href="mailto:support@eshop.com" className="text-sm transition-colors hover:text-yellow-400" style={{ color: 'var(--text-secondary)' }}>
                support@eshop.com
              </a>
            </li>
          </ul>

          {/* Embedded map placeholder styled nicely */}
          <div className="mt-5 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', height: '100px', background: 'var(--black-card)' }}>
            <iframe
              title="Store Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.6!2d72.8296!3d19.0596!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDAzJzM0LjYiTiA3MsKwNDknNDYuNiJF!5e0!3m2!1sen!2sin!4v1"
              width="100%" height="100%" style={{ border: 0 }}
              allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t py-4 px-4 text-center" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          © {new Date().getFullYear()} E-Shop. All rights reserved. &nbsp;·&nbsp;
          <span className="inline-flex items-center gap-1" style={{ color: 'var(--primary)' }}>Made with <FaHeart className="text-[10px]" /> in India</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
