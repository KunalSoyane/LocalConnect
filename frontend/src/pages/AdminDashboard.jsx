import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Users, Briefcase, Calendar, TrendingUp, CheckCircle, X, Shield, ToggleLeft, ToggleRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Dashboard.css';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [userFilter, setUserFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, usersRes] = await Promise.all([
          axios.get('/api/users/admin/stats'),
          axios.get('/api/users/admin/users'),
        ]);
        setStats(statsRes.data.data);
        setUsers(usersRes.data.data);
      } catch { toast.error('Failed to load admin data'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const verifyProvider = async (id, isVerified) => {
    try {
      await axios.put(`/api/users/admin/verify/${id}`, { isVerified });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isVerified } : u));
      toast.success(isVerified ? 'Provider verified!' : 'Verification removed');
    } catch { toast.error('Failed to update'); }
  };

  const toggleUser = async (id) => {
    try {
      const { data } = await axios.put(`/api/users/admin/toggle/${id}`);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: data.data.isActive } : u));
      toast.success('User status updated');
    } catch { toast.error('Failed to update'); }
  };

  // ES6 Arrow + filter for user search
  const filteredUsers = users.filter(u =>
    !userFilter || u.name.toLowerCase().includes(userFilter.toLowerCase()) || u.email.toLowerCase().includes(userFilter.toLowerCase())
  );

  const statCards = stats ? [
    { label: 'Total Users',      value: stats.totalUsers,     icon: Users,     color: 'var(--primary-400)' },
    { label: 'Providers',        value: stats.totalProviders, icon: Briefcase, color: 'var(--accent-400)' },
    { label: 'Total Bookings',   value: stats.totalBookings,  icon: Calendar,  color: 'var(--success-400)' },
    { label: 'Total Services',   value: stats.totalServices,  icon: TrendingUp, color: 'var(--warning-400)' },
  ] : [];

  const pieData = stats?.bookingsByStatus?.map(({ _id, count }) => ({ name: _id, value: count })) || [];

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const chartData = stats?.monthlyBookings?.map(m => ({
    month: monthNames[m._id.month - 1],
    bookings: m.count,
    revenue: m.revenue,
  })) || [];

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Monitor platform health and manage users</p>
          </div>
          <div className="admin-badge"><Shield size={16} /> Admin Panel</div>
        </div>

        {/* Tabs */}
        <div className="dash-tabs">
          {['overview', 'users', 'providers'].map(t => (
            <button key={t} className={`dash-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? <div className="page-loader"><div className="spinner" /></div> : (
          <>
            {/* Overview Tab */}
            {tab === 'overview' && (
              <>
                <div className="dash-stats">
                  {statCards.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="dash-stat card">
                      <div className="dash-stat-icon" style={{ background: `${color}18`, color }}><Icon size={22} /></div>
                      <div className="dash-stat-val">{value}</div>
                      <div className="dash-stat-label">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="admin-charts">
                  {/* Monthly Bookings Bar Chart */}
                  <div className="chart-card card">
                    <h3>Monthly Bookings</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={chartData}>
                        <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                        <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                        />
                        <Bar dataKey="bookings" fill="var(--primary-500)" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Booking Status Pie */}
                  <div className="chart-card card">
                    <h3>Bookings by Status</h3>
                    {pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                            {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <div className="empty-state" style={{padding:'3rem'}}>No booking data</div>}
                    <div className="pie-legend">
                      {pieData.map((d, i) => (
                        <div key={d.name} className="legend-item">
                          <div className="legend-dot" style={{ background: COLORS[i] }} />
                          <span>{d.name}: {d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Bookings */}
                {stats?.recentBookings?.length > 0 && (
                  <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Recent Bookings</h3>
                    <div className="recent-list">
                      {stats.recentBookings.map(b => (
                        <div key={b._id} className="recent-booking">
                          <span>{b.user?.name}</span>
                          <span className="recent-service">{b.service?.title}</span>
                          <span className={`badge badge-${b.status === 'completed' ? 'success' : b.status === 'pending' ? 'warning' : 'primary'}`}>{b.status}</span>
                          <span className="recent-date">{new Date(b.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Users / Providers Tab */}
            {(tab === 'users' || tab === 'providers') && (
              <div className="admin-users-section">
                <div className="users-search-row">
                  <input
                    id="admin-user-search"
                    type="text"
                    className="form-input"
                    placeholder={`Search ${tab}...`}
                    value={userFilter}
                    onChange={e => setUserFilter(e.target.value)}
                    style={{ maxWidth: '320px' }}
                  />
                </div>

                <div className="card" style={{ overflow: 'auto' }}>
                  <table className="bookings-table">
                    <thead>
                      <tr>
                        <th>Name</th><th>Email</th><th>Phone</th><th>Role</th>
                        {tab === 'providers' && <th>Category</th>}
                        {tab === 'providers' && <th>Verified</th>}
                        <th>Status</th><th>Joined</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.filter(u => tab === 'providers' ? u.role === 'provider' : u.role === 'user').map(u => (
                        <tr key={u._id}>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</td>
                          <td>{u.email}</td>
                          <td>{u.phone}</td>
                          <td><span className="badge badge-muted">{u.role}</span></td>
                          {tab === 'providers' && <td>{u.serviceCategory || '—'}</td>}
                          {tab === 'providers' && (
                            <td>
                              {u.isVerified
                                ? <span className="badge badge-success"><CheckCircle size={12} /> Yes</span>
                                : <span className="badge badge-muted">No</span>}
                            </td>
                          )}
                          <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-error'}`}>{u.isActive ? 'Active' : 'Suspended'}</span></td>
                          <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.375rem' }}>
                              {tab === 'providers' && (
                                <button
                                  className={`btn btn-sm ${u.isVerified ? 'btn-secondary' : 'btn-primary'}`}
                                  onClick={() => verifyProvider(u._id, !u.isVerified)}
                                  title={u.isVerified ? 'Revoke verification' : 'Verify provider'}
                                >
                                  {u.isVerified ? <X size={14} /> : <CheckCircle size={14} />}
                                  {u.isVerified ? 'Revoke' : 'Verify'}
                                </button>
                              )}
                              <button
                                className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-secondary'}`}
                                onClick={() => toggleUser(u._id)}
                                title={u.isActive ? 'Suspend user' : 'Activate user'}
                              >
                                {u.isActive ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
