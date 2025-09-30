import React from 'react';
import { useNotificationStore } from '../../store/Notification';
import { useUserStore } from '../../store/User';
import './Notifications.scss';

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const { token } = useUserStore();

  return (
    <div className="notifications-dropdown">
      <div className="notifications-header">
        <h3>Notifications ({unreadCount})</h3>
        <button onClick={() => markAllAsRead(token)} disabled={unreadCount === 0}>
          Mark all as read
        </button>
      </div>
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <p className="no-notifications">No notifications yet.</p>
        ) : (
          notifications.map(notification => (
            <div
              key={notification._id}
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              onClick={() => !notification.read && markAsRead(notification._id, token)}
            >
              <p>{notification.message}</p>
              <span className="notification-time">
                {new Date(notification.createdAt).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;