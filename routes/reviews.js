const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect, authorize } = require('../middleware/auth');

// POST /api/reviews
router.post('/', protect, authorize('user'), async (req, res) => {
  try {
    const review = await Review.create({ ...req.body, user: req.user._id });
    await review.populate('user', 'name avatar');
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'You already reviewed this booking' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/reviews?provider=id | ?service=id
router.get('/', async (req, res) => {
  try {
    const { provider, service, page = 1, limit = 10 } = req.query;
    const query = {};
    if (provider) query.provider = provider;
    if (service) query.service = service;

    const reviews = await Review.find(query)
      .populate('user', 'name avatar')
      .populate('service', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Review.countDocuments(query);
    res.json({ success: true, count: reviews.length, total, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/reviews/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
