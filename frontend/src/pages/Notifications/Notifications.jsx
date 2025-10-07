import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotificationStore } from '../../store/Notification.js';
import { useUserStore } from '../../store/User.js';
import Modal from '../../components/Modal/Modal.jsx';
import { FaTrash, FaCheck, FaBell, FaRegBell } from 'react-icons/fa';
import './Notifications.css';

const Notifications = () => {
    const { notifications, fetchNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } = useNotificationStore();
    const { token } = useUserStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadNotifications = async () => {
            if (token) {
                try {
                    await fetchNotifications(token);
                } catch (error) {
                    console.error('Ошибка загрузки уведомлений:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadNotifications();
    }, [token, fetchNotifications]);

    const handleNotificationClick = async (notification) => {
        if (!notification.read && token) {
            try {
                await markAsRead(notification._id, token);
            } catch (error) {
                console.error('Ошибка отметки уведомления как прочитанного:', error);
            }
        }
    };

    const handleMarkAllAsRead = async () => {
        if (token && notifications.some(n => !n.read)) {
            try {
                await markAllAsRead(token);
            } catch (error) {
                console.error('Ошибка отметки всех уведомлений как прочитанных:', error);
            }
        }
    };

    const handleDelete = async (notificationId) => {
        if (token) {
            try {
                await deleteNotification(notificationId, token);
            } catch (error) {
                console.error('Ошибка удаления уведомления:', error);
            }
        }
    };

    const handleDeleteAll = async () => {
        if (token && notifications.length > 0) {
            try {
                await deleteAllNotifications(token);
                setIsModalOpen(false);
            } catch (error) {
                console.error('Ошибка удаления всех уведомлений:', error);
            }
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading) {
        return (
            <div className="notifications-page">
                <div className="notifications-header">
                    <h1>Уведомления</h1>
                </div>
                <div className="empty-state">
                    <p>Загрузка...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="notifications-page">
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDeleteAll}
                title="Удалить все уведомления?"
                confirmText="Удалить"
                cancelText="Отмена"
            >
                <p>Вы уверены, что хотите удалить все уведомления? Это действие нельзя будет отменить.</p>
            </Modal>

            <div className="notifications-header">
                <div>
                    <h1>Уведомления</h1>
                    {unreadCount > 0 && (
                        <span style={{ 
                            color: '#8b1538', 
                            fontSize: '0.9rem',
                            fontWeight: '500'
                        }}>
                            {unreadCount} непрочитанных
                        </span>
                    )}
                </div>
                <div className="header-buttons">
                    {notifications.length > 0 && (
                        <>
                            <button 
                                onClick={handleMarkAllAsRead} 
                                className="mark-all-read-btn"
                                disabled={unreadCount === 0}
                            >
                                <FaCheck />
                                Прочитать все
                            </button>
                            <button 
                                onClick={() => setIsModalOpen(true)} 
                                className="delete-all-btn"
                            >
                                <FaTrash />
                                Удалить все
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="notifications-list">
                {notifications.length === 0 ? (
                    <div className="empty-state">
                        <FaRegBell size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>Нет новых уведомлений</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div 
                            key={notification._id}
                            className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className="notification-content">
                                <p className="notification-description">
                                    {!notification.read && (
                                        <span style={{
                                            display: 'inline-block',
                                            width: '8px',
                                            height: '8px',
                                            backgroundColor: '#8b1538',
                                            borderRadius: '50%',
                                            marginRight: '0.5rem'
                                        }}></span>
                                    )}
                                    {notification.message}
                                </p>
                                <span className="notification-time">
                                    {new Date(notification.createdAt).toLocaleString('ru-RU', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                                {notification.type === 'order_completed' && notification.orderId && (
                                    <Link 
                                        to={`/review/${notification.orderId}`} 
                                        className="review-btn"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Оставить отзыв
                                    </Link>
                                )}
                            </div>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(notification._id);
                                }} 
                                className="delete-btn"
                                aria-label="Удалить уведомление"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;