import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductStore } from '../../store/Product';
import { useUserStore } from '../../store/User';
import './DashboardProductCard.scss';

const DashboardProductCard = ({ product, onDelete }) => {
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

    return (
        <div className="dashboard-product-card">
            <img src={`http://localhost:5000${product.image}`} alt={product.name} />
            <div className="product-info">
                <h4>{product.name}</h4>
                <p className="price">{product.price} ₽</p>
                <p className={`availability ${product.isAvailable ? 'available' : 'unavailable'}`}>
                    {product.isAvailable ? 'Available' : 'Not Available'}
                </p>
            </div>
            <div className="product-actions">
                <button onClick={handleEdit} className="btn-edit">Edit</button>
                <button onClick={handleDelete} className="btn-delete">Delete</button>
            </div>
        </div>
    );
};

export default DashboardProductCard;
