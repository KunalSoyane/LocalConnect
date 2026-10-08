import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, Clock, MapPin, Star, X, CheckCircle, Loader, MessageCircle } from 'lucide-react';
import './MyBookings.css';

const STATUS_COLORS = { pending: 'warning', confirmed: 'primary', 'in-progress': 'primary', completed: 'success', cancelled: 'error' };
const STATUS_ICONS  = { pending: '⏳', confirmed: '✅', 'in-progress': '🔧', completed: '🎉', cancelled: '❌' };

// Review Modal
const ReviewModal = ({ booking, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hovered, setHovered] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) { toast.error('Please write a comment'); return; }
    setLoading(true);
    try {
      await axios.post('/api/reviews', {
        provider: booking.provider?._id,
        service: booking.service?._id,
        booking: booking._id,
        rating,
        comment,
      });
      toast.success('Review submitted! Thank you 🌟');
      onSubmit();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3>Rate Your Experience</h3>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="review-service-name">{booking.service?.title}</div>
        <form onSubmit={handleSubmit}>
          <div className="star-selector">
            {[1, 2, 3, 4, 5].map(n => (
              <button type="button" key={n} className="star-btn"
                onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(n)}>
                <Star size={32} fill={(hovered || rating) >= n ? '#fbbf24' : 'transparent'} color={(hovered || rating) >= n ? '#fbbf24' : '#5b5c70'} />
              </button>
            ))}
            <span className="rating-label">{['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][(hovered || rating)]}</span>
          </div>
          <div className="form-group">
            <label className="form-label">Your Review *</label>
            <textarea id="review-comment" className="form-input" rows={4} placeholder="Share your experience with this service..." value={comment} onChange={e => setComment(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <><Loader size={16} className="spin" /> Submitting...</> : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [reviewBooking, setReviewBooking] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const params = filter !== 'all' ? `?status=${filter}` : '';
        const { data } = await axios.get(`/api/bookings${params}`);
        setBookings(data.data);
      } catch { toast.error('Failed to load bookings'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [filter]);

  const cancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await axios.put(`/api/bookings/${id}`, { status: 'cancelled', cancellationReason: 'Cancelled by user' });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
      toast.success('Booking cancelled');
    } catch { toast.error('Failed to cancel'); }
  };

  const STATUS_TABS = ['all', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];

  // ES6 Arrow function filter (Experiment 2)
  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="my-bookings-page">
      <div className="container">
        <div className="page-title-row">
          <div>
            <h1>My Bookings</h1>
            <p>Track and manage all your service bookings</p>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="status-tabs">
          {STATUS_TABS.map(s => (
            <button key={s} className={`status-tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {s === 'all' ? 'All' : `${STATUS_ICONS[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : filteredBookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <h3>No bookings found</h3>
            <p>You haven't made any {filter !== 'all' ? filter : ''} bookings yet</p>
          </div>
        ) : (
          <div className="bookings-list">
            {filteredBookings.map(booking => (
              <div key={booking._id} className="booking-item card">
                <div className="booking-item-header">
                  <div className="booking-service-info-row">
                    <div className="booking-service-avatar">{booking.service?.category?.charAt(0)}</div>
                    <div>
                      <h3>{booking.service?.title}</h3>
                      <p>Provider: {booking.provider?.name}</p>
                    </div>
                  </div>
                  <div className={`badge badge-${STATUS_COLORS[booking.status]}`}>
                    {STATUS_ICONS[booking.status]} {booking.status}
                  </div>
                </div>

                <div className="booking-details-row">
                  <div className="booking-detail"><Calendar size={15} /> {new Date(booking.scheduledDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
                  <div className="booking-detail"><Clock size={15} /> {booking.scheduledTime}</div>
                  {booking.address?.city && <div className="booking-detail"><MapPin size={15} /> {booking.address.city}</div>}
                  <div className="booking-price-tag">₹{booking.totalAmount?.toLocaleString()}</div>
                </div>

                {booking.notes && <p className="booking-notes"><MessageCircle size={14} /> {booking.notes}</p>}

                <div className="booking-actions">
                  {booking.status === 'completed' && (
                    <button className="btn btn-secondary btn-sm" onClick={() => setReviewBooking(booking)}>
                      <Star size={15} /> Write Review
                    </button>
                  )}
                  {['pending', 'confirmed'].includes(booking.status) && (
                    <button className="btn btn-danger btn-sm" onClick={() => cancelBooking(booking._id)}>
                      <X size={15} /> Cancel
                    </button>
                  )}
                  <span className="booking-id">#{booking._id?.slice(-6)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSubmit={() => setReviewBooking(null)}
        />
      )}
    </div>
  );
}
