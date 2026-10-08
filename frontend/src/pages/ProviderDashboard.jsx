import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Loader, CheckCircle, Clock, TrendingUp, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const CATEGORIES = ['Electrician', 'Plumber', 'Tutor', 'Home Cleaner', 'Mechanic', 'Nurse', 'Carpenter', 'Painter', 'AC Repair', 'Pest Control', 'Other'];
const STATUS_COLORS = { pending: 'warning', confirmed: 'primary', 'in-progress': 'primary', completed: 'success', cancelled: 'error' };

// Service Form Modal
const ServiceModal = ({ service, onClose, onSaved }) => {
  const [form, setForm] = useState({
    title: service?.title || '',
    description: service?.description || '',
    category: service?.category || '',
    price: service?.price || '',
    priceType: service?.priceType || 'hourly',
    city: service?.location?.city || '',
    state: service?.location?.state || '',
    pincode: service?.location?.pincode || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category || !form.price || !form.city) {
      return toast.error('Please fill all required fields');
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title, description: form.description, category: form.category,
        price: Number(form.price), priceType: form.priceType,
        location: { city: form.city, state: form.state, pincode: form.pincode },
      };
      if (service?._id) {
        await axios.put(`/api/services/${service._id}`, payload);
        toast.success('Service updated!');
      } else {
        await axios.post('/api/services', payload);
        toast.success('Service added!');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3>{service?._id ? 'Edit Service' : 'Add New Service'}</h3>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input id="svc-title" type="text" className="form-input" placeholder="e.g. Professional Home Wiring" value={form.title} onChange={set('title')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea id="svc-desc" className="form-input" rows={4} placeholder="Describe your service..." value={form.description} onChange={set('description')} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.875rem' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select id="svc-category" className="form-input" value={form.category} onChange={set('category')} required>
                <option value="">Select...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input id="svc-price" type="number" className="form-input" min="0" value={form.price} onChange={set('price')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Price Type</label>
              <select id="svc-price-type" className="form-input" value={form.priceType} onChange={set('priceType')}>
                <option value="hourly">Hourly</option>
                <option value="fixed">Fixed</option>
                <option value="negotiable">Negotiable</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '0.875rem' }}>
            <div className="form-group">
              <label className="form-label">City *</label>
              <input id="svc-city" type="text" className="form-input" value={form.city} onChange={set('city')} required />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input id="svc-state" type="text" className="form-input" value={form.state} onChange={set('state')} />
            </div>
            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input id="svc-pincode" type="text" className="form-input" value={form.pincode} onChange={set('pincode')} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
            {saving ? <><Loader size={16} className="spin" /> Saving...</> : `${service?._id ? 'Update' : 'Add'} Service`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceModal, setServiceModal] = useState(null); // null=closed, {}=new, obj=edit

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [bRes, sRes] = await Promise.all([
          axios.get('/api/bookings'),
          axios.get(`/api/services?limit=50`),
        ]);
        setBookings(bRes.data.data);
        // Filter to only my services
        setServices(sRes.data.data.filter(s => s.provider?._id === user?._id || s.provider === user?._id));
      } catch { toast.error('Failed to load data'); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [user]);

  const updateBookingStatus = async (id, status) => {
    try {
      await axios.put(`/api/bookings/${id}`, { status });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
      toast.success(`Booking ${status}`);
    } catch { toast.error('Failed to update'); }
  };

  const deleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await axios.delete(`/api/services/${id}`);
      setServices(prev => prev.filter(s => s._id !== id));
      toast.success('Service deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const stats = [
    { label: 'Total Bookings', value: bookings.length, icon: Clock, color: 'var(--primary-400)' },
    { label: 'Completed',      value: bookings.filter(b => b.status === 'completed').length, icon: CheckCircle, color: 'var(--success-400)' },
    { label: 'Active Services', value: services.length, icon: TrendingUp, color: 'var(--accent-400)' },
    { label: 'My Rating',      value: user?.rating ? user.rating.toFixed(1) + ' ⭐' : 'N/A', icon: Star, color: 'var(--warning-400)' },
  ];

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dash-header">
          <div>
            <h1>Provider Dashboard</h1>
            <p>Welcome back, {user?.name}! Manage your services and bookings.</p>
          </div>
          {tab === 'services' && (
            <button id="add-service-btn" className="btn btn-primary" onClick={() => setServiceModal({})}>
              <Plus size={18} /> Add Service
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="dash-stats">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="dash-stat card">
              <div className="dash-stat-icon" style={{ background: `${color}18`, color }}><Icon size={22} /></div>
              <div className="dash-stat-val">{value}</div>
              <div className="dash-stat-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="dash-tabs">
          {['bookings', 'services'].map(t => (
            <button key={t} className={`dash-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? <div className="page-loader"><div className="spinner" /></div> : (
          <>
            {/* Bookings Tab */}
            {tab === 'bookings' && (
              <div className="bookings-table-wrap card">
                <table className="bookings-table">
                  <thead>
                    <tr><th>Customer</th><th>Service</th><th>Date</th><th>Time</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr><td colSpan={7} className="empty-row">No bookings yet</td></tr>
                    ) : bookings.map(b => (
                      <tr key={b._id}>
                        <td>{b.user?.name}</td>
                        <td>{b.service?.title}</td>
                        <td>{new Date(b.scheduledDate).toLocaleDateString('en-IN')}</td>
                        <td>{b.scheduledTime}</td>
                        <td>₹{b.totalAmount?.toLocaleString()}</td>
                        <td><span className={`badge badge-${STATUS_COLORS[b.status]}`}>{b.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.375rem' }}>
                            {b.status === 'pending'     && <button className="btn btn-sm btn-primary"   onClick={() => updateBookingStatus(b._id, 'confirmed')}>Confirm</button>}
                            {b.status === 'confirmed'   && <button className="btn btn-sm btn-outline"   onClick={() => updateBookingStatus(b._id, 'in-progress')}>Start</button>}
                            {b.status === 'in-progress' && <button className="btn btn-sm btn-secondary" onClick={() => updateBookingStatus(b._id, 'completed')}>Complete</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Services Tab */}
            {tab === 'services' && (
              <div className="services-list-wrap">
                {services.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">🛠️</div>
                    <h3>No services added yet</h3>
                    <button className="btn btn-primary" onClick={() => setServiceModal({})}>
                      <Plus size={16} /> Add Your First Service
                    </button>
                  </div>
                ) : (
                  <div className="services-manage-grid">
                    {services.map(svc => (
                      <div key={svc._id} className="svc-manage-card card">
                        <div className="svc-manage-header">
                          <span className="badge badge-primary">{svc.category}</span>
                          <span className={`badge ${svc.isAvailable ? 'badge-success' : 'badge-muted'}`}>{svc.isAvailable ? 'Active' : 'Inactive'}</span>
                        </div>
                        <h4>{svc.title}</h4>
                        <p>{svc.description.substring(0, 80)}…</p>
                        <div className="svc-manage-footer">
                          <strong className="svc-price">₹{svc.price.toLocaleString()}/{svc.priceType === 'hourly' ? 'hr' : svc.priceType}</strong>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-sm btn-secondary" onClick={() => setServiceModal(svc)}><Edit size={14} /></button>
                            <button className="btn btn-sm btn-danger" onClick={() => deleteService(svc._id)}><Trash2 size={14} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {serviceModal !== null && (
        <ServiceModal
          service={serviceModal._id ? serviceModal : undefined}
          onClose={() => setServiceModal(null)}
          onSaved={() => { setServiceModal(null); window.location.reload(); }}
        />
      )}
    </div>
  );
}
