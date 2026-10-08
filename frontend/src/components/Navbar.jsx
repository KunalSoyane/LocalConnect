import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, User, LogOut, LayoutDashboard, Shield, Calendar, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on navigation
  useEffect(() => { setMenuOpen(false); setDropdownOpen(false); }, [location.pathname]);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Services' },
    { to: '/about', label: 'About' },
  ];

  const userLinks = user ? [
    ...(user.role === 'user'     ? [{ to: '/my-bookings', label: 'My Bookings', icon: Calendar }] : []),
    ...(user.role === 'provider' ? [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    ...(user.role === 'admin'    ? [{ to: '/admin', label: 'Admin Panel', icon: Shield }] : []),
    { to: '/profile', label: 'Profile', icon: User },
  ] : [];

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <div className="brand-icon"><Zap size={20} /></div>
          <span className="brand-name">Local<span className="gradient-text">Connect</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-links hide-mobile">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className={`nav-link ${isActive(to) && to !== '/' ? 'active' : to === '/' && location.pathname === '/' ? 'active' : ''}`}>
              {label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="navbar-actions">
          <button className="btn btn-icon btn-secondary theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <div className="user-menu">
              <button className="user-avatar-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="user-avatar">
                  {user.avatar
                    ? <img src={user.avatar} alt={user.name} />
                    : user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hide-mobile user-name">{user.name.split(' ')[0]}</span>
              </button>

              {dropdownOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="user-avatar-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="dropdown-name">{user.name}</p>
                      <p className="dropdown-role">{user.role}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  {userLinks.map(({ to, label, icon: Icon }) => (
                    <Link key={to} to={to} className="dropdown-item">
                      <Icon size={16} /> {label}
                    </Link>
                  ))}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-secondary btn-sm hide-mobile">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className={`mobile-nav-link ${isActive(to) ? 'active' : ''}`}>{label}</Link>
          ))}
          {user ? (
            <>
              <div className="mobile-menu-divider" />
              {userLinks.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} className="mobile-nav-link"><Icon size={16} /> {label}</Link>
              ))}
              <button className="mobile-nav-link danger" onClick={handleLogout}><LogOut size={16} /> Logout</button>
            </>
          ) : (
            <>
              <div className="mobile-menu-divider" />
              <Link to="/login" className="mobile-nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
