import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '../../store/Order';
import { useUserStore } from '../../store/User';
import './CompletedOrders.scss';

const CompletedOrders = () => {
    const { completedOrders, fetchBakerOrders, deleteOrder } = useOrderStore();
    const { token } = useUserStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            fetchBakerOrders(token);
        }
    }, [token, fetchBakerOrders]);

    const handleDelete = async (orderId) => {
        try {
            await deleteOrder(token, orderId);
            // Refresh the orders list after successful deletion
            fetchBakerOrders(token);
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    };

    return (
        <div className='completed-orders-page'>
            <h1>Завершенные заказы</h1>
            {completedOrders.length > 0 ? (
                completedOrders.map(order => (
                    <div key={order._id} className='order-card'>
                        <div className='order-details'>
                            <div className='customer-info'>
                                <h4>Customer</h4>
                                <p><strong>Name:</strong> {order.deliveryInfo?.name || '—'}</p>
                                <p><strong>Phone:</strong> {order.deliveryInfo?.phone || '—'}</p>
                                <p><strong>Address:</strong>{' '}
                                    {order.deliveryMethod === 'delivery' && order.deliveryInfo
                                        ? `${order.deliveryInfo?.streetAddress || ''}, ${order.deliveryInfo?.city || ''}, ${order.deliveryInfo?.zipCode || ''}`
                                        : 'Pickup'}
                                </p>
                                <p><strong>Delivery Type:</strong> {order.deliveryMethod}</p>
                                <p><strong>Payment Type:</strong> {order.paymentMethod}</p>
                            </div>
                            <div className='item-info'>
                                <h4>Items</h4>
                                {order.items.map(item => (
                                    <div
                                        key={item.product?._id || Math.random()}
                                        className='item'
                                    >
                                        <img
                                            src={
                                                item.product?.image
                                                    ? `${import.meta.env.VITE_BACKEND_BASE_URL}${item.product.image}`
                                                    : '/placeholder.png'
                                            }
                                            alt={item.product?.name || 'Product'}
                                        />
                                        <div>
                                            <p>{item.product?.name || '—'}</p>
                                            <p><strong>Price:</strong> {item.product?.price ?? '—'} ₽</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className='order-actions'>
                            <button
                                onClick={() => handleDelete(order._id)}
                                className='btn-delete'
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <p>Нет завершенных заказов.</p>
            )}
        </div>
    );
};

export default CompletedOrders;
