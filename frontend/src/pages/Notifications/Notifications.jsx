import React, { useContext } from 'react';
import { NotificationContext } from '../../context/NotificationContext';
import './Notifications.css';

const Notifications = () => {
    const { notifications, markAsRead } = useContext(NotificationContext);

    return (
        <div className="notifications-page">
            <h1>Уведомления</h1>
            <div className="notifications-list">
                {notifications.length === 0 ? (
                    <p>Нет новых уведомлений.</p>
                ) : (
                    notifications.map(notification => (
                        <div key={notification._id} 
                             className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                             onClick={() => !notification.isRead && markAsRead(notification._id)}>
                            <div className="notification-content">
                                <p className="notification-description">{notification.message}</p>
                                <span className="notification-time">{new Date(notification.createdAt).toLocaleString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;