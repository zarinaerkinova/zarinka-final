import React, { useState, useEffect } from 'react';
import { useOrderStore } from '../../store/Order';
import { useUserStore } from '../../store/User';
import { useNavigate } from 'react-router-dom';
import './BakerOrders.scss';

const BakerOrders = () => {
  const [showNewOrders, setShowNewOrders] = useState(true);
  const { allBakerOrders, fetchBakerOrders, loading } = useOrderStore();
  const { token } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/register');
    } else {
      fetchBakerOrders(token);
    }
  }, [token, fetchBakerOrders, navigate]);

  const newOrders = allBakerOrders.filter(order => order.status === 'pending');
  const otherOrders = allBakerOrders.filter(order => order.status !== 'pending');

  const renderOrderList = (orders) => {
    return orders.map(order => (
      <div key={order._id} className="order-card">
        <h2>Order ID: {order.orderNumber}</h2>
        <p>Status: {order.status}</p>
        <div className="order-items">
          {order.items.map((item, index) => (
            <div key={index} className="order-item">
              <p><strong>{item.name}</strong> - {item.quantity} x ${item.price.toFixed(2)}</p>
              {item.customizedIngredients && item.customizedIngredients.length > 0 && (
                <div className="custom-ingredients">
                  <strong>Custom Ingredients:</strong>
                  <ul>
                    {item.customizedIngredients.map(ingredient => (
                      <li key={ingredient.id}>{ingredient.name} - ${ingredient.price.toFixed(2)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
        <p>Total: ${order.totalPrice.toFixed(2)}</p>
      </div>
    ));
  };

  return (
    <div className='baker-orders-page'>
      <div className='toggle-buttons'>
        <button
          onClick={() => setShowNewOrders(true)}
          className={showNewOrders ? 'active' : ''}
        >
          NEW order ({newOrders.length})
        </button>
        <button
          onClick={() => setShowNewOrders(false)}
          className={!showNewOrders ? 'active' : ''}
        >
          ALL Orders ({otherOrders.length})
        </button>
      </div>
      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <div>
          {showNewOrders ? (
            <div>
              {newOrders.length > 0 ? renderOrderList(newOrders) : <p>No new orders.</p>}
            </div>
          ) : (
            <div>
              {otherOrders.length > 0 ? renderOrderList(otherOrders) : <p>No other orders.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BakerOrders;
