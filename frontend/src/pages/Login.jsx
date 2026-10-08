import { useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || location.state?.from;

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ES6 Arrow function validation (Experiment 1)
  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`);
      // Redirect to target if present (e.g. booking page)
      if (redirectTarget) {
        navigate(redirectTarget);
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'provider') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => { setForm(p => ({ ...p, [field]: e.target.value })); setErrors(p => ({ ...p, [field]: '' })); };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-glow" />
      </div>
      <div className="auth-container">
        <div className="auth-card card-glass">
          <div className="auth-logo">
            <div className="brand-icon"><Zap size={22} /></div>
            <span>Local<span className="gradient-text">Connect</span></span>
          </div>
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Login to book services or manage your account</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email" type="email" className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com" value={form.email} onChange={set('email')}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="input-password">
                <input
                  id="login-password" type={showPw ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="••••••••" value={form.password} onChange={set('password')}
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <button id="login-btn" type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><Loader size={18} className="spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one →</Link>
          </p>

          {/* Demo credentials */}
          <div className="demo-creds">
            <p>🧪 Demo Credentials:</p>
            <div className="demo-list">
              <span>User: user@demo.com / demo123</span>
              <span>Provider: provider@demo.com / demo123</span>
              <span>Admin: admin@demo.com / demo123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
