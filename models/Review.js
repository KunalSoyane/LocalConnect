const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews per booking
reviewSchema.index({ user: 1, booking: 1 }, { unique: true });

// Static method to update provider & service average rating
reviewSchema.statics.calcAverageRating = async function (providerId, serviceId) {
  const stats = await this.aggregate([
    { $match: { provider: providerId } },
    { $group: { _id: '$provider', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    const User = require('./User');
    await User.findByIdAndUpdate(providerId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].count,
    });
  }

  if (serviceId) {
    const serviceStats = await this.aggregate([
      { $match: { service: serviceId } },
      { $group: { _id: '$service', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (serviceStats.length > 0) {
      const Service = require('./Service');
      await Service.findByIdAndUpdate(serviceId, {
        rating: Math.round(serviceStats[0].avgRating * 10) / 10,
        totalReviews: serviceStats[0].count,
      });
    }
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.provider, this.service);
});

module.exports = mongoose.model('Review', reviewSchema);
