import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader, Zap, User, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

const CATEGORIES = ['Electrician', 'Plumber', 'Tutor', 'Home Cleaner', 'Mechanic', 'Nurse', 'Carpenter', 'Painter', 'AC Repair', 'Pest Control', 'Other'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('user');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', street: '', city: '', state: '', pincode: '', serviceCategory: '', bio: '', experience: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ES6 Arrow + JavaScript Validation (Experiment 1)
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';

    if (!form.email) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Invalid email format';

    if (!form.phone) errs.phone = 'Mobile number is required';
    else if (!/^[6-9]\d{9}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit mobile number';

    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';

    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';

    if (!form.city) errs.city = 'City is required';

    if (role === 'provider' && !form.serviceCategory) errs.serviceCategory = 'Please select your service category';

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.toLowerCase(),
        phone: form.phone,
        password: form.password,
        role,
        address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode },
        ...(role === 'provider' ? { serviceCategory: form.serviceCategory, bio: form.bio, experience: form.experience ? Number(form.experience) : 0 } : {}),
      };
      const user = await register(payload);
      toast.success(`Welcome to LocalConnect, ${user.name.split(' ')[0]}! 🎉`);
      if (user.role === 'provider') navigate('/dashboard');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => { setForm(p => ({ ...p, [field]: e.target.value })); setErrors(p => ({ ...p, [field]: '' })); };

  return (
    <div className="auth-page">
      <div className="auth-bg"><div className="auth-glow" /></div>
      <div className="auth-container auth-container-wide">
        <div className="auth-card card-glass">
          <div className="auth-logo">
            <div className="brand-icon"><Zap size={22} /></div>
            <span>Local<span className="gradient-text">Connect</span></span>
          </div>
          <div className="auth-header">
            <h1>Create Your Account</h1>
            <p>Join thousands of users and providers in your community</p>
          </div>

          {/* Role Selector */}
          <div className="role-tabs">
            <button id="role-user-btn" className={`role-tab ${role === 'user' ? 'active' : ''}`} onClick={() => setRole('user')}>
              <User size={18} /> I'm a Customer
            </button>
            <button id="role-provider-btn" className={`role-tab ${role === 'provider' ? 'active' : ''}`} onClick={() => setRole('provider')}>
              <Briefcase size={18} /> I'm a Provider
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">Full Name *</label>
                <input id="reg-name" type="text" className={`form-input ${errors.name ? 'error' : ''}`} placeholder="John Doe" value={form.name} onChange={set('name')} />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-phone">Mobile Number *</label>
                <input id="reg-phone" type="tel" className={`form-input ${errors.phone ? 'error' : ''}`} placeholder="9876543210" maxLength={10} value={form.phone} onChange={set('phone')} />
                {errors.phone && <span className="form-error">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address *</label>
              <input id="reg-email" type="email" className={`form-input ${errors.email ? 'error' : ''}`} placeholder="you@example.com" value={form.email} onChange={set('email')} />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password *</label>
                <div className="input-password">
                  <input id="reg-password" type={showPw ? 'text' : 'password'} className={`form-input ${errors.password ? 'error' : ''}`} placeholder="Min 6 characters" value={form.password} onChange={set('password')} />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm-pw">Confirm Password *</label>
                <input id="reg-confirm-pw" type="password" className={`form-input ${errors.confirmPassword ? 'error' : ''}`} placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} />
                {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
              </div>
            </div>

            {/* Address */}
            <div className="form-section-label">Address</div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-street">Street Address</label>
              <input id="reg-street" type="text" className="form-input" placeholder="123 Main Street" value={form.street} onChange={set('street')} />
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-city">City *</label>
                <input id="reg-city" type="text" className={`form-input ${errors.city ? 'error' : ''}`} placeholder="Bangalore" value={form.city} onChange={set('city')} />
                {errors.city && <span className="form-error">{errors.city}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-state">State</label>
                <input id="reg-state" type="text" className="form-input" placeholder="Karnataka" value={form.state} onChange={set('state')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-pincode">Pincode</label>
                <input id="reg-pincode" type="text" className="form-input" placeholder="560001" maxLength={6} value={form.pincode} onChange={set('pincode')} />
              </div>
            </div>

            {/* Provider-specific fields */}
            {role === 'provider' && (
              <div className="provider-fields animate-fade-in">
                <div className="form-section-label">Provider Details</div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-category">Service Category *</label>
                  <select id="reg-category" className={`form-input ${errors.serviceCategory ? 'error' : ''}`} value={form.serviceCategory} onChange={set('serviceCategory')}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.serviceCategory && <span className="form-error">{errors.serviceCategory}</span>}
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-experience">Years of Experience</label>
                    <input id="reg-experience" type="number" className="form-input" placeholder="5" min="0" max="50" value={form.experience} onChange={set('experience')} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-bio">Bio / Description</label>
                  <textarea id="reg-bio" className="form-input" rows={3} placeholder="Tell customers about your expertise..." maxLength={500} value={form.bio} onChange={set('bio')} />
                </div>
              </div>
            )}

            <button id="register-btn" type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? <><Loader size={18} className="spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">Already have an account? <Link to="/login">Sign in →</Link></p>
        </div>
      </div>
    </div>
  );
}
