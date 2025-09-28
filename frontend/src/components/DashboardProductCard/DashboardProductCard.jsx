import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductStore } from '../../store/Product';
import { useUserStore } from '../../store/User';
import './DashboardProductCard.scss';

const DashboardProductCard = ({ product, onDelete, onToggleAvailability }) => {
    const { token } = useUserStore();
    const { deleteProduct } = useProductStore();
    const navigate = useNavigate();

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await deleteProduct(product._id, token);
            if (onDelete) {
                onDelete();
            }
        }
    };

    const handleEdit = () => {
        navigate(`/edit-product/${product._id}`);
    };

    const handleToggleAvailability = () => {
        if (onToggleAvailability) {
            onToggleAvailability(product._id, !product.isAvailable);
        }
    };

    return (
        <div className={`dashboard-product-card ${!product.isAvailable ? 'unavailable' : ''}`}>
            <img src={`http://localhost:5000${product.image}`} alt={product.name} />
            <div className="product-info">
                <h4>{product.name}</h4>
                <p className="price">{product.price} ₽</p>
                {product.rating && product.rating.average !== undefined && (
                    <div className="product-rating">
                        <span className="rating-stars">
                            {Array.from({ length: 5 }, (_, i) => (
                                <span key={i} className={`star ${i < Math.floor(product.rating.average) ? 'filled' : ''}`}>
                                    ★
                                </span>
                            ))}
                        </span>
                        <span className="rating-value">{product.rating.average.toFixed(1)}</span>
                    </div>
                )}
                <button 
                    className={`availability-toggle ${product.isAvailable ? 'active' : 'inactive'}`}
                    onClick={handleToggleAvailability}
                    aria-label={product.isAvailable ? 'Mark as unavailable' : 'Mark as available'}
                >
                    {product.isAvailable ? '👁️' : '🚫'}
                </button>
            </div>
            <div className="product-actions">
                <button onClick={handleEdit} className="btn-edit">Edit</button>
                <button onClick={handleDelete} className="btn-delete">Delete</button>
            </div>
        </div>
    );
};

export default DashboardProductCard;