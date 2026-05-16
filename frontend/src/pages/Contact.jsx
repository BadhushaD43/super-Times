import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { apiUrl } from '../lib/api.js';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(apiUrl('/contacts/'), form);
      setStatus('success');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: 'var(--black-soft)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    borderRadius: '8px',
    padding: '12px',
    width: '100%',
    outline: 'none',
  };

  const info = [
    { icon: <FaPhone />, label: 'Phone', value: '+91 98765 43210' },
    { icon: <FaEnvelope />, label: 'Email', value: 'support@eshop.com' },
    { icon: <FaMapMarkerAlt />, label: 'Address', value: '123 Market Street, Mumbai, India' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--black)' }}>

      <motion.section className="hero min-h-screen flex flex-col items-center justify-center text-center px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Contact <span style={{ color: 'var(--primary)' }}>Us</span></h1>
        <p className="text-base md:text-xl" style={{ color: 'var(--text-secondary)' }}>We'd love to hear from you. Reach out anytime!</p>
      </motion.section>

      <section className="py-10 md:py-16 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">

          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6" style={{ color: 'var(--text-primary)' }}>Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Your Name" required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <input type="email" placeholder="Email Address" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <input type="tel" placeholder="Phone Number" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <textarea placeholder="Your Message" required rows={5} value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                style={{ ...inputStyle, resize: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              {status === 'success' && <p className="text-green-400 font-medium">Message sent! We'll get back to you soon.</p>}
              {status === 'error' && <p className="text-red-400 font-medium">Something went wrong. Please try again.</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-lg">
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6" style={{ color: 'var(--text-primary)' }}>Get in Touch</h2>
            <div className="space-y-6 mb-10">
              {info.map(item => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-black"
                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                    <p style={{ color: 'var(--text-secondary)' }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl overflow-hidden h-56 flex items-center justify-center"
              style={{ background: 'var(--black-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <span>Map placeholder</span>
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
};

export default Contact;
