import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Phone, MapPin, Briefcase, Save, Loader, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', street: '', city: '', state: '', pincode: '', bio: '', experience: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        pincode: user.address?.pincode || '',
        bio: user.bio || '',
        experience: user.experience || '',
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const { data } = await axios.put('/api/users/profile', {
        name: form.name,
        phone: form.phone,
        address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode },
        bio: form.bio,
        experience: form.experience ? Number(form.experience) : 0,
      });
      updateUser(data.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  if (!user) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-grid">
          {/* Left: Avatar + Info */}
          <aside className="profile-sidebar">
            <div className="profile-card card">
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar">
                  {user.avatar ? <img src={user.avatar} alt={user.name} /> : user.name.charAt(0).toUpperCase()}
                </div>
                <button className="avatar-edit-btn" title="Change photo">
                  <Camera size={14} />
                </button>
              </div>
              <h3>{user.name}</h3>
              <span className={`badge badge-${user.role === 'admin' ? 'error' : user.role === 'provider' ? 'primary' : 'success'}`}>{user.role}</span>
              {user.isVerified && <div className="verified-chip">✓ Verified Provider</div>}

              <div className="profile-stats">
                {user.rating > 0 && (
                  <div className="pstat">
                    <span className="pstat-val">{user.rating.toFixed(1)} ⭐</span>
                    <span>Rating</span>
                  </div>
                )}
                {user.totalReviews > 0 && (
                  <div className="pstat">
                    <span className="pstat-val">{user.totalReviews}</span>
                    <span>Reviews</span>
                  </div>
                )}
                {user.totalBookings > 0 && (
                  <div className="pstat">
                    <span className="pstat-val">{user.totalBookings}</span>
                    <span>Bookings</span>
                  </div>
                )}
              </div>

              <div className="profile-info-list">
                <div className="pinfo-item"><Phone size={15} /> {user.phone || 'Not set'}</div>
                <div className="pinfo-item"><MapPin size={15} /> {user.address?.city || 'Not set'}</div>
                {user.serviceCategory && <div className="pinfo-item"><Briefcase size={15} /> {user.serviceCategory}</div>}
              </div>
            </div>
          </aside>

          {/* Right: Edit Form */}
          <main className="profile-form-area">
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ marginBottom: '1.75rem', fontSize: '1.375rem' }}>Edit Profile</h2>
              <form onSubmit={handleSave}>
                <div className="form-section-title"><User size={16} /> Personal Information</div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-name">Full Name *</label>
                    <input id="profile-name" type="text" className="form-input" value={form.name} onChange={set('name')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-phone">Mobile Number</label>
                    <input id="profile-phone" type="tel" className="form-input" value={form.phone} onChange={set('phone')} />
                  </div>
                </div>

                <div className="form-section-title"><MapPin size={16} /> Address</div>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-street">Street Address</label>
                  <input id="profile-street" type="text" className="form-input" value={form.street} onChange={set('street')} />
                </div>
                <div className="form-row-3">
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-city">City</label>
                    <input id="profile-city" type="text" className="form-input" value={form.city} onChange={set('city')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-state">State</label>
                    <input id="profile-state" type="text" className="form-input" value={form.state} onChange={set('state')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-pin">Pincode</label>
                    <input id="profile-pin" type="text" className="form-input" value={form.pincode} onChange={set('pincode')} />
                  </div>
                </div>

                {user.role === 'provider' && (
                  <>
                    <div className="form-section-title"><Briefcase size={16} /> Provider Details</div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="profile-bio">Bio</label>
                      <textarea id="profile-bio" className="form-input" rows={3} maxLength={500} value={form.bio} onChange={set('bio')} />
                    </div>
                    <div className="form-group" style={{ maxWidth: '200px' }}>
                      <label className="form-label" htmlFor="profile-exp">Years of Experience</label>
                      <input id="profile-exp" type="number" min="0" max="50" className="form-input" value={form.experience} onChange={set('experience')} />
                    </div>
                  </>
                )}

                <button id="save-profile-btn" type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                  {saving ? <><Loader size={16} className="spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
                </button>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
