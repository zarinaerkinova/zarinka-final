import React, { memo } from 'react';
import { FaStar, FaUser } from "react-icons/fa6";
import { IoLocationOutline } from "react-icons/io5";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { useUserStore } from '../store/User.js';
import toast from 'react-hot-toast';
import './BakerCard.css';

const BakerCard = memo(({ baker }) => {
    const { token, bakerFavorites, addBakerFavorite, removeBakerFavorite } = useUserStore();

    const isFavorite = bakerFavorites?.some(fav => fav._id === baker._id);

    const handleToggleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent event bubbling
        if (!token) return toast.error("Please log in to save favorites.");

        try {
            if (isFavorite) {
                await removeBakerFavorite(baker._id);
                toast.success("Removed from favorites");
            } else {
                await addBakerFavorite(baker);
                toast.success("Added to favorites");
            }
        } catch (err) {
            toast.error("Could not update favorites.");
            console.error("❌ Favorite error:", err);
        }
    };

    const handleCardClick = () => {
        // Optional: Add any card click behavior here
        // For example, navigate to baker details
        // navigate(`/bakers/${baker._id}`);
    };

    return (
        <div className="specialist-card" onClick={handleCardClick}>
            <div className="specialist-card__photo">
                {baker.image && !baker.image.includes('default.png') ? (
                    <img
                        src={`${import.meta.env.VITE_API_URL}${baker.image}`}
                        alt={baker.bakery || 'Baker'}
                    />
                ) : (
                    <div className="specialist-card__initials-container">
                        <div className="specialist-card__initials">
                            {baker.name?.charAt(0) || baker.bakery?.charAt(0) || 'B'}
                        </div>
                    </div>
                )}
                <button
                    className='specialist-card__favorite'
                    onClick={handleToggleFavorite}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                    {isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
                </button>
            </div>
            <div className="specialist-card__info">
                <h3 className="specialist-card__name">{baker.bakery || 'Sweet Dreams Bakery'}</h3>
                <span className="specialist-card__specialty">by {baker.name}</span>
                <div className="specialist-card__meta">
                    <div className="specialist-card__rating">
                        <FaStar /> {baker.rate ? baker.rate.toFixed(1) : '0.0'} ({baker.raters || 0} reviews)
                    </div>
                    <div className="specialist-card__address">
                        <IoLocationOutline /> {baker.city || 'Almalyk'}
                    </div>
                </div>
                <div className="specialist-card__tags">
                    {baker.hashtags?.map(tag => 
                        <span key={tag} className="specialist-card__tag">#{tag}</span>
                    ) || <span className="specialist-card__tag">#cake</span>}
                </div>
                <div className="specialist-card__stats">
                    <div className="orders-number">Orders: {baker.orders || 0}</div>
                    <div className="price-range">Price: ${baker.minPrice || 10} - ${baker.maxPrice || 100}</div>
                </div>
                <div className="specialist-card__actions">
                    <Link to={`/bakers/${baker._id}`} className='specialist-card__button specialist-card__button--view'>
                        <FaUser /> View Profile
                    </Link>
                </div>
            </div>
        </div>
    );
});

export default BakerCard;