import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, X, Loader, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
export default function AIRecommendModal({ onClose }) {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim()) return toast.error('Please describe your problem');
        setLoading(true);
        try {
            const { data } = await axios.post('/api/ai/recommend', { query });
            setResult(data.data);
        } catch (err) {
            toast.error('AI recommendation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    const handleGoToServices = () => {
        navigate(`/services?category=${encodeURIComponent(result.category)}`);
    };
    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" style={{ maxWidth: '500px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-400)' }}>
                        <Sparkles size={20} /> AI Smart Search
                    </h3>
                    <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={18} /></button>
                </div>
                {!result ? (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                            Describe your problem naturally, and our AI will recommend the exact service category you need.
                        </p>
                        <textarea
                            className="form-input"
                            rows={4}
                            placeholder="e.g. My kitchen sink is leaking continuously and the wall is wet..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                            {loading ? <><Loader size={16} className="spin" /> Analyzing...</> : 'Find Service Match'}
                        </button>
                    </form>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'scaleIn 0.3s ease' }}>
                        <div style={{ background: 'rgba(99,102,241,0.08)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.2)' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                                Recommended Category
                            </p>
                            <h2 style={{ fontSize: '1.75rem', color: 'var(--primary-400)', marginBottom: '0.75rem' }}>
                                {result.category}
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                <strong>Reason:</strong> {result.reasoning}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="btn btn-secondary btn-full" onClick={() => setResult(null)}>
                                Try Again
                            </button>
                            <button className="btn btn-primary btn-full" onClick={handleGoToServices}>
                                View Providers <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
