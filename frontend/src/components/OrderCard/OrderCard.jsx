import React from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderCard.scss';

const OrderCard = ({ order }) => {
    const navigate = useNavigate();

    return (
        <div className="order-card">
            <div className="order-card__header">
                <h3>Order ID: {order._id}</h3>
                <span className={`order-card__status order-card__status--${order.status.toLowerCase().replace(' ', '-')}`}>
                    {order.status}
                </span>
            </div>
            <div className="order-card__body">
                <p><strong>Bakery:</strong> {order.bakeryName || 'N/A'}</p>
                <p><strong>Price:</strong> ${order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}</p>
                <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="order-card__actions">
                <button onClick={() => navigate(`/my-orders/${order._id}`)} className="order-card__view-button">
                    View Items
                </button>
            </div>
        </div>
    );
};

export default OrderCard;
