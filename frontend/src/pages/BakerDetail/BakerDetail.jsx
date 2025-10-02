import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useBakerStore } from '../../store/Baker.js'
import { useProductStore } from '../../store/Product.js'
import { useFavoriteStore } from '../../store/Favorite.js'
import { useLoadingStore } from '../../store/Loading.js'
import { useReviewStore } from '../../store/review.js'
import Card from '../../components/Card.jsx'
import ReviewCard from '../../components/ReviewCard/ReviewCard.jsx'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import './BakerDetail.scss'

const BakerDetail = () => {
    const { bakerId } = useParams()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview') // Changed default to 'overview'
    const [selectedGalleryImage, setSelectedGalleryImage] = useState(null)

    const { selectedBaker, error, fetchBakerById, clearSelectedBaker } = useBakerStore()
    const { bakerProducts: products, fetchProductsByBaker } = useProductStore()
    const { bakerReviews, fetchBakerReviews } = useReviewStore()
    const addToFavorite = useFavoriteStore(state => state.addToFavorite)
    const removeFromFavorite = useFavoriteStore(state => state.removeFromFavorite)
    const favorites = useFavoriteStore(state => state.favorites)
    const { loading } = useLoadingStore()

    const isFavorite = selectedBaker ? favorites.some(fav => fav._id === selectedBaker._id) : false

    useEffect(() => {
        if (bakerId) {
            fetchBakerById(bakerId)
            fetchProductsByBaker(bakerId)
            fetchBakerReviews(bakerId)
        }
        return () => clearSelectedBaker()
    }, [bakerId, fetchBakerById, fetchProductsByBaker, clearSelectedBaker, fetchBakerReviews])

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setSelectedGalleryImage(null);
            }
        };

        if (selectedGalleryImage) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedGalleryImage]);

    const handleFavoriteToggle = () => {
        if (selectedBaker) {
            if (isFavorite) {
                removeFromFavorite(selectedBaker._id)
            } else {
                addToFavorite(selectedBaker)
            }
        }
    }

    const handleOrderCustomCake = () => {
        if (selectedBaker) {
            navigate(`/customize-cake/${selectedBaker._id}`)
        }
    }

    const normalizeDate = date => {
        const d = new Date(date)
        d.setHours(0, 0, 0, 0)
        return d
    }

    const unavailableDates = selectedBaker?.unavailableDates?.map(d => normalizeDate(d).getTime()) || []
    const busyDates = selectedBaker?.busyDates?.map(d => normalizeDate(d).getTime()) || []

    const isPastDate = date => {
        const today = normalizeDate(new Date())
        const normalizedDate = normalizeDate(date)
        return normalizedDate.getTime() < today.getTime()
    }

    const getStatus = date => {
        const normalizedDate = normalizeDate(date).getTime()
        if (unavailableDates.includes(normalizedDate)) {
            return 'unavailable'
        } else if (busyDates.includes(normalizedDate)) {
            return 'busy'
        } else {
            return 'available'
        }
    }

    const calculateRating = () => {
        if (!bakerReviews || bakerReviews.length === 0) return 0
        const total = bakerReviews.reduce((sum, review) => sum + (review.rating || 0), 0)
        return (total / bakerReviews.length).toFixed(1)
    }

    const tabs = [        
        { id: 'overview', label: 'Overview', icon: '📋' },
        { id: 'cakes', label: 'Cakes', icon: '🧁' },
        { id: 'gallery', label: 'Gallery', icon: '📸' },
        { id: 'reviews', label: 'Reviews', icon: '⭐' },
        { id: 'availability', label: 'Availability', icon: '📅' },
    ]

    if (loading) {
        return (
            <div className="baker-detail-loading">
                <div className="loading-spinner"></div>
                <p>Loading baker details...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="baker-detail-error">
                <div className="error-icon">⚠️</div>
                <p>{error}</p>
                <button onClick={() => navigate('/bakers')} className="back-button">
                    Back to Bakers
                </button>
            </div>
        )
    }

    if (!selectedBaker) {
        return (
            <div className="baker-detail-not-found">
                <div className="not-found-icon">🔍</div>
                <p>Baker not found</p>
                <button onClick={() => navigate('/bakers')} className="back-button">
                    Back to Bakers
                </button>
            </div>
        )
    }

    const imageUrl = selectedBaker.image ? `${import.meta.env.VITE_API_URL}${selectedBaker.image}` : null
    const rating = calculateRating()

    return (
        <div className="baker-detail">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-background">
                    <div className="hero-overlay"></div>
                </div>
                
                <div className="hero-content">
                    <div className="baker-profile">
                        <div className="profile-image-container">
                            {imageUrl ? (
                                <img src={imageUrl} alt={selectedBaker.bakeryName || 'Baker'} className="profile-image" />
                            ) : (
                                <div className="profile-initials">
                                    {selectedBaker.name?.charAt(0) || selectedBaker.bakeryName?.charAt(0) || 'B'}
                                </div>
                            )}
                            <div className="online-status"></div>
                        </div>
                        
                        <div className="profile-info">
                            <div className="profile-header">
                                <h1 className="bakery-name">{selectedBaker.bakeryName}</h1>
                                <button 
                                    className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
                                    onClick={handleFavoriteToggle}
                                >
                                    <span className="heart-icon">{isFavorite ? '❤️' : '🤍'}</span>
                                </button>
                            </div>
                            
                            <h2 className="baker-name">by {selectedBaker.name}</h2>
                            
                            <div className="profile-stats">
                                <div className="stat">
                                    <span className="stat-value">{rating}</span>
                                    <span className="stat-label">Rating</span>
                                    <div className="stars">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <span key={star} className={`star ${star <= rating ? 'filled' : ''}`}>★</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">{bakerReviews?.length || 0}</span>
                                    <span className="stat-label">Reviews</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">{products?.length || 0}</span>
                                    <span className="stat-label">Products</span>
                                </div>
                            </div>
                            
                            <div className="profile-meta">
                                <div className="meta-item">
                                    <span className="meta-icon">📍</span>
                                    <span>{selectedBaker.location || 'Location not specified'}</span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-icon">💰</span>
                                    <span>{selectedBaker.priceRange || 'Price range not specified'}</span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-icon">📞</span>
                                    <span>{selectedBaker.phone || 'Phone not specified'}</span>
                                </div>
                            </div>
                            
                            <p className="baker-bio">{selectedBaker.bio || 'No description available.'}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Navigation */}
            <nav className="content-nav">
                <div className="nav-container">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="tab-icon">{tab.icon}</span>
                            <span className="tab-label">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </nav>

            {/* Content Sections */}
            <main className="content-sections">
                {activeTab === 'overview' && (
                    <section className="overview-section">
                        <div className="section-header">
                            <h2>Overview</h2>
                            <p>Complete information about this baker</p>
                        </div>
                        <div className="section-grid">
                            {/* Specialties */}
                            {selectedBaker.specialties && selectedBaker.specialties.length > 0 && (
                                <div className="info-card">
                                    <h3 className="card-title">
                                        <span className="title-icon">✨</span>
                                        Specialties
                                    </h3>
                                    <div className="specialties-grid">
                                        {selectedBaker.specialties.map((specialty, index) => (
                                            <span key={index} className="specialty-tag">
                                                {specialty}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Constructor Options */}
                            {selectedBaker.constructorOptions && (
                                <div className="info-card">
                                    <h3 className="card-title">
                                        <span className="title-icon">🎨</span>
                                        Customization Options
                                    </h3>
                                    <p className="card-description">{selectedBaker.constructorOptions}</p>
                                </div>
                            )}

                            {/* Quick Stats */}
                            <div className="info-card">
                                <h3 className="card-title">
                                    <span className="title-icon">📊</span>
                                    Quick Info
                                </h3>
                                <div className="quick-stats">
                                    <div className="quick-stat">
                                        <span className="quick-stat-label">Max Orders/Day</span>
                                        <span className="quick-stat-value">
                                            {selectedBaker.orderSettings?.maxOrders || 'Not specified'}
                                        </span>
                                    </div>
                                    <div className="quick-stat">
                                        <span className="quick-stat-label">Lead Time</span>
                                        <span className="quick-stat-value">
                                            {selectedBaker.orderSettings?.leadTime ? 
                                                `${selectedBaker.orderSettings.leadTime} hours` : 
                                                'Not specified'}
                                        </span>
                                    </div>
                                    <div className="quick-stat">
                                        <span className="quick-stat-label">Auto Accept</span>
                                        <span className="quick-stat-value">
                                            {selectedBaker.orderSettings?.autoAccept ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === 'cakes' && (
                    <section className="cakes-section">
                        <div className="section-header">
                            <h2>Available Cakes</h2>
                            <p>Ready-made cakes from this baker</p>
                        </div>
                        {products.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🍰</div>
                                <h3>No Ready-Made Cakes</h3>
                                <p>This baker doesn't have ready-made cakes yet, but you can order a custom one!</p>
                            </div>
                        ) : (
                            <div className="products-grid">
                                {products.map(product => (
                                    <Card key={product._id} product={product} />
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'gallery' && (
                    <section className="gallery-section">
                        <div className="section-header">
                            <h2>Gallery</h2>
                            <p>Showcase of beautiful cakes and creations</p>
                        </div>
                        {selectedBaker.gallery && selectedBaker.gallery.length > 0 ? (
                            <div className="gallery-grid">
                                {selectedBaker.gallery.map((imgUrl, index) => (
                                    <div 
                                        key={index} 
                                        className="gallery-item"
                                        onClick={() => setSelectedGalleryImage(`${import.meta.env.VITE_API_URL}${imgUrl}`)}
                                    >
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}${imgUrl}`}
                                            alt={`Gallery ${index + 1}`}
                                            className="gallery-image"
                                        />
                                        <div className="gallery-overlay">
                                            <span className="view-icon">🔍</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">📸</div>
                                <h3>No Gallery Images</h3>
                                <p>This baker hasn't uploaded gallery images yet.</p>
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'reviews' && (
                    <section className="reviews-section">
                        <div className="section-header">
                            <h2>Customer Reviews</h2>
                            <p>What customers say about this baker</p>
                        </div>
                        {bakerReviews.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">💬</div>
                                <h3>No Reviews Yet</h3>
                                <p>Be the first to leave a review for this baker!</p>
                            </div>
                        ) : (
                            <div className="reviews-grid">
                                {bakerReviews.map(review => (
                                    <ReviewCard key={review._id} review={review} />
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'availability' && (
                    <section className="availability-section">
                        <div className="section-header">
                            <h2>Availability & Schedule</h2>
                            <p>Baker's working hours and available dates</p>
                        </div>
                        
                        <div className="availability-grid">
                            {/* Working Hours */}
                            <div className="availability-card">
                                <h3 className="card-title">
                                    <span className="title-icon">🕐</span>
                                    Working Hours
                                </h3>
                                {selectedBaker.workingHours && Object.keys(selectedBaker.workingHours).length > 0 ? (
                                    <div className="working-hours">
                                        {Object.entries(selectedBaker.workingHours).map(([day, hours]) => (
                                            <div key={day} className={`working-day ${hours.enabled ? 'open' : 'closed'}`}>
                                                <span className="day-name">
                                                    {day.charAt(0).toUpperCase() + day.slice(1)}
                                                </span>
                                                <span className="day-hours">
                                                    {hours.enabled ? `${hours.from} - ${hours.to}` : 'Closed'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="card-description">Working hours not specified.</p>
                                )}
                            </div>

                            {/* Vacation Status */}
                            <div className="availability-card">
                                <h3 className="card-title">
                                    <span className="title-icon">🏖️</span>
                                    Vacation Status
                                </h3>
                                {selectedBaker.vacationMode ? (
                                    <div className="vacation-info">
                                        <div className="vacation-status on-vacation">Currently on vacation</div>
                                        {selectedBaker.vacationDetails && (
                                            <div className="vacation-details">
                                                <p><strong>Reason:</strong> {selectedBaker.vacationDetails.reason || 'No message'}</p>
                                                <p><strong>From:</strong> {selectedBaker.vacationDetails.from ? 
                                                    new Date(selectedBaker.vacationDetails.from).toLocaleDateString() : 'N/A'}</p>
                                                <p><strong>To:</strong> {selectedBaker.vacationDetails.to ? 
                                                    new Date(selectedBaker.vacationDetails.to).toLocaleDateString() : 'N/A'}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="vacation-status available">Available for orders</div>
                                )}
                            </div>

                            {/* Calendar */}
                            <div className="availability-card calendar-card">
                                <h3 className="card-title">
                                    <span className="title-icon">📅</span>
                                    Availability Calendar
                                </h3>
                                <div className="calendar-legend">
                                    <div className="legend-item">
                                        <span className="legend-color available"></span>
                                        <span>Available</span>
                                    </div>
                                    <div className="legend-item">
                                        <span className="legend-color busy"></span>
                                        <span>Busy</span>
                                    </div>
                                    <div className="legend-item">
                                        <span className="legend-color unavailable"></span>
                                        <span>Unavailable</span>
                                    </div>
                                </div>
                                <div className="calendar-wrapper">
                                    <Calendar
                                        onClickDay={() => {}}
                                        tileDisabled={({ date, view }) => view === 'month' && isPastDate(date)}
                                        tileClassName={({ date, view }) => {
                                            let classes = []
                                            if (view === 'month') {
                                                classes.push(getStatus(date))
                                                const today = new Date()
                                                today.setHours(0, 0, 0, 0)
                                                const normalizedDate = new Date(date)
                                                normalizedDate.setHours(0, 0, 0, 0)

                                                if (normalizedDate.getTime() === today.getTime()) {
                                                    classes.push('today')
                                                } else if (normalizedDate.getTime() < today.getTime()) {
                                                    classes.push('past-date')
                                                }
                                            }
                                            return classes.join(' ')
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {/* Gallery Modal */}
            {selectedGalleryImage && (
                <div className="gallery-modal" onClick={() => setSelectedGalleryImage(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedGalleryImage(null)}>
                            ×
                        </button>
                        <img src={selectedGalleryImage} alt="Gallery" className="modal-image" />
                    </div>
                </div>
            )}
        </div>
    )
}

export default BakerDetail