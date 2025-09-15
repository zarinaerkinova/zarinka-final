import React from 'react';
import './Notifications.css';

const Notifications = () => {
    const notifications = [
        {
            id: 1,
            title: 'New order received',
            description: 'You have a new order from John Doe.',
            time: '10 minutes ago',
            isRead: false,
        },
        {
            id: 2,
            title: 'Order completed',
            description: 'Your order #12345 has been completed.',
            time: '1 hour ago',
            isRead: true,
        },
        {
            id: 3,
            title: 'New review',
            description: 'You have a new review from Jane Doe.',
            time: '2 hours ago',
            isRead: false,
        },
    ];

    return (
        <div className="notifications-page">
            <h1>Notifications</h1>
            <div className="notifications-list">
                {notifications.map(notification => (
                    <div key={notification.id} className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}>
                        <div className="notification-content">
                            <h4 className="notification-title">{notification.title}</h4>
                            <p className="notification-description">{notification.description}</p>
                            <span className="notification-time">{notification.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notifications;
