import React, { useEffect, useState } from 'react';
import './UserProfile.scss';
import { useUserStore } from '../../store/User';
import { useOrderStore } from '../../store/Order';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import OrderCard from '../../components/OrderCard/OrderCard';
import Card from '../../components/Card.jsx';
import './UserProfile.scss';

const UserProfile = () => {
    const { 
        user, 
        userInfo, 
        errorMessage, 
        isLoadingProfile, 
        fetchProfile, 
        logoutUser, 
        updateProfile, 
        favorites, 
        fetchFavorites, 
        token 
    } = useUserStore();
    
    const { orders, fetchOrders } = useOrderStore();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedPhone, setEditedPhone] = useState('');
    const [editedAddress, setEditedAddress] = useState('');
        const [isUpdating, setIsUpdating] = useState(false);
	useEffect(() => {
		const fetchOrders = async () => {
			const { data } = await axios.get('/api/order/my-orders', {
				headers: { Authorization: `Bearer ${token}` },
			})
			setOrders(data)
		}
		fetchOrders()
	}, [token])

	const getStatusLabel = status => {
		switch (status) {
			case 'pending':
				return 'Ожидает'
			case 'accepted':
				return 'Принят'
			case 'confirmed':
				return 'Готовка'
			case 'shipped':
				return 'Доставка'
			case 'delivered':
				return 'Доставлен'
			case 'declined':
				return 'Отклонен'
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

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        console.log('User token in UserProfile useEffect:', user?.token);
        if (user?.token) {
            fetchOrders(user.token);
            fetchFavorites();
        }
    }, [user, fetchOrders, fetchFavorites]);

    useEffect(() => {
        if (userInfo) {
            setEditedName(userInfo.name || '');
            setEditedPhone(userInfo.phone || '');
            setEditedAddress(userInfo.address || '');
        }
    }, [userInfo]);

    const handleLogout = () => {
        toast((t) => (
            <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 12px 0', fontWeight: '500' }}>
                    Вы уверены, что хотите выйти?
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
                            toast.dismiss(t.id);
                            logoutUser();
                            navigate('/register');
                        }}
                    >
                        Выйти
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
        
        const result = await updateProfile({
            name: editedName.trim(),
            phone: editedPhone.trim(),
            address: editedAddress.trim(),
        });

        setIsUpdating(false);

        if (result.success) {
            toast.success("Профиль успешно обновлен!", {
                icon: '✅',
                duration: 3000,
            });
            setIsEditing(false);
            fetchProfile(); // Обновляем данные профиля
        } else {
            toast.error(result.message || "Не удалось обновить профиль.", {
                icon: '❌',
                duration: 4000,
            });
        }
    };

    const handleAddressSelect = () => {
        toast('Функция выбора адреса будет добавлена в будущих обновлениях', {
            icon: '🗺️',
            duration: 3000,
        });
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
                                    src={`http://localhost:5000${userInfo.image}`}
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
                                    <button 
                                        className="btn-secondary" 
                                        onClick={handleAddressSelect}
                                    >
                                        Выбрать адрес
                                    </button>
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
                    {orders.map(order => (
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
					<p style={{ margin: 0 }}>Итого: {order.totalPrice} ₽</p>
				</div>
			))}
                </div>

                {/* Секция отзывов */}
                <div className="user-profile__section user-profile__reviews">
                    <h3>Ваши отзывы</h3>
                    <div className="empty-message" style={{ '&::before': { content: '"📝"' } }}>
                        Отзывы будут отображаться здесь после их добавления.
                    </div>
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