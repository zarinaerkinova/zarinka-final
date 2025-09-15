import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUserStore } from '../../store/User';
import './BakerReviews.scss';

const BakerReviews = () => {
    const { token } = useUserStore();
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await axios.get('/api/reviews/baker', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setReviews(res.data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };

        if (token) {
            fetchReviews();
        }
    }, [token]);

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className="star">
                    {i <= rating ? '★' : '☆'}
                </span>
            );
        }
        return stars;
    };

    return (
        <div className="reviews-container">
            <h1>Baker Reviews</h1>
            {reviews.length === 0 ? (
                <p>No reviews found.</p>
            ) : (
                <div className="reviews-list">
                    {reviews.map(review => (
                        <div key={review._id} className="review-card">
                            <div className="review-header">
                                <div className="user-info">{review.user?.name}</div>
                                <div className="rating">{renderStars(review.rating)}</div>
                            </div>
                            <p className="review-body">{review.comment}</p>
                            <div className="review-footer">
                                <span>Product: <span className="product-name">{review.product?.name}</span></span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BakerReviews;