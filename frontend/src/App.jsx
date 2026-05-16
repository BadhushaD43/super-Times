import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import './App.css';
import CustomCursor from './components/CustomCursor.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminLayout from './pages/AdminLayout.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminOrders from './pages/AdminOrders.jsx';
import AdminProducts from './pages/AdminProducts.jsx';
import AdminGallery from './pages/AdminGallery.jsx';
import AdminContacts from './pages/AdminContacts.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Footer from './components/Footer.jsx';
import { FaArrowUp } from 'react-icons/fa';

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return visible ? (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      style={{
        position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
        width: '44px', height: '44px', borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
        color: '#111', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(255,183,3,0.4)',
        transition: 'transform 0.2s ease, opacity 0.2s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px) scale(1.08)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
    >
      <FaArrowUp />
    </button>
  ) : null;
};

const PublicLayout = () => (
  <>
    <Navbar />
    <Outlet />
    <Footer />
    <ScrollToTop />
  </>
);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CustomCursor />
        <Router>
            <Routes>
              {/* Public pages */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
              </Route>

              <Route path="/login" element={<AdminLogin />} />

              {/* Admin pages — AdminLayout has its own navbar */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="gallery" element={<AdminGallery />} />
                <Route path="contacts" element={<AdminContacts />} />
              </Route>

              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center text-2xl font-bold" style={{ color: 'var(--text-secondary)' }}>
                  404 — Page Not Found
                </div>
              } />
            </Routes>
          </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
