const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

// GET /api/users/providers - list all verified providers
router.get('/providers', async (req, res) => {
  try {
    const { category, city, page = 1, limit = 12 } = req.query;
    const query = { role: 'provider', isActive: true };
    if (category) query.serviceCategory = category;

    const providers = await User.find(query)
      .select('name avatar rating totalReviews serviceCategory isVerified bio address')
      .sort({ rating: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ success: true, count: providers.length, data: providers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/profile - current user profile
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: user });
});

// PUT /api/users/profile - update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'address', 'bio', 'experience', 'avatar'];
    const updates = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Admin Routes ──────────────────────────────────────────────────────────────

// GET /api/users/admin/stats
router.get('/admin/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const [totalUsers, totalProviders, totalBookings, totalServices] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'provider' }),
      Booking.countDocuments(),
      Service.countDocuments(),
    ]);

    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const recentBookings = await Booking.find()
      .populate('user', 'name')
      .populate('service', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    const monthlyBookings = await Booking.aggregate([
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    res.json({
      success: true,
      data: { totalUsers, totalProviders, totalBookings, totalServices, bookingsByStatus, recentBookings, monthlyBookings },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/admin/users - list all users
router.get('/admin/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query).sort({ createdAt: -1 }).skip((page - 1) * Number(limit)).limit(Number(limit));
    const total = await User.countDocuments(query);
    res.json({ success: true, total, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/admin/verify/:id - verify provider
router.put('/admin/verify/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isVerified: req.body.isVerified }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/admin/toggle/:id - activate/deactivate user
router.put('/admin/toggle/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
