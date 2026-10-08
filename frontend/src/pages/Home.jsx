import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, ArrowRight, Star, Shield, Clock, CheckCircle, Zap, Users, Briefcase, TrendingUp, Sparkles } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import AIRecommendModal from '../components/AIRecommendModal';
import './Home.css';

// ES6 - Service categories array (Experiment 2)
const CATEGORIES = [
  { name: 'Electrician', icon: '⚡', color: '#fbbf24' },
  { name: 'Plumber', icon: '🔧', color: '#06b6d4' },
  { name: 'Tutor', icon: '📚', color: '#8b5cf6' },
  { name: 'Home Cleaner', icon: '🏠', color: '#10b981' },
  { name: 'Mechanic', icon: '🔩', color: '#f97316' },
  { name: 'Nurse', icon: '💊', color: '#ec4899' },
  { name: 'Carpenter', icon: '🪵', color: '#84cc16' },
  { name: 'Painter', icon: '🎨', color: '#f43f5e' },
];

const STATS = [
  { icon: Users, value: '10,000+', label: 'Happy Customers' },
  { icon: Briefcase, value: '2,500+', label: 'Service Providers' },
  { icon: CheckCircle, value: '50,000+', label: 'Bookings Completed' },
  { icon: Star, value: '4.8', label: 'Average Rating' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Search Services', desc: 'Browse or search for local service providers by category or location.', icon: Search },
  { step: '02', title: 'Book Instantly', desc: 'Choose your provider and schedule a convenient appointment time.', icon: Clock },
  { step: '03', title: 'Get It Done', desc: 'Our verified professionals arrive and complete the job to your satisfaction.', icon: CheckCircle },
];

export default function Home() {
  // Experiment 2: useState, useEffect, async/await
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredServices, setFeaturedServices] = useState([]);
  const [showAIModal, setShowAIModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Async/Await (Experiment 2)
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await axios.get('/api/services?limit=6&sort=rating');
        setFeaturedServices(data.data);
      } catch (err) {
        console.error('Failed to fetch featured services');
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // ES6 Arrow function + template literal for search (Experiment 2)
  const handleSearch = (e) => {
    e.preventDefault();
    window.location.href = `/services?search=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="home">
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient" />
          <div className="hero-grid" />
        </div>
        <div className="container hero-content">
          <div className="hero-tag animate-fade-in-up">
            <Zap size={14} /> Trusted by 10,000+ Customers
          </div>
          <h1 className="hero-title animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Find Trusted Local<br />
            <span className="gradient-text">Service Providers</span><br />
            Near You
          </h1>
          <p className="hero-subtitle animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Book verified electricians, plumbers, tutors, cleaners, and more in minutes.
            Quality service guaranteed, right at your doorstep.
          </p>

          {/* Search Bar (Experiment 2: filter/search) */}
          <div className="hero-search-wrapper animate-fade-in-up" style={{ animationDelay: '0.3s', display: 'flex', gap: '0.75rem', width: '100%', maxWidth: '700px', justifyContent: 'center' }}>
            <form className="hero-search" style={{ flex: 1, margin: 0, maxWidth: 'none' }} onSubmit={handleSearch}>
              <div className="search-icon"><Search size={20} /></div>
              <input
                id="hero-search-input"
                type="text"
                className="search-input"
                placeholder="Search electrician, plumber, tutor…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-primary search-btn">
                Search
              </button>
            </form>

          </div>

          {/* Quick Category Chips */}
          <div className="hero-categories animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <span className="popular-label">Popular:</span>
            {/* ES6 Filter demo - show first 4 categories */}
            {CATEGORIES.filter((_, i) => i < 4).map(cat => (
              <Link key={cat.name} to={`/services?category=${cat.name}`} className="category-chip">
                {cat.icon} {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────── */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="stat-card">
                <div className="stat-icon"><Icon size={22} /></div>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ─────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Browse by Category</div>
            <h2 className="section-title">What Service Do You Need?</h2>
            <p className="section-subtitle">From home repairs to education, find any service in your locality.</p>
          </div>
          <div className="categories-grid">
            {/* ES6 Array.map with template literal (Experiment 2) */}
            {CATEGORIES.map(({ name, icon, color }) => (
              <Link key={name} to={`/services?category=${name}`} className="category-card">
                <div className="category-icon" style={{ background: `${color}18`, color }}>
                  <span>{icon}</span>
                </div>
                <h4>{name}</h4>
                <p>Find local {name.toLowerCase()}s</p>
                <div className="category-arrow"><ArrowRight size={16} /></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Services ──────────────────────────────── */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Top Rated</div>
            <h2 className="section-title">Featured Services</h2>
            <p className="section-subtitle">Handpicked top-rated providers trusted by your community.</p>
          </div>

          {loading ? (
            <div className="grid grid-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '340px' }} />
              ))}
            </div>
          ) : featuredServices.length > 0 ? (
            <div className="grid grid-3">
              {featuredServices.map(s => <ServiceCard key={s._id} service={s} />)}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p>No services yet — <Link to="/register">register as a provider</Link> to be the first!</p>
            </div>
          )}

          <div className="section-cta">
            <Link to="/services" className="btn btn-outline btn-lg">
              View All Services <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Simple Process</div>
            <h2 className="section-title">How LocalConnect Works</h2>
          </div>
          <div className="how-it-works">
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }, i) => (
              <div key={step} className="how-step">
                <div className="step-number">{step}</div>
                <div className="step-icon"><Icon size={28} /></div>
                <h3>{title}</h3>
                <p>{desc}</p>
                {i < HOW_IT_WORKS.length - 1 && <div className="step-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────── */}
      <section className="cta-section">
        <div className="cta-glow" />
        <div className="container cta-content">
          <div>
            <h2>Ready to Join LocalConnect?</h2>
            <p>Register as a service provider and grow your business with verified clients.</p>
          </div>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started <ArrowRight size={18} />
            </Link>
            <Link to="/services" className="btn btn-secondary btn-lg">
              Browse Services
            </Link>
          </div>
        </div>
      </section>
      {/* AI Smart Search Modal */}
      {showAIModal && <AIRecommendModal onClose={() => setShowAIModal(false)} />}
    </div>
  );
}
