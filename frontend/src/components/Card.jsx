import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/Cart';
import { useUserStore } from '../store/User';
import { LuShoppingCart, LuStar } from 'react-icons/lu';
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import toast from 'react-hot-toast';
import styles from './Card.module.scss';

const Card = ({ product }) => {
    const navigate = useNavigate();
    const { user, token, favorites, addFavorite, removeFavorite } = useUserStore();
    const { addToCart, isInCart, getCartItemQuantity } = useCartStore();
    const [isAdding, setIsAdding] = useState(false);

    const itemInCart = isInCart(product._id);
    const cartQuantity = getCartItemQuantity(product._id);

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        if (!user || !token) return toast.error('Please log in to add to cart.');

        setIsAdding(true);

        try {
            await addToCart(product, token, 1);
            toast.success(`${product.name} added to cart ✅`);
        } catch (error) {
            console.error('Cart operation failed:', error);
            toast.error('Failed to add to cart');
        } finally {
            setIsAdding(false);
        }
    };

    const toggleFavorite = async (e) => {
        e.stopPropagation();
        if (!user || !token) return toast.error('Please log in to manage favorites.');
        const isFav = favorites?.some(p => p._id === product._id);
        if (isFav) {
            await removeFavorite(product._id);
        } else {
            await addFavorite(product);
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <LuStar key={i} className={i < Math.floor(rating) ? 'filled' : 'empty'} />
        ));
    };

    const imageUrl = product?.image?.startsWith('http')
        ? product.image
        : `${import.meta.env.VITE_API_URL}${product?.image || '/placeholder.png'}`;

    return (
        <div className={styles.card}>
            <div className={styles['card-image']}>
                <img src={imageUrl} alt={product.name} />
                {user && (
                    <button
                        className={`${styles['favorite-btn']} ${favorites?.some(p => p._id === product._id) ? styles.active : ''}`}
                        onClick={toggleFavorite}
                    >
                        {favorites?.some(p => p._id === product._id) ? <MdFavorite /> : <MdFavoriteBorder />}
                    </button>
                )}
            </div>
            <div className={styles['card-content']}>
                <div className={styles['card-header']}>
                    <h3>{product.name}</h3>
                    <div className={styles['baker-info']}>
                        By <span>{product.baker?.name || 'Professional Baker'}</span>
                    </div>
                </div>
                <div className={styles.rating}>
                    <div className={styles.stars}>{renderStars(product.rating || 4.5)}</div>
                    <span className={styles['rating-text']}>
                        ({product.reviewCount || 23} reviews)
                    </span>
                </div>
                <div className={styles.price}>
                    ${product.price}
                    {product.originalPrice && <span>${product.originalPrice}</span>}
                </div>
                <div className={styles['card-actions']}>
                    <div className={styles['primary-actions']}>
                        <button
                            onClick={handleAddToCart}
                            className={`${styles['add-to-cart']} ${itemInCart ? styles.added : ''}`}
                            disabled={isAdding || itemInCart}
                        >
                            <LuShoppingCart />
                            {isAdding
                                ? 'Processing...'
                                : itemInCart
                                    ? `Added (${cartQuantity}) `
                                    : 'Add to cart'}
                        </button>
                        <button
                            className={styles['buy-now']}
                            onClick={() => navigate(`/product/${product._id}`)}
                        >
                            Customize
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Card;
