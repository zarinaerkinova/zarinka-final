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
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const orderTime = new Date(order.createdAt).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const getStatusIcon = (status) => {
    const statusMap = {
      'pending': '⏳',
      'accepted': '✅',
      'confirmed': '✅',
      'shipped': '🚚',
      'completed': '🎉',
      'cancelled': '❌',
      'rejected': '❌'
    };
    return statusMap[status.toLowerCase()] || '📋';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'pending': 'warning',
      'accepted': 'success',
      'confirmed': 'success',
      'shipped': 'info',
      'completed': 'completed',
      'cancelled': 'danger',
      'rejected': 'danger'
    };
    return colorMap[status.toLowerCase()] || 'default';
  };

  return (
    <div className={`order-card ${isExpanded ? 'expanded' : ''}`}>
      {/* Animated Background */}
      <div className="order-card__bg-animation"></div>
      
      {/* Header Section */}
      <div className="order-card__header" onClick={() => onToggleExpandOrder(order._id)}>
        <div className="order-card__main-info">
          <div className="order-card__id-section">
            <span className="order-card__label">Order</span>
            <h3 className="order-card__id">#{order._id.slice(-8).toUpperCase()}</h3>
          </div>
          
          <div className="order-card__customer-info">
            <div className="order-card__customer">
              <span className="order-card__customer-icon">👤</span>
              <span className="order-card__customer-name">
                {order.customerName || order.user?.name || 'Guest Customer'}
              </span>
            </div>
            <div className="order-card__datetime">
              <span className="order-card__date">{orderDate}</span>
              <span className="order-card__time">{orderTime}</span>
            </div>
          </div>
        </div>

        <div className="order-card__summary">
          <div className="order-card__amount-section">
            <span className="order-card__amount-label">Total Amount</span>
            <div className="order-card__amount">${order.totalPrice?.toFixed(2) || '0.00'}</div>
          </div>
          
          <div className="order-card__status-section">
            <div className={`order-card__status status-${getStatusColor(order.status)}`}>
              <span className="order-card__status-icon">
                {getStatusIcon(order.status)}
              </span>
              <span className="order-card__status-text">{order.status}</span>
            </div>
            
            <div className="order-card__expand-btn">
              <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                &#8250;
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Count Badge */}
      <div className="order-card__items-badge">
        <span className="items-count">{order.items?.length || 0}</span>
        <span className="items-label">item{order.items?.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="order-card__content">
          <div className="order-card__content-header">
            <h4 className="content-title">
              <span className="content-title__icon">🎂</span>
              Order Details
              <div className="content-title__line"></div>
            </h4>
          </div>

          <div className="order-card__items-list">
            {order.items?.map((item, index) => (
              <div key={item._id || item.product?._id || `${item.name}-${index}`} className="cake-item-wrapper">
                <CakeAccordion
                  title={
                    <div className="cake-accordion-title">
                      <span className="cake-title-main">{item.product?.name || item.name}</span>
                      <div className="cake-title-meta">
                        <span className="cake-quantity">Qty: {item.quantity}</span>
                        <span className="cake-price">${item.price?.toFixed(2) || item.product?.price?.toFixed(2)}</span>
                      </div>
                    </div>
                  }
                  isExpanded={expandedCakeId === (item._id || item.product?._id || item.name)}
                  onToggle={() => onToggleExpandCake(item._id || item.product?._id || item.name)}
                >
                  <div className="cake-details">
                    <div className="cake-details__content">
                      {item.product?.image && (
                        <div className="cake-image-container">
                          <img
                            src={`http://localhost:5000${item.product.image}`}
                            alt={item.product.name}
                            className="cake-image"
                          />
                          <div className="image-overlay"></div>
                        </div>
                      )}
                      
                      <div className="cake-info">
                        <div className="cake-info__grid">
                          <div className="info-item">
                            <span className="info-label">Quantity</span>
                            <span className="info-value">{item.quantity}</span>
                          </div>
                          
                          {item.selectedSize && (
                            <div className="info-item">
                              <span className="info-label">Size</span>
                              <span className="info-value">{item.selectedSize.label}</span>
                            </div>
                          )}
                          
                          <div className="info-item">
                            <span className="info-label">Price</span>
                            <span className="info-value price">
                              ${item.price?.toFixed(2) || item.product?.price?.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {item.product?.description && (
                          <div className="cake-description">
                            <h5>Description</h5>
                            <p>{item.product.description}</p>
                          </div>
                        )}

                        <div className="cake-ingredients">
                          <IngredientsTooltip 
                            ingredients={
                              item.customizedIngredients?.length > 0 
                                ? item.customizedIngredients 
                                : item.product?.ingredients
                            } 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CakeAccordion>
              </div>
            ))}
          </div>

          {/* Order Summary Footer */}
          <div className="order-card__footer">
            <div className="order-summary-final">
              <div className="summary-item">
                <span>Items Total:</span>
                <span>${order.totalPrice?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-total">
                <span>Final Total:</span>
                <span className="total-amount">${order.totalPrice?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllOrdersOrderCard;