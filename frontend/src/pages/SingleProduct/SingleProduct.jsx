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
                    const fetchedProduct = data.data;
                    // Ensure images is an array, and add placeholders if needed for the gallery
                    if (typeof fetchedProduct.image === 'string') {
                        fetchedProduct.images = [
                            fetchedProduct.image,
                            'https://via.placeholder.com/600/FF0000/FFFFFF?text=Product+Image+2',
                            'https://via.placeholder.com/600/00FF00/FFFFFF?text=Product+Image+3'
                        ];
                    }
                    setProduct(fetchedProduct);
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
    }, [productId, t]);

    useEffect(() => {
        if (product && product.sizes && product.sizes.length > 0) {
            setSelectedServingSize(product.sizes[0].label);
        }
    }, [product]);

    const handleAddToCart = () => {
        try {
            const selectedSize = product.sizes.find(size => size.label === selectedServingSize);
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
        const selectedSize = product.sizes.find(size => size.label === selectedServingSize);
        if (product && selectedSize) {
            addToCart({ ...product, selectedSize });
            navigate('/checkout'); // Navigate to checkout page
        }
    };

    const currentPrice = product && product.sizes && product.sizes.length > 0 
    ? product.sizes.find(size => size.label === selectedServingSize)?.price || product.price 
    : product?.price || 0;


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
                    {product.images && product.images.length > 1 && (
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
                                {product.rating?.average || 0} ({product.orderCount || 0} orders)
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
        {product.sizes && product.sizes.length > 0 ? (
            <select
                value={selectedServingSize}
                onChange={(e) => setSelectedServingSize(e.target.value)}
                className="serving-size-select"
            >
                {product.sizes.map((size, index) => (
                    <option key={index} value={size.label}>
                        {size.label} - {size.price}₽
                    </option>
                ))}
            </select>
        ) : (
            <span>{t('single_product_size_not_available')}</span>
        )}
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

                    <Accordion title={t('single_product_full_description')} content={product.description} />
                    <Accordion title={t('single_product_full_ingredients')} content={product.ingredients?.join(', ')} />

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