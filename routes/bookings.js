const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// Helper: log booking event to file (Experiment 7 - File System)
const logBookingEvent = (req, message) => {
  const logStream = req.app.locals.logStream;
  const logEntry = `[${new Date().toISOString()}] ${message}\n`;
  if (logStream) logStream.write(Buffer.from(logEntry));
};

// POST /api/bookings
router.post('/', protect, authorize('user'), async (req, res) => {
  try {
    const { serviceId, scheduledDate, scheduledTime, address, notes } = req.body;

    const service = await Service.findById(serviceId).populate('provider');
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    const providerId = service.provider?._id || service.provider;
    if (!providerId) {
      return res.status(400).json({ success: false, message: 'Service provider is unavailable' });
    }

    const booking = await Booking.create({
      user: req.user._id,
      provider: providerId,
      service: serviceId,
      scheduledDate,
      scheduledTime,
      address,
      notes,
      totalAmount: service.price,
    });

    // Increment booking counts
    await Service.findByIdAndUpdate(serviceId, { $inc: { totalBookings: 1 } });
    await User.findByIdAndUpdate(providerId, { $inc: { totalBookings: 1 } });

    // Log booking event (Exp 7)
    logBookingEvent(req, `BOOKING_CREATED: bookingId=${booking._id} userId=${req.user._id} serviceId=${serviceId}`);

    const populated = await booking.populate([
      { path: 'service', select: 'title category price' },
      { path: 'provider', select: 'name phone' },
      { path: 'user', select: 'name email' },
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings - get bookings for current user/provider
router.get('/', protect, async (req, res) => {
  try {
    const query = req.user.role === 'provider'
      ? { provider: req.user._id }
      : req.user.role === 'admin'
      ? {}
      : { user: req.user._id };

    const { status, page = 1, limit = 10 } = req.query;
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('service', 'title category price')
      .populate('user', 'name email phone')
      .populate('provider', 'name phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);
    res.json({ success: true, count: bookings.length, total, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service', 'title category price description')
      .populate('user', 'name email phone address')
      .populate('provider', 'name phone email avatar');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/bookings/:id - update status
router.put('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Only provider/admin can confirm/complete; user can cancel
    const { status, cancellationReason } = req.body;
    const allowedTransitions = {
      user: ['cancelled'],
      provider: ['confirmed', 'in-progress', 'completed', 'cancelled'],
      admin: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    };

    if (!allowedTransitions[req.user.role]?.includes(status)) {
      return res.status(403).json({ success: false, message: 'Not authorized for this status change' });
    }

    booking.status = status;
    if (cancellationReason) booking.cancellationReason = cancellationReason;
    if (status === 'completed') booking.completedAt = new Date();
    await booking.save();

    logBookingEvent(req, `BOOKING_UPDATED: bookingId=${booking._id} status=${status}`);

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
