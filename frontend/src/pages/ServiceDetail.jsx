import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Star, MapPin, CheckCircle, Phone, Calendar, Clock, MessageCircle, X, Loader, Copy, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './ServiceDetail.css';

// ES6 arrow function + template literal (Experiment 2)
const StarRating = ({ rating }) =>
  Array.from({ length: 5 }, (_, i) => (
    <Star key={i} size={16} fill={i < Math.round(rating) ? '#fbbf24' : 'transparent'} color={i < Math.round(rating) ? '#fbbf24' : '#5b5c70'} />
  ));

// Call Provider Modal Component
const CallModal = ({ provider, serviceTitle, onClose }) => {
  const phone = provider?.phone || '9876543210';

  const copyPhone = () => {
    navigator.clipboard.writeText(phone);
    toast.success('📋 Phone number copied to clipboard!');
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box booking-modal">
        <div className="modal-header">
          <h3>Contact Service Provider</h3>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="booking-service-info">
          <div className="provider-avatar-lg" style={{ width: 44, height: 44, fontSize: '1rem' }}>
            {provider?.avatar ? <img src={provider.avatar} alt={provider.name} /> : provider?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <strong>{provider?.name || 'Service Provider'}</strong>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{serviceTitle}</div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Phone Number</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-400)', letterSpacing: '0.05em' }}>
            {phone}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-lg" onClick={copyPhone}>
            <Copy size={16} /> Copy Number
          </button>
          <a href={`tel:${phone}`} className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
            <Phone size={16} /> Call Now
          </a>
        </div>
      </div>
    </div>
  );
};

