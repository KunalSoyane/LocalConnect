const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const { protect, authorize } = require('../middleware/auth');

// GET /api/services - list & search (Experiment 2: filter/search)
router.get('/', async (req, res) => {
  try {
    const { search, category, city, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

    // Build query using ES6 destructuring & arrow functions
    const query = { isAvailable: true };

    if (category) query.category = category;
    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      rating: { rating: -1 },
      'price-low': { price: 1 },
      'price-high': { price: -1 },
    };

    const services = await Service.find(query)
      .populate('provider', 'name avatar rating isVerified')
      .sort(sortOptions[sort] || { createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Service.countDocuments(query);

    res.json({
      success: true,
      count: services.length,
      total,
      pages: Math.ceil(total / limit),
      data: services,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/services/:id
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'name avatar rating isVerified phone bio experience address serviceCategory totalReviews');
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/services - provider adds service
router.post('/', protect, authorize('provider', 'admin'), async (req, res) => {
  try {
    const service = await Service.create({ ...req.body, provider: req.user._id });
    res.status(201).json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/services/:id
router.put('/:id', protect, authorize('provider', 'admin'), async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    if (service.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/services/:id
router.delete('/:id', protect, authorize('provider', 'admin'), async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    if (service.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await service.deleteOne();
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
