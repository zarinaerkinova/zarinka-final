import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useBakerStore } from '../../store/Baker.js';
import { useProductStore } from '../../store/Product.js';
import { useFavoriteStore } from '../../store/Favorite.js'; // Assuming a favorite store for bakers
import Card from '../../components/Card.jsx';
import './BakerDetail.scss';

const BakerDetail = () => {
    const { bakerId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('cakes'); // 'cakes', 'gallery', 'reviews', 'availability'

    const {
        selectedBaker,
        error,
        loading,
        fetchBakerById,
        clearSelectedBaker
    } = useBakerStore();

    const {
        bakerProducts: products,
        fetchProductsByBaker
    } = useProductStore();

    const addToFavorite = useFavoriteStore((state) => state.addToFavorite);
    const removeFromFavorite = useFavoriteStore((state) => state.removeFromFavorite);
    const favorites = useFavoriteStore((state) => state.favorites);

    const isFavorite = selectedBaker ? favorites.some(fav => fav._id === selectedBaker._id) : false;

    // Fetch baker details
    useEffect(() => {
        if (bakerId) {
            fetchBakerById(bakerId);
            fetchProductsByBaker(bakerId);
        }
        return () => clearSelectedBaker();
    }, [bakerId, fetchBakerById, fetchProductsByBaker, clearSelectedBaker]);



    const handleFavoriteToggle = () => {
        if (selectedBaker) {
            if (isFavorite) {
                removeFromFavorite(selectedBaker._id);
            } else {
                addToFavorite(selectedBaker);
            }
        }
    };

    const handleOrderCustomCake = () => {
        if (selectedBaker) {
            navigate(`/customize-cake/${selectedBaker._id}`); // Navigate to a custom cake constructor page
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!selectedBaker) return <p>No baker found.</p>;

    const imageUrl = selectedBaker.image ? `${import.meta.env.VITE_API_URL}${selectedBaker.image}` : null;
    if (imageUrl) {
        console.log("Baker image URL:", imageUrl);
    }

    return (
        <main className="baker-detail-page">
            <div className="baker-top-card">
                <div className="baker-image-section">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={selectedBaker.bakeryName || 'Baker'}
                            className="baker-profile-image"
                        />
                    ) : (
                        <div className="baker-initials">
                            {selectedBaker.name?.charAt(0) || selectedBaker.bakeryName?.charAt(0) || 'B'}
                        </div>
                    )}
                </div>
                <div className="baker-info-section">
                    <h1 className="bakery-name">{selectedBaker.bakeryName}</h1>
                    <h2 className="baker-name">{selectedBaker.name}</h2>
                    <div className="baker-location-price">
                        <span className="baker-location">📍 {selectedBaker.location || 'Location not specified'}</span>
                        <span className="baker-price-range">💰 {selectedBaker.priceRange || 'Price range not specified'}</span>
                    </div>
                    <p className="baker-description">{selectedBaker.bio || 'Описание отсутствует.'}</p>
                    <div className="baker-contact-info">
                        <span>📞 {selectedBaker.phone || 'Phone not specified'}</span>
                    </div>
                    <div className="baker-specialties">
                        {selectedBaker.specialties && selectedBaker.specialties.length > 0 && (
                            <>
                                <h4>Specialties:</h4>
                                <div className="specialties-list">
                                    {selectedBaker.specialties.map((specialty, index) => (
                                        <span key={index} className="specialty-tag">{specialty}</span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                    <div className="baker-constructor-options">
                        {selectedBaker.constructorOptions && (
                            <>
                                <h4>Constructor Options:</h4>
                                <p>{selectedBaker.constructorOptions}</p>
                            </>
                        )}
                    </div>
                    <div className="baker-actions">
                        <button className="favorite-button" onClick={handleFavoriteToggle}>
                            {isFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
                        </button>
                    </div>
                </div>
            </div>

            <nav className="baker-navbar">
                <button className={activeTab === 'cakes' ? 'active' : ''} onClick={() => setActiveTab('cakes')}>Ready-made Cakes</button>
                <button className={activeTab === 'gallery' ? 'active' : ''} onClick={() => setActiveTab('gallery')}>Gallery</button>
                <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>Reviews</button>
                <button className={activeTab === 'availability' ? 'active' : ''} onClick={() => setActiveTab('availability')}>Availability</button>
            </nav>

            <div className="baker-content-section">
                {activeTab === 'cakes' && (
                    <div className="baker-products">
                        <h2>Ready-made Cakes</h2>
                        {products.length === 0 ? (
                            <p>This baker has no ready-made cakes yet.</p>
                        ) : (
                            <div className="product-list">
                                {products.map((product) => (
                                    <Card key={product._id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'gallery' && (
                    <div className="baker-gallery">
                        <h2>Gallery</h2>
                        <div className="gallery-grid">
                            {selectedBaker.gallery && selectedBaker.gallery.length > 0 ? (
                                selectedBaker.gallery.map((imgUrl, index) => (
                                    <img 
                                        key={index} 
                                        src={`${import.meta.env.VITE_API_URL}${imgUrl}`}
                                        alt={`Gallery ${index + 1}`} 
                                        className="gallery-image" 
                                    />
                                ))
                            ) : (
                                <p>No gallery images available.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="baker-reviews">
                        <h2>Reviews</h2>
                        <p>Reviews section coming soon.</p>
                    </div>
                )}

                {activeTab === 'availability' && (
                    <div className="baker-availability">
                        <h2>Availability</h2>
                        <div className="availability-details">
                            <p><strong>Maximum Orders Per Day:</strong> {selectedBaker.maxOrdersPerDay || 'Not specified'}</p>
                            <h4>Working Hours:</h4>
                            {selectedBaker.workingHours && Object.keys(selectedBaker.workingHours).length > 0 ? (
                                <ul className="working-hours-list">
                                    {Object.keys(selectedBaker.workingHours).map(day => (
                                        <li key={day}>
                                            <strong>{day}:</strong> {selectedBaker.workingHours[day].from} - {selectedBaker.workingHours[day].to}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Working hours not specified.</p>
                            )}

                            <h4>Vacation Mode:</h4>
                            <p>{selectedBaker.isVacationMode ? 'Currently on vacation' : 'Not on vacation'}</p>
                            {selectedBaker.isVacationMode && (
                                <>
                                    <p><strong>Vacation Message:</strong> {selectedBaker.vacationMessage || 'No message'}</p>
                                    <p><strong>Vacation Period:</strong> {selectedBaker.vacationStartDate ? new Date(selectedBaker.vacationStartDate).toLocaleDateString() : 'N/A'} - {selectedBaker.vacationEndDate ? new Date(selectedBaker.vacationEndDate).toLocaleDateString() : 'N/A'}</p>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default BakerDetail; 
