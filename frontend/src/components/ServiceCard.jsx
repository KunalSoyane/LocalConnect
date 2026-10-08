import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, CheckCircle, Tag } from 'lucide-react';
import './ServiceCard.css';

// ES6 Arrow Function component (Experiment 2)
const ServiceCard = ({ service }) => {
  const { _id, title, description, category, price, priceType, rating, totalReviews, provider, location, images } = service;

  // Template literal for image fallback (Experiment 2)
  const imgSrc = images?.[0] || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(category)}`;

  // Arrow function for star render (Experiment 2)
  const renderStars = (r) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} size={13} fill={i < Math.round(r) ? '#fbbf24' : 'transparent'} color={i < Math.round(r) ? '#fbbf24' : '#5b5c70'} />
  ));

  const priceLabel = priceType === 'hourly' ? '/hr' : priceType === 'fixed' ? ' fixed' : ' neg.';

  return (
    <div className="service-card animate-fade-in-up">
      <Link to={`/services/${_id}`} className="service-card-link">
        <div className="service-card-image">
          <img src={imgSrc} alt={title} loading="lazy" />
          <span className="service-badge">{category}</span>
          {provider?.isVerified && (
            <span className="verified-badge"><CheckCircle size={12} /> Verified</span>
          )}
        </div>

        <div className="service-card-body">
          <h3 className="service-title">{title}</h3>
          <p className="service-desc">{description.substring(0, 90)}{description.length > 90 ? '…' : ''}</p>

          <div className="service-meta">
            <div className="service-provider">
              <div className="provider-avatar">
                {provider?.avatar ? <img src={provider.avatar} alt={provider.name} /> : provider?.name?.charAt(0)}
              </div>
              <span>{provider?.name}</span>
            </div>

            {location?.city && (
              <div className="service-location">
                <MapPin size={13} />
                <span>{location.city}</span>
              </div>
            )}
          </div>

          <div className="service-footer">
            <div className="service-rating">
              <div className="stars">{renderStars(rating)}</div>
              <span>{rating > 0 ? rating.toFixed(1) : 'New'}</span>
              {totalReviews > 0 && <span className="review-count">({totalReviews})</span>}
            </div>
            <div className="service-price">
              <span className="price-currency">₹</span>
              <span className="price-amount">{price.toLocaleString()}</span>
              <span className="price-type">{priceLabel}</span>
            </div>
          </div>
        </div>
      </Link>

      <div className="service-card-action">
        <Link to={`/services/${_id}?book=true`} className="btn btn-primary btn-sm btn-full">Book Now</Link>
      </div>
    </div>
  );
};

export default ServiceCard;
