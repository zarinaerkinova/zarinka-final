import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotificationStore } from '../../store/Notification.js';
import { useUserStore } from '../../store/User.js';
import Modal from '../Modal/Modal.jsx'; // Import Modal
import { FaTrash } from 'react-icons/fa'; // Import trash icon
import useOutsideAlerter from '../hooks/useOutsideAlerter';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } = useNotificationStore();
  const { token } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  useOutsideAlerter(dropdownRef, () => setIsOpen(false));

  useEffect(() => {
    if (token) {
      fetchNotifications(token);
    }
  }, [token, fetchNotifications]);

  const handleNotificationClick = (notification) => {
    if (!notification.read && token) {
      markAsRead(notification._id, token);
    }
  };

  const handleMarkAllAsRead = () => {
    if (token) {
      markAllAsRead(token);
    }
  };

  const handleDelete = (notificationId) => {
    if (token) {
        deleteNotification(notificationId, token);
    }
  };

  const handleDeleteAll = () => {
    if (token) {
        deleteAllNotifications(token);
        setIsModalOpen(false);
    }
  };

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
        <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleDeleteAll}
            title="Удалить все уведомления?"
        >
            <p>Вы уверены, что хотите удалить все уведомления? Это действие нельзя будет отменить.</p>
        </Modal>

      <button className="notification-button" onClick={() => setIsOpen(!isOpen)}>
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0 0 24 24">
          <path d="M 12 2 C 11.172 2 10.5 2.672 10.5 3.5 L 10.5 4.1953125 C 7.9131836 4.862095 6 7.2048001 6 10 L 6 16 L 4 18 L 4 19 L 10.269531 19 A 2 2 0 0 0 10 20 A 2 2 0 0 0 12 22 A 2 2 0 0 0 14 20 A 2 2 0 0 0 13.728516 19 L 20 19 L 20 18 L 18 16 L 18 10 C 18 7.2048001 16.086816 4.862095 13.5 4.1953125 L 13.5 3.5 C 13.5 2.672 12.828 2 12 2 z M 12 6 C 14.206 6 16 7.794 16 10 L 16 16 L 16 16.828125 L 16.171875 17 L 7.828125 17 L 8 16.828125 L 8 16 L 8 10 C 8 7.794 9.794 6 12 6 z"></path>
        </svg>
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="dropdown-content">
          <div className="dropdown-header">
            <h3>Уведомления</h3>
            <div className="header-buttons-dropdown">
                <button onClick={handleMarkAllAsRead} className="mark-all-read-button">
                    Отметить все как прочитанные
                </button>
                <button onClick={() => setIsModalOpen(true)} className="delete-all-btn-dropdown">
                    Удалить все
                </button>
            </div>
          </div>
          {notifications.length === 0 ? (
            <p className="no-notifications">Нет новых уведомлений.</p>
          ) : (
            <ul>
              {notifications.map((notification) => (
                <li
                  key={notification._id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                >
                  <div className="notification-item-content" onClick={() => handleNotificationClick(notification)}>
                    <p>{notification.message}</p>
                    <span className="notification-date">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                    {notification.type === 'order_completed' && notification.orderId && (
                      <Link to={`/review/${notification.orderId}`} className="review-btn-dropdown">
                          Оставить отзыв
                      </Link>
                    )}
                  </div>
                  <button onClick={() => handleDelete(notification._id)} className="delete-btn-dropdown">
                      <FaTrash />
                  </button>
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