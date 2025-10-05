import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useProductStore } from '../store/Product';
import { useCartStore } from '../store/Cart'; // Import Cart Store
import { useFavoriteStore } from '../store/Favorite'; // Import Favorite Store
import './SingleProduct.css';
import profileImage from '../assets/profile.jpg';

const SingleProduct = () => {
    const { t } = useTranslation();
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedServingSize, setSelectedServingSize] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const addToCart = useCartStore((state) => state.addToCart);
    const addToFavorite = useFavoriteStore((state) => state.addToFavorite);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/products/${productId}`);
                const data = await res.json();
                
                if (res.ok) {
                    const fetchedProduct = {
                        ...data.data,
                        images: [
                            data.data.image, // Use the existing image as the first image
                            'https://via.placeholder.com/600/FF0000/FFFFFF?text=Product+Image+2',
                            'https://via.placeholder.com/600/00FF00/FFFFFF?text=Product+Image+3',
                        ],
                        rating: (Math.random() * (5 - 3) + 3).toFixed(1), // Random rating between 3 and 5
                        orderCount: Math.floor(Math.random() * 1000) + 50, // Random order count
                        preparationTime: `${Math.floor(Math.random() * 3) + 1} hours`,
                        fullDescription: `This is a much longer and more detailed description of the product. It covers all the amazing features, the quality of ingredients, and the passion that goes into making it. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
                        fullIngredients: `Flour, Sugar, Eggs, Butter, Milk, Baking Powder, Vanilla Extract, Salt. May contain traces of nuts and other allergens. Please check the label for detailed allergen information.`,
                        servingSizes: [
                            { size: 'Small', price: data.data.price },
                            { size: 'Medium', price: (data.data.price * 1.5).toFixed(2) },
                            { size: 'Large', price: (data.data.price * 2).toFixed(2) },
                        ],
                    };
                    setProduct(fetchedProduct);
                    setSelectedServingSize(fetchedProduct.servingSizes[0].size); // Set initial serving size
                } else {
                    setError(data.message || t('single_product_not_found'));
                }
            } catch (err) {
                console.error('Error fetching product:', err);
                setError(t('single_product_loading_error') || 'Ошибка загрузки продукта');
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const handleAddToCart = () => {
        try {
            const selectedSize = product.servingSizes.find(size => size.size === selectedServingSize);
            if (product && selectedSize) {
                addToCart({ ...product, selectedSize });
                toast.success(t('single_product_success_add_cart'));
            }
        } catch (error) {
            toast.error(t('single_product_error_add_cart'));
        }
    };

    const handleAddToFavorite = () => {
        try {
            if (product) {
                addToFavorite(product);
                toast.success(t('single_product_success_add_favorite'));
            }
        } catch (error) {
            toast.error(t('single_product_error_add_favorite'));
        }
    };

    const handleCustomize = () => {
        // Navigate to custom page with product data
        navigate('/custom', { state: { baseProduct: product } });
    };

    const handleBuyNow = () => {
        const selectedSize = product.servingSizes.find(size => size.size === selectedServingSize);
        if (product && selectedSize) {
            addToCart({ ...product, selectedSize });
            navigate('/checkout'); // Navigate to checkout page
        }
    };

    const currentPrice = product ? product.servingSizes.find(size => size.size === selectedServingSize)?.price || product.price : 0;

    if (loading) {
        return (
            <div className="single-product-loading">
                <p>{t('single_product_loading')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="single-product-error">
                <p>{error}</p>
                <button onClick={() => navigate('/catalog')}>Вернуться к каталогу</button>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="single-product-error">
                <p>Продукт не найден</p>
                <button onClick={() => navigate('/catalog')}>Вернуться к каталогу</button>
            </div>
        );
    }

    return (
        <main className="single-product-main">
            <div className="single-product-container">
                <div className="product-image-gallery">
                    <img
                        src={product.images[currentImageIndex]}
                        alt={product.name}
                        className="product-image"
                    />
                    {product.images.length > 1 && (
                        <div className="image-thumbnails">
                            {product.images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`Thumbnail ${index + 1}`}
                                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                                    onClick={() => setCurrentImageIndex(index)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="product-info-section">
                    <div className="product-header">
                        <h1>{product.name}</h1>
                        <div className="product-rating-order-count">
                            <div className="product-rating">
                                <span className="star-icon">⭐</span>
                                {product.rating} ({product.orderCount} orders)
                            </div>
                        </div>
                    </div>

                    <div className="product-category">
                        {product.category && (
                            <span className="category-tag">
                                {product.category.name}
                            </span>
                        )}
                    </div>

                    <div className="product-meta-info">
                        <div className="meta-item">
                            <strong>{t('single_product_serving_size')}:</strong>
                            <select
                                value={selectedServingSize}
                                onChange={(e) => setSelectedServingSize(e.target.value)}
                                className="serving-size-select"
                            >
                                {product.servingSizes.map((size, index) => (
                                    <option key={index} value={size.size}>
                                        {size.size} - {size.price}₽
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="meta-item">
                            <strong>{t('single_product_preparation_time')}:</strong> {product.preparationTime}
                        </div>
                    </div>

                    <div className="product-price-section">
                        <div className="product-price">
                            <span className="price-amount">{currentPrice}</span>
                            <span className="price-currency">₽</span>
                        </div>
                    </div>

                    <Accordion title={t('single_product_full_description')} content={product.fullDescription} />
                    <Accordion title={t('single_product_full_ingredients')} content={product.fullIngredients} />

                    <div className="product-actions">
                        <button className="customize-btn" onClick={handleCustomize}>
                            <span>🎨</span>
                            {t('single_product_customize')}
                        </button>
                        <button className="buy-now-btn" onClick={handleBuyNow}>
                            {t('single_product_buy_now')}
                        </button>
                        <button className="add-to-cart-btn" onClick={handleAddToCart}>
                            <span>🛒</span>
                            {t('single_product_add_to_cart')}
                        </button>
                        <button className="add-to-favorite-btn" onClick={handleAddToFavorite}>
                            <span>❤️</span>
                            {t('single_product_add_to_favorite')}
                        </button>
                    </div>

                    {product.createdBy && (
                        <div className="product-baker">
                            <h3>{t('single_product_baker')}</h3>
                            <div className="baker-info">
                                <img
                                    src={product.createdBy.image ? `${import.meta.env.VITE_BACKEND_BASE_URL}${product.createdBy.image}` : profileImage}
                                    alt={product.createdBy.name || 'Baker'}
                                    className="baker-avatar"
                                />
                                <div className="baker-details">
                                    <h4>
                                        <a href={`/bakers/${product.createdBy._id}`} className="baker-link">
                                            {product.createdBy.name}
                                        </a>
                                    </h4>
                                    {product.createdBy.bio && (
                                        <p>{product.createdBy.bio}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

// Inline Accordion Component
const Accordion = ({ title, content }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="accordion-item">
            <button className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
                {title}
                <span className={`accordion-icon ${isOpen ? 'open' : ''}`}>▼</span>
            </button>
            {isOpen && (
                <div className="accordion-content">
                    <p>{content}</p>
                </div>
            )}
        </div>
    );
};

export default SingleProduct;