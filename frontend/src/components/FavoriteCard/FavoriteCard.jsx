import React from 'react';
import toast from 'react-hot-toast';
import { useUserStore } from '../../store/User.js';
import axios from 'axios';
import './FavoriteCard.scss';
import { RiHeartFill } from 'react-icons/ri'; // Using react-icons for the heart

export default function FavoriteCard({ product }) {
    const { token, removeFavorite } = useUserStore();

    const handleRemove = async () => {
        if (!token) return toast.error("Please log in first.");

        try {
            removeFavorite(product._id); // optimistic
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/favorites/${product._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Removed from favorites");
        } catch (err) {
            toast.error("Failed to remove favorite");
        }
    };

    const imageUrl = product?.image
        ? product.image.startsWith('http')
            ? product.image
            : `${import.meta.env.VITE_BACKEND_BASE_URL}${product.image}`
        : null;

    return (
        <div className="favorite-card">
            <button
                onClick={handleRemove}
                className="favorite-card__remove-btn"
                aria-label="Remove from favorites"
            >
                <RiHeartFill />
            </button>
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="favorite-card__image"
                />
            ) : (
                <div className="favorite-card__image-fallback">
                    <span>{product.name?.charAt(0) || 'C'}</span>
                </div>
            )}
            <div className="favorite-card__content">
                <h3 className="favorite-card__title">{product.name}</h3>
                <p className="favorite-card__description">{product.description}</p>
                <div className="favorite-card__footer">
                    <span className="favorite-card__price">{product.price} UZS</span>
                    {product.rating && (
                        <div className="favorite-card__rating">
                            <span className="star-icon">⭐</span>
                            {product.rating.average?.toFixed(1) || 'N/A'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}