// Booking Form Modal (Experiment 2: Popup Booking Confirmation)
const BookingModal = ({ service, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({ scheduledDate: '', scheduledTime: '', street: '', city: user?.address?.city || '', state: '', pincode: '', notes: '' });
  const [loading, setLoading] = useState(false);

  // Async/Await booking submit (Experiment 2)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.scheduledDate || !form.scheduledTime || !form.city) {
      return toast.error('Please fill in date, time and city');
    }
    setLoading(true);
    try {
      const { data } = await axios.post('/api/bookings', {
        serviceId: service._id,
        scheduledDate: form.scheduledDate,
        scheduledTime: form.scheduledTime,
        address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode },
        notes: form.notes,
      });
      toast.success('🎉 Booking confirmed! Provider will contact you shortly.');
      onSuccess(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box booking-modal">
        <div className="modal-header">
          <h3>Book Service</h3>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="booking-service-info">
          <span className="badge badge-primary">{service.category}</span>
          <strong>{service.title}</strong>
          <span className="booking-price">₹{service.price.toLocaleString()} {service.priceType === 'hourly' ? '/hr' : ''}</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="booking-date"><Calendar size={14} /> Date</label>
              <input id="booking-date" type="date" className="form-input" min={today} value={form.scheduledDate} onChange={e => setForm(p => ({ ...p, scheduledDate: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="booking-time"><Clock size={14} /> Time</label>
              <input id="booking-time" type="time" className="form-input" value={form.scheduledTime} onChange={e => setForm(p => ({ ...p, scheduledTime: e.target.value }))} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Street Address</label>
            <input id="booking-street" type="text" className="form-input" placeholder="123 Main St" value={form.street} onChange={e => setForm(p => ({ ...p, street: e.target.value }))} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">City *</label>
              <input id="booking-city" type="text" className="form-input" placeholder="City" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input id="booking-pincode" type="text" className="form-input" placeholder="560001" value={form.pincode} onChange={e => setForm(p => ({ ...p, pincode: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label"><MessageCircle size={14} /> Notes (optional)</label>
            <textarea id="booking-notes" className="form-input" rows={3} placeholder="Any special instructions..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <><Loader size={16} className="spin" /> Booking...</> : '✓ Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [bookedBooking, setBookedBooking] = useState(null);

  useEffect(() => {
    // Async/Await (Experiment 2)
    const load = async () => {
      try {
        const [svcRes, revRes] = await Promise.all([
          axios.get(`/api/services/${id}`),
          axios.get(`/api/reviews?service=${id}&limit=10`),
        ]);
        setService(svcRes.data.data);
        setReviews(revRes.data.data);
      } catch {
        toast.error('Service not found');
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  // Check ?book=true parameter when service loads
  useEffect(() => {
    if (service && searchParams.get('book') === 'true') {
      if (user && user.role === 'user') {
        setShowBooking(true);
      } else if (!user) {
        toast('Please log in to complete your booking 🔐', { icon: 'ℹ️' });
      }
    }
  }, [service, searchParams, user]);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!service) return null;

  const { title, description, category, price, priceType, rating, totalReviews, provider, location, images } = service;

  const handleBookNow = () => {
    if (!user) {
      toast.error('Please login to book services');
      const target = `/services/${id}?book=true`;
      navigate(`/login?redirect=${encodeURIComponent(target)}`);
      return;
    }
    if (user.role !== 'user') {
      toast.error('Only customer accounts can book services');
      return;
    }
    setShowBooking(true);
  };

  return (
    <div className="service-detail-page">
      <div className="container">
        <div className="service-detail-grid">
          {/* Left Content */}
          <div className="service-detail-content">
            {/* Image */}
            <div className="service-detail-image">
              <img
                src={images?.[0] || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(category)}`}
                alt={title}
              />
              <span className="service-badge">{category}</span>
            </div>

            <div className="detail-header">
              <h1>{title}</h1>
              <div className="detail-meta">
                <div className="detail-rating">
                  <div className="stars"><StarRating rating={rating} /></div>
                  <span>{rating > 0 ? rating.toFixed(1) : 'New'}</span>
                  {totalReviews > 0 && <span className="review-count">({totalReviews} reviews)</span>}
                </div>
                {location?.city && (
                  <div className="detail-location"><MapPin size={14} /> {location.city}{location.state ? `, ${location.state}` : ''}</div>
                )}
              </div>
            </div>

            <div className="detail-desc">
              <h3>About This Service</h3>
              <p>{description}</p>
            </div>

            {/* Reviews */}
            <div className="detail-reviews">
              <h3>Customer Reviews {totalReviews > 0 && `(${totalReviews})`}</h3>
              {reviews.length === 0 ? (
                <p className="no-reviews">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="reviews-list">
                  {reviews.map(r => (
                    <div key={r._id} className="review-card">
                      <div className="review-header">
                        <div className="reviewer-avatar">{r.user?.name?.charAt(0)}</div>
                        <div>
                          <strong>{r.user?.name}</strong>
                          <div className="stars"><StarRating rating={r.rating} /></div>
                        </div>
                        <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="review-comment">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="service-detail-sidebar">
            {/* Provider Card */}
            <div className="provider-card card">
              <h3>About the Provider</h3>
              <div className="provider-profile">
                <div className="provider-avatar-lg">
                  {provider?.avatar ? <img src={provider.avatar} alt={provider.name} /> : provider?.name?.charAt(0)}
                </div>
                <div>
                  <div className="provider-name-row">
                    <strong>{provider?.name}</strong>
                    {provider?.isVerified && <CheckCircle size={16} className="verified-icon" />}
                  </div>
                  <span className="provider-category">{provider?.serviceCategory}</span>
                </div>
              </div>
              {provider?.bio && <p className="provider-bio">{provider.bio}</p>}
              <div className="provider-stats">
                <div className="p-stat">
                  <div className="stars"><StarRating rating={provider?.rating || 0} /></div>
                  <span>{provider?.rating?.toFixed(1) || 'New'} rating</span>
                </div>
                {provider?.experience > 0 && (
                  <div className="p-stat"><span className="p-stat-val">{provider.experience}y</span><span>Experience</span></div>
                )}
                {provider?.totalReviews > 0 && (
                  <div className="p-stat"><span className="p-stat-val">{provider.totalReviews}</span><span>Reviews</span></div>
                )}
              </div>
            </div>

            {/* Booking Card */}
            <div className="booking-card card">
              <div className="booking-price-row">
                <div>
                  <span className="price-currency">₹</span>
                  <span className="booking-price-amount">{price.toLocaleString()}</span>
                  <span className="price-type">{priceType === 'hourly' ? '/hr' : priceType === 'fixed' ? ' fixed' : ' negotiable'}</span>
                </div>
              </div>

              {bookedBooking ? (
                <div className="booking-success">
                  <CheckCircle size={24} color="var(--success-400)" />
                  <p>Booking #{bookedBooking._id?.slice(-6)} confirmed!</p>
                  <button className="btn btn-secondary btn-full" onClick={() => navigate('/my-bookings')}>View Bookings</button>
                </div>
              ) : (
                <button id="book-now-btn" className="btn btn-primary btn-full btn-lg" onClick={handleBookNow}>
                  Book Now
                </button>
              )}

              <button id="call-provider-btn" className="btn btn-secondary btn-full" onClick={() => setShowCallModal(true)}>
                <Phone size={16} /> Call Provider
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <BookingModal
          service={service}
          onClose={() => setShowBooking(false)}
          onSuccess={(booking) => { setBookedBooking(booking); setShowBooking(false); }}
        />
      )}

      {/* Call Provider Modal */}
      {showCallModal && (
        <CallModal
          provider={provider}
          serviceTitle={title}
          onClose={() => setShowCallModal(false)}
        />
      )}
    </div>
  );
}
