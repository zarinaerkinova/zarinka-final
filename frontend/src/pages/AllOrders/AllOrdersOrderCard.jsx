import React from 'react';
import CakeAccordion from '../../components/CakeAccordion.jsx';
import IngredientsTooltip from '../../components/IngredientsTooltip/IngredientsTooltip.jsx';
import './AllOrdersOrderCard.scss';

const AllOrdersOrderCard = ({
  order,
  isExpanded,
  onToggleExpandOrder,
  expandedCakeId,
  onToggleExpandCake,
}) => {
  const orderDate = new Date(order.createdAt).toLocaleDateString();
  const orderTime = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`all-orders-order-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="order-summary" onClick={() => onToggleExpandOrder(order._id)}>
        <div className="order-info">
          <p className="order-id">Order ID: {order._id}</p>
          <p className="customer-name">Customer: {order.customerName || order.user?.name}</p>
          <p className="order-date">Date: {orderDate} {orderTime}</p>
        </div>
        <div className="order-details">
          <p className="order-amount">Total: ${order.totalPrice?.toFixed(2)}</p>
          <p className={`order-status status-${order.status.toLowerCase().replace(/ /g, '-')}`}>
            Status: {order.status}
          </p>
        </div>
      </div>

      {isExpanded && (
        <div className="order-cakes-list">
          <h4>Cakes in this Order:</h4>
          {order.items.map((item) => (
            <CakeAccordion
              key={item._id || item.product?._id || item.name}
              title={item.product?.name || item.name}
              isExpanded={expandedCakeId === (item._id || item.product?._id || item.name)}
              onToggle={() => onToggleExpandCake(item._id || item.product?._id || item.name)}
            >
              <div className="cake-detail-content">
                {item.product?.image && (
                  <img
                    src={`http://localhost:5000${item.product.image}`}
                    alt={item.product.name}
                    className="cake-image"
                  />
                )}
                <p><strong>Quantity:</strong> {item.quantity}</p>
                {item.selectedSize && <p><strong>Size:</strong> {item.selectedSize.label}</p>}
                {item.product?.description && <p><strong>Description:</strong> {item.product.description}</p>}

                <IngredientsTooltip ingredients={item.customizedIngredients?.length > 0 ? item.customizedIngredients : item.product?.ingredients} />
                
                <p><strong>Price:</strong> ${item.price?.toFixed(2) || item.product?.price?.toFixed(2)}</p>
              </div>
            </CakeAccordion>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllOrdersOrderCard;
