import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import './Services.css';

// ES6 - Categories array (Experiment 2)
const CATEGORIES = ['All', 'Electrician', 'Plumber', 'Tutor', 'Home Cleaner', 'Mechanic', 'Nurse', 'Carpenter', 'Painter', 'AC Repair', 'Pest Control', 'Other'];
const SORT_OPTIONS = [
  { value: 'newest',    label: 'Newest First' },
  { value: 'rating',    label: 'Top Rated' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high',label: 'Price: High to Low' },
];

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Derived state from URL params (Experiment 2: filter/search)
  const [filters, setFilters] = useState({
    search:   searchParams.get('search')   || '',
    category: searchParams.get('category') || 'All',
    city:     searchParams.get('city')     || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort:     searchParams.get('sort')     || 'newest',
    page:     Number(searchParams.get('page')) || 1,
  });

  // ES6 Arrow function async fetch (Experiment 2)
  const fetchServices = useCallback(async (f) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.search)   params.set('search', f.search);
      if (f.category && f.category !== 'All') params.set('category', f.category);
      if (f.city)     params.set('city', f.city);
      if (f.minPrice) params.set('minPrice', f.minPrice);
      if (f.maxPrice) params.set('maxPrice', f.maxPrice);
      params.set('sort', f.sort);
      params.set('page', f.page);
      params.set('limit', '12');

      const { data } = await axios.get(`/api/services?${params.toString()}`);
      setServices(data.data);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices(filters);
    // Sync URL
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v && v !== 'All' && v !== 'newest' && v !== 1) params[k] = v; });
    setSearchParams(params, { replace: true });
  }, [filters, fetchServices]);

  const updateFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value, page: 1 }));

  const clearFilters = () => setFilters({ search: '', category: 'All', city: '', minPrice: '', maxPrice: '', sort: 'newest', page: 1 });

  const hasActiveFilters = filters.category !== 'All' || filters.city || filters.minPrice || filters.maxPrice || filters.search;

  return (
    <div className="services-page">
      {/* Header */}
      <div className="services-header">
        <div className="container">
          <div className="services-header-content">
            <div>
              <h1>Browse Services</h1>
              <p>{total > 0 ? `${total} services available` : 'Find your perfect service provider'}</p>
            </div>
          </div>

          {/* Search + Filter Row */}
          <div className="services-search-row">
            <div className="services-search">
              <Search size={18} className="services-search-icon" />
              <input
                id="services-search"
                type="text"
                placeholder="Search services..."
                className="services-search-input"
                value={filters.search}
                onChange={e => updateFilter('search', e.target.value)}
              />
              {filters.search && (
                <button className="search-clear" onClick={() => updateFilter('search', '')}>
                  <X size={16} />
                </button>
              )}
            </div>

            <select
              id="services-sort"
              className="form-input sort-select"
              value={filters.sort}
              onChange={e => updateFilter('sort', e.target.value)}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <button className={`btn btn-secondary filter-toggle ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal size={16} /> Filters
              {hasActiveFilters && <span className="filter-badge" />}
            </button>

            {hasActiveFilters && (
              <button className="btn btn-secondary" onClick={clearFilters}>
                <X size={16} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container services-body">
        {/* Sidebar Filters */}
        <aside className={`services-sidebar ${showFilters ? 'show' : ''}`}>
          <div className="sidebar-section">
            <h4>Category</h4>
            <div className="category-list">
              {/* ES6 filter demo to highlight selected */}
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`category-btn ${filters.category === cat ? 'active' : ''}`}
                  onClick={() => updateFilter('category', cat)}
                >
                  {cat}
                  {filters.category === cat && <span className="cat-dot" />}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h4>City</h4>
            <input
              type="text"
              id="filter-city"
              className="form-input"
              placeholder="Enter city..."
              value={filters.city}
              onChange={e => updateFilter('city', e.target.value)}
            />
          </div>

          <div className="sidebar-section">
            <h4>Price Range (₹)</h4>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="number"
                id="filter-min-price"
                className="form-input"
                placeholder="Min"
                value={filters.minPrice}
                onChange={e => updateFilter('minPrice', e.target.value)}
              />
              <input
                type="number"
                id="filter-max-price"
                className="form-input"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={e => updateFilter('maxPrice', e.target.value)}
              />
            </div>
          </div>
        </aside>

        {/* Services Grid */}
        <div className="services-content">
          {loading ? (
            <div className="grid grid-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '340px' }} />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No services found</h3>
              <p>Try adjusting your search or filters</p>
              <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-3">
                {services.map(s => <ServiceCard key={s._id} service={s} />)}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="pagination">
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={filters.page <= 1}
                    onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <span className="page-info">Page {filters.page} of {pages}</span>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={filters.page >= pages}
                    onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
