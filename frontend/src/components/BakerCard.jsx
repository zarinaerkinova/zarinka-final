import React from 'react';
import { FaStar, FaUser } from "react-icons/fa6";
import { IoLocationOutline } from "react-icons/io5";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { useUserStore } from '../store/User.js';
import toast from 'react-hot-toast';

const BakerCard = ({ baker }) => {
    const { token, bakerFavorites, addBakerFavorite, removeBakerFavorite } = useUserStore();

    const isFavorite = bakerFavorites?.some(fav => fav._id === baker._id);

    const handleToggleFavorite = async (e) => {
        e.preventDefault(); // prevent navigation if card is clickable
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

    return (
        <div className="specialist product_card">
            <div className="specialist-photo">
                {baker.image && !baker.image.includes('default.png') ? (
                    <img
                        src={`${import.meta.env.VITE_API_URL}${baker.image}`}
                        alt={baker.bakery || 'Baker'}
                    />
                ) : (
                    <div className="specialist-initials-container">
                        <div className="specialist-initials">
                            {baker.name?.charAt(0) || baker.bakery?.charAt(0) || 'B'}
                        </div>
                    </div>
                )}
                <button
                    className='like product_like'
                    onClick={handleToggleFavorite}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                    {isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
                </button>
            </div>
            <div className="specialist-info">
                <h3>{baker.bakery || 'Sweet Dreams Bakery'}</h3>
                <span>by {baker.name}</span>
                <div className="rate_address rate_price">
                    <div className="rate">
                        <FaStar /> {baker.rate || 5} ({baker.raters || 0} reviews)
                    </div>
                    <div className="address">
                        <IoLocationOutline /> {baker.city || 'Almalyk'}
                    </div>
                </div>
                <div className="hashtags">
                    {baker.hashtags?.map(tag => <span key={tag} className="hashtag">#{tag}</span>) || <span className="hashtag">#cake</span>}
                </div>
                <div className="orders-info">
                    <div className="orders-number">Orders: {baker.orders || 0}</div>
                    <div className="price-range">Price: ${baker.minPrice || 10} - ${baker.maxPrice || 100}</div>
                </div>
                <div className="btns">
                    <Link to={`/constructor?baker=${baker._id}`} className='order-now customize'>Order Now</Link>
                    <Link to={`/bakers/${baker._id}`} className='view'><FaUser />View Profile</Link>
                </div>
            </div>
        </div>
    );
};

export default BakerCard;
