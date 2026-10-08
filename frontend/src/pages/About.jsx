import { Users, Shield, Award, MapPin } from 'lucide-react';
import './About.css';

export default function About() {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container text-center">
          <div className="section-tag animate-fade-in-up">Our Story</div>
          <h1 className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>Empowering Local Communities</h1>
          <p className="about-hero-subtitle animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            LocalConnect bridges the gap between skilled professionals and people who need them.
            We believe in building trust, transparency, and opportunity in every neighborhood.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div className="about-card card">
              <div className="about-icon"><Users size={32} /></div>
              <h3>Our Mission</h3>
              <p>To provide a reliable, easy-to-use platform where users can instantly find and book verified local service providers, fostering community growth and economic empowerment.</p>
            </div>
            <div className="about-card card">
              <div className="about-icon"><Shield size={32} /></div>
              <h3>Our Vision</h3>
              <p>We envision a world where finding trusted help is seamless, and local professionals have the tools they need to thrive and manage their businesses effectively.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose LocalConnect?</h2>
            <p className="section-subtitle">Our platform is built on core values that ensure the best experience for both customers and service providers.</p>
          </div>
          <div className="values-grid">
            <div className="value-item">
              <div className="value-icon"><Award size={24} /></div>
              <h4>Quality Guaranteed</h4>
              <p>Every provider is vetted, and our community-driven review system ensures top-notch service quality.</p>
            </div>
            <div className="value-item">
              <div className="value-icon"><Shield size={24} /></div>
              <h4>Trust & Security</h4>
              <p>Verified profiles, secure data handling, and transparent pricing give you peace of mind.</p>
            </div>
            <div className="value-item">
              <div className="value-icon"><MapPin size={24} /></div>
              <h4>Hyper-Local</h4>
              <p>We focus on your neighborhood, meaning faster response times and supporting your local economy.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
