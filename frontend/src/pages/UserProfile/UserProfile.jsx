import React, { useEffect, useState } from 'react';
import './UserProfile.scss';
import { useUserStore } from '../../store/User';
import { useOrderStore } from '../../store/Order';
import { useReviewStore } from '../../store/review';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import OrderCard from '../../components/OrderCard/OrderCard';
import Card from '../../components/Card.jsx';
import { FaStar } from "react-icons/fa6";
import './UserProfile.scss';

const UserProfile = () => {
        const { t } = useTranslation();
        const {
            user,
            userInfo,
            errorMessage,
            isLoadingProfile,
            fetchProfile,
            logoutUser,
            updateUserProfile,
            favorites,
            fetchFavorites,
            token
        } = useUserStore();
        
        const { orders, fetchOrders, deleteUserOrder } = useOrderStore();
        const { userReviews, fetchUserReviews, deleteUserReview, loading: reviewsLoading } = useReviewStore();
        const navigate = useNavigate();
    
        const [isEditing, setIsEditing] = useState(false);
        const [editedName, setEditedName] = useState('');
        const [editedPhone, setEditedPhone] = useState('');
        const [editedAddress, setEditedAddress] = useState('');
            const [isUpdating, setIsUpdating] = useState(false);

    const getStatusLabel = status => {
        switch (status) {
            case 'pending':
                return t('order_status_pending') || 'Ожидает'
            case 'accepted':
                return t('order_status_accepted') || 'Принят'
            case 'confirmed':
                return t('order_status_confirmed') || 'Готовка'
            case 'shipped':
                return t('order_status_shipped') || 'Доставка'
            case 'delivered':
                return t('order_status_delivered') || 'Доставлен'
            case 'declined':
                return t('order_status_declined') || 'Отклонен'
            default:
                return status
        }
    }

    const getProgress = status => {
        switch (status) {
            case 'accepted':
                return 25
            case 'confirmed':
                return 50
            case 'shipped':
                return 75
            case 'delivered':
                return 100
            default:
                return 0
        }
    }

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm(t('profile_confirm_delete_order') || 'Вы уверены, что хотите удалить этот заказ? Это действие нельзя отменить.')) {
            return;
        }

        try {
            await deleteUserOrder(token, orderId);
            toast.success(t('profile_order_deleted_success') || 'Заказ успешно удален');
        } catch (error) {
            console.error('Error deleting order:', error);
            toast.error(t('profile_order_delete_error') || 'Ошибка при удалении заказа');
        }
    }

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm(t('profile_confirm_delete_review') || 'Вы уверены, что хотите удалить этот отзыв? Это действие нельзя отменить.')) {
            return;
        }

        try {
            await deleteUserReview(reviewId, token);
            toast.success(t('profile_review_deleted_success') || 'Отзыв успешно удален');
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error(t('profile_review_delete_error') || 'Ошибка при удалении отзыва');
        }
    }
    
        useEffect(() => {
            fetchProfile();
        }, [fetchProfile]);
    
        useEffect(() => {
            console.log('Token in UserProfile useEffect:', token);
            console.log('User in UserProfile useEffect:', user);
            if (token) {
                fetchOrders(token);
                fetchFavorites();
                fetchUserReviews(token);
            }
        }, [token, fetchOrders, fetchFavorites, fetchUserReviews]);
    
        useEffect(() => {
            if (userInfo) {
                setEditedName(userInfo.name || '');
                setEditedPhone(userInfo.phone || '');
                setEditedAddress(userInfo.address || '');
            }
        }, [userInfo]);
    
        const handleLogout = () => {
            toast((toastInstance) => (
                <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: '0 0 12px 0', fontWeight: '500' }}>
                        {t('profile_confirm_logout') || 'Вы уверены, что хотите выйти?'}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '6px',
                                background: '#ef4444',
                                color: 'white',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                            onClick={() => {
                                toast.dismiss(toastInstance.id);
                                logoutUser();
                                navigate('/register');
                            }}
                        >
                            {t('profile_logout') || 'Выйти'}
                        </button>
                        <button
                            style={{
                                padding: '8px 16px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                background: 'white',
                                color: '#374151',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                            onClick={() => toast.dismiss(t.id)}
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            ), {
                duration: 5000,
            });
        };
    
        const handleEditProfile = () => {
            setIsEditing(true);
        };
    
        const handleCancelEdit = () => {
            setIsEditing(false);
            // Восстанавливаем исходные значения
            setEditedName(userInfo?.name || '');
            setEditedPhone(userInfo?.phone || '');
            setEditedAddress(userInfo?.address || '');
        };
    
        const handleSaveChanges = async () => {
            if (!editedName.trim()) {
                toast.error('Имя не может быть пустым');
                return;
            }
    
            setIsUpdating(true);
            
            const formData = new FormData();
            formData.append('name', editedName.trim());
            formData.append('phone', editedPhone.trim());
            formData.append('address', editedAddress.trim());
    
            const result = await updateUserProfile(formData);
    
            setIsUpdating(false);
    
                    if (result.success) {
                        toast.success("Профиль успешно обновлен!", {
                            icon: '✅',
                            duration: 3000,
                        });
                        setIsEditing(false);
                        // Update the user info in the store
                        useUserStore.setState({ userInfo: result.userData });
                    } else {                toast.error(result.message || "Не удалось обновить профиль.", {
                    icon: '❌',
                    duration: 4000,
                });
            }
        };


    if (isLoadingProfile) {
        return (
            <div className="user-profile">
                <div className="user-profile__container">
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="user-profile">
            <div className="user-profile__container">
                <h2>Ваш профиль</h2>

                {errorMessage && (
                    <div className="error-message">
                        {errorMessage}
                    </div>
                )}

                {userInfo && (
                    <div className="user-profile__section">
                        <h3>Личная информация</h3>
                        <div className="user-profile__image-container">
                            {userInfo.image ? (
                                <img 
                                    src={`${import.meta.env.VITE_BACKEND_BASE_URL}${userInfo.image}`}
                                    alt="Profile" 
                                    className="user-profile__image"
                                />
                            ) : (
                                <div className="user-initials-container">
                                    <div className="user-initials">
                                        {userInfo.name?.charAt(0) || 'U'}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="user-profile__section__info-item">
                            <label>Полное имя:</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    placeholder="Введите ваше имя"
                                    autoFocus
                                />
                            ) : (
                                <p>{userInfo.name || 'Не указано'}</p>
                            )}
                        </div>

                        <div className="user-profile__section__info-item">
                            <label>Номер телефона:</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={editedPhone}
                                    onChange={(e) => setEditedPhone(e.target.value)}
                                    placeholder="+998 XX XXX XX XX"
                                />
                            ) : (
                                <p>{userInfo.phone || 'Не указан'}</p>
                            )}
                        </div>

                        <div className="user-profile__section__info-item">
                            <label>Адрес:</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedAddress}
                                    onChange={(e) => setEditedAddress(e.target.value)}
                                    placeholder="Укажите ваш адрес"
                                />
                            ) : (
                                <>
                                    <p>{userInfo.address || 'Не указан'}</p>
                                </>
                            )}
                        </div>

                        <div className="user-profile__section__actions">
                            {isEditing ? (
                                <>
                                    <button 
                                        onClick={handleSaveChanges} 
                                        className="btn-primary"
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? 'Сохранение...' : 'Сохранить изменения'}
                                    </button>
                                    <button 
                                        onClick={handleCancelEdit} 
                                        className="btn-secondary"
                                        disabled={isUpdating}
                                    >
                                        Отмена
                                    </button>
                                </>
                            ) : (
                                <button onClick={handleEditProfile} className="btn-primary">
                                    Редактировать профиль
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Секция заказов */}
                <div className="user-profile__section user-profile__orders">
                    <h3>Ваши заказы</h3>
                    {console.log('Orders in UserProfile render:', orders)}
                    {console.log('Orders length:', orders?.length)}
                    {orders && orders.length > 0 ? (
                        orders.map(order => (
                            <div
                                key={order._id}
                                className='order-card'
                                style={{
                                    background: '#fff',
                                    borderRadius: 12,
                                    padding: '1rem 1.25rem',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                                    marginBottom: '1rem',
                                }}
                            >
                                <h3 style={{ marginTop: 0, marginBottom: 8 }}>Заказ #{order._id}</h3>
                                <p style={{ margin: '4px 0' }}>
                                    Статус:{' '}
                                    <span
                                        style={{
                                            display: 'inline-block',
                                            padding: '2px 8px',
                                            borderRadius: 12,
                                            fontSize: 12,
                                            background:
                                                order.status === 'declined'
                                                    ? '#dc3545'
                                                    : order.status === 'delivered'
                                                    ? '#28a745'
                                                    : order.status === 'shipped'
                                                    ? '#17a2b8'
                                                    : order.status === 'confirmed'
                                                    ? '#ffc107'
                                                    : order.status === 'accepted'
                                                    ? '#0dcaf0'
                                                    : '#e0e0e0',
                                            color: order.status === 'confirmed' ? '#000' : '#fff',
                                        }}
                                    >
                                        {getStatusLabel(order.status)}
                                    </span>
                                </p>

                                <div
                                    style={{
                                        height: 8,
                                        background: '#eee',
                                        borderRadius: 8,
                                        overflow: 'hidden',
                                        margin: '8px 0 12px',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${getProgress(order.status)}%`,
                                            height: '100%',
                                            background: '#28a745',
                                            transition: 'width 0.3s ease',
                                        }}
                                    />
                                </div>

                                <ul style={{ paddingLeft: 18, margin: '8px 0 12px' }}>
                                    {(order.items || []).map(item => (
                                        <li key={item.product?._id}>
                                            {item.product?.name} × {item.quantity}
                                        </li>
                                    ))}
                                </ul>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>Итого: {order.totalPrice} ₽</p>
                                    <button
                                        onClick={() => handleDeleteOrder(order._id)}
                                        style={{
                                            background: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '6px 12px',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.background = '#c82333';
                                            e.target.style.transform = 'translateY(-1px)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.background = '#dc3545';
                                            e.target.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        🗑️ Удалить
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-message" style={{ '&::before': { content: '"📝"' } }}>
                            У вас пока нет заказов.
                        </div>
                    )}
                </div>

                {/* Секция отзывов */}
                <div className="user-profile__section user-profile__reviews">
                    <h3>Ваши отзывы</h3>
                    {reviewsLoading ? (
                        <div className="loading-message">Загрузка отзывов...</div>
                    ) : userReviews && userReviews.length > 0 ? (
                        <div className="reviews-list">
                            {userReviews.map((review) => (
                                <div
                                    key={review._id}
                                    className="review-card"
                                    style={{
                                        background: '#fff',
                                        borderRadius: 12,
                                        padding: '1.5rem',
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                                        marginBottom: '1rem',
                                        border: '1px solid #e0e0e0',
                                    }}
                                >
                                    <div className="review-header" style={{ marginBottom: '1rem' }}>
                                        <h4 style={{ margin: 0, color: '#333', fontSize: '1.1rem' }}>
                                            {review.product?.name || 'Продукт'}
                                        </h4>
                                        <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.9rem' }}>
                                            Пекарь: {review.baker?.bakeryName || review.baker?.name || 'Неизвестно'}
                                        </p>
                                        {review.order && (
                                            <p style={{ margin: 0, color: '#888', fontSize: '0.8rem' }}>
                                                Заказ на сумму: {review.order.totalPrice} ₽
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="review-rating" style={{ marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar 
                                                    key={i} 
                                                    style={{
                                                        color: i < review.rating ? '#ffc107' : '#e0e0e0',
                                                        fontSize: '1rem'
                                                    }}
                                                />
                                            ))}
                                            <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                                                {review.rating}/5
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {review.comment && (
                                        <div className="review-comment">
                                            <p style={{ margin: 0, color: '#555', lineHeight: 1.5, fontStyle: 'italic' }}>
                                                "{review.comment}"
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div className="review-date" style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <small style={{ color: '#888' }}>
                                            {new Date(review.createdAt).toLocaleDateString('ru-RU', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </small>
                                        <button
                                            onClick={() => handleDeleteReview(review._id)}
                                            style={{
                                                background: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                padding: '4px 8px',
                                                fontSize: '11px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                            }}
                                            onMouseOver={(e) => {
                                                e.target.style.background = '#c82333';
                                                e.target.style.transform = 'translateY(-1px)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.background = '#dc3545';
                                                e.target.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            🗑️ Удалить
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-message" style={{ '&::before': { content: '"📝"' } }}>
                            У вас пока нет отзывов. Оставьте отзыв после получения заказа.
                        </div>
                    )}
                </div>

                {/* Секция избранного */}
                <div className="user-profile__section user-profile__favorites">
                    <h3>Избранные товары</h3>
                    {favorites.length > 0 ? (
                        <div className="user-profile__favorites-grid">
                            {favorites.map(product => (
                                <Card key={product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-message" style={{ '&::before': { content: '"❤️"' } }}>
                            У вас пока нет избранных товаров. Добавьте что-нибудь в избранное!
                        </div>
                    )}
                </div>

                <button onClick={handleLogout} className="logout-button">
                    Выйти из аккаунта
                </button>
            </div>
        </div>
    );
};

export default UserProfile;