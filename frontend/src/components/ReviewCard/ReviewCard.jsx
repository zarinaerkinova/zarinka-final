import React from 'react';
import './ReviewCard.scss';

const ReviewCard = ({ review }) => {
    return (
        <div className="review-card">
            <div className="review-header">
                <span className="review-author">{review.user.name}</span>
                <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="review-rating">{'⭐'.repeat(review.rating)}</div>
            <p className="review-comment">{review.comment}</p>
        </div>
    );
};

export default ReviewCard;
