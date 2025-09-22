import React, { useState, useRef, useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import useOutsideAlerter from '../hooks/useOutsideAlerter';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useContext(NotificationContext);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  useOutsideAlerter(dropdownRef, () => setIsOpen(false));

  const handleNotificationClick = (id) => {
    markAsRead(id);
    // Optionally, navigate to the order details page
    // history.push(`/order/${notification.orderId}`);
  };

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <button className="notification-button" onClick={() => setIsOpen(!isOpen)}>
        {/* Replace FontAwesome icon with SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0 0 24 24">
    <path d="M 12 2 C 11.172 2 10.5 2.672 10.5 3.5 L 10.5 4.1953125 C 7.9131836 4.862095 6 7.2048001 6 10 L 6 16 L 4 18 L 4 19 L 10.269531 19 A 2 2 0 0 0 10 20 A 2 2 0 0 0 12 22 A 2 2 0 0 0 14 20 A 2 2 0 0 0 13.728516 19 L 20 19 L 20 18 L 18 16 L 18 10 C 18 7.2048001 16.086816 4.862095 13.5 4.1953125 L 13.5 3.5 C 13.5 2.672 12.828 2 12 2 z M 12 6 C 14.206 6 16 7.794 16 10 L 16 16 L 16 16.828125 L 16.171875 17 L 7.828125 17 L 8 16.828125 L 8 16 L 8 10 C 8 7.794 9.794 6 12 6 z"></path>
</svg>

        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="dropdown-content">
          <div className="dropdown-header">
            <h3>Увеведомления</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-all-read-button">
                Отметить все как прочитанные
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="no-notifications">Нет новых уведомлений.</p>
          ) : (
            <ul>
              {notifications.map((notification) => (
                <li
                  key={notification._id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification._id)}
                >
                  <p>{notification.message}</p>
                  <span className="notification-date">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;