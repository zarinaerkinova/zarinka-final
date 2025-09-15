import React from 'react';
import './FavoriteBakerCard.scss';
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { useUserStore } from '../../store/User.js';

const FavoriteBakerCard = ({ baker }) => {
    const { bakerFavorites, removeBakerFavorite, addBakerFavorite, token } = useUserStore();

    const isFavorite = bakerFavorites.some(b => b._id === baker._id);

    const handleToggleFavorite = () => {
        if (!token) return alert("Please log in to manage favorites.");
        if (isFavorite) removeBakerFavorite(baker._id);
        else addBakerFavorite(baker);
    };

    return (
        <div className="favorite-baker-card">
            <button
                className="like-btn"
                onClick={handleToggleFavorite}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
                {isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
            </button>

            <div className="baker-photo">
                {baker.img ? (
                    <img
                        src={`http://localhost:5000/uploads/${baker.img}`}
                        alt={baker.name || 'Baker'}
                    />
                ) : (
                    <div className="baker-initials">
                        {baker.bakery?.charAt(0) || baker.name?.charAt(0) || 'B'}
                    </div>
                )}
            </div>

            <div className="baker-info">
                <h3>{baker.bakery || 'Unknown Bakery'}</h3>
                <p>by {baker.name || 'Unknown'}</p>
                <div className="baker-details">
                    <span className="rate">⭐ {baker.rate || 5}</span>
                    <span className="city">{baker.city || 'Unknown City'}</span>
                </div>
            </div>
        </div>
    );
};

export default FavoriteBakerCard;
