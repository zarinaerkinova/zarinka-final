import React, { useEffect } from 'react';
import { useOrderStore } from '../../store/Order';
import { useUserStore } from '../../store/User';
import { useNavigate } from 'react-router-dom';
import './BakerOrders.scss';

const BakerOrders = () => {
  const { allBakerOrders, fetchBakerOrders } = useOrderStore();
  const { token } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/register');
    } else {
      fetchBakerOrders(token);
    }
  }, [token, fetchBakerOrders, navigate]);

  return (
    <div className="baker-orders-page">
      <h1>All My Orders</h1>
      <div className="order-list">
        {allBakerOrders.length > 0 ? (
          allBakerOrders.map(order => (
            <div key={order._id} className="order-card">
              <h2>Order ID: {order._id}</h2>
              <p>Status: {order.status}</p>
              <p>Total: ${order.totalAmount}</p>
            </div>
          ))
        ) : (
          <p>No orders found.</p>
        )}
      </div>
    </div>
  );
};

export default BakerOrders;
