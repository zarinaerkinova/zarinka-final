import React from 'react';
import './CheckoutProductCard.scss';

const CheckoutProductCard = ({ item }) => {
    // Determine the price based on selectedSize, product price, or item price (for custom cakes)
    const price = item.price ?? item.product?.price

    // Determine the image source
    const imageSrc = item.image // Check for item.image first (for custom cakes)
        ? item.image.startsWith('/') // If it's a relative path like /src/assets/CustomCake.png
            ? item.image
            : `http://localhost:5000${item.image}` // If it's a full URL from backend
        : item.product?.image // Then check for item.product?.image (for regular products)
            ? `http://localhost:5000${item.product.image}`
            : '/placeholder.png'; // Fallback

    // Determine the name
    const name = item.product?.name || item.name || 'Product';

    // Determine the baker name
    const bakerName = item.product?.createdBy?.name || item.baker?.name || 'Custom Order'; // Or 'Unknown' if no baker for regular product

    return (
        <div className="checkout-product-card">
            <img src={imageSrc} alt={name} />
            <div className="product-details">
                <h4>{name}</h4>
                <p>Bakery: {bakerName}</p>
                <p>Quantity: {item.quantity}</p>
                {item.selectedSize && ( // Display selected size if available
                    <p>Size: {item.selectedSize.label}</p>
                )}
                {item.customizedIngredients && item.customizedIngredients.length > 0 && ( // Display customized ingredients if available
                    <p>Ingredients: {item.customizedIngredients.map(ing => ing.name).join(', ')}</p>
                )}
            </div>
            <p className="price">{price * item.quantity} ₽</p>
        </div>
    );
};

export default CheckoutProductCard;
