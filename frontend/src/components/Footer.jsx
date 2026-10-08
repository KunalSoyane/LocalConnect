import { Link } from 'react-router-dom';
import { Zap, Mail, Phone, MapPin, Globe, MessageCircle, Share2, Camera, ArrowRight } from 'lucide-react';
import './Footer.css';

const categories = ['Electrician', 'Plumber', 'Tutor', 'Home Cleaner', 'Mechanic', 'Nurse', 'Carpenter', 'Painter'];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-glow" />
      <div className="container">
        <div className="footer-top">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-icon"><Zap size={20} /></div>
              <span>Local<span className="gradient-text">Connect</span></span>
            </Link>
            <p>Connecting communities with trusted local service providers. Quality service, verified professionals.</p>
            <div className="footer-social">
              {[Globe, MessageCircle, Share2, Camera].map((Icon, i) => (
                <a key={i} href="#" className="social-icon"><Icon size={18} /></a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <nav>
              {['Home', 'Services', 'About', 'Contact'].map(l => (
                <Link key={l} to={`/${l === 'Home' ? '' : l.toLowerCase()}`} className="footer-link">
                  <ArrowRight size={14} /> {l}
                </Link>
              ))}
            </nav>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h4>Top Categories</h4>
            <nav>
              {categories.slice(0, 6).map(cat => (
                <Link key={cat} to={`/services?category=${cat}`} className="footer-link">
                  <ArrowRight size={14} /> {cat}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4>Contact Us</h4>
            <div className="footer-contact">
              <div className="contact-item">
                <MapPin size={16} />
                <span>123 Community Ave, Bangalore, KA 560001</span>
              </div>
              <div className="contact-item">
                <Phone size={16} />
                <a href="tel:+919876543210">+91 98765 43210</a>
              </div>
              <div className="contact-item">
                <Mail size={16} />
                <a href="mailto:support@localconnect.in">support@localconnect.in</a>
              </div>
            </div>

            {/* Newsletter mini */}
            <div className="footer-newsletter">
              <input type="email" placeholder="Your email" className="form-input" style={{fontSize:'0.85rem', padding:'0.5rem 0.875rem'}} />
              <button className="btn btn-primary btn-sm">Subscribe</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} LocalConnect. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
