import { create } from 'zustand';
import api from '../config/axios.js';
const API_URL = import.meta.env.VITE_API_URL;

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async (token) => {
    set({ loading: true });
    try {
      const res = await api.get(`${API_URL}/notifications/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const notifications = res.data;
      const unreadCount = notifications.filter(n => !n.read).length;
      set({ notifications, unreadCount, loading: false });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ loading: false });
    }
  },

  markAsRead: async (notificationId, token) => {
    try {
      const res = await api.put(`${API_URL}/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set(state => {
        const updatedNotifications = state.notifications.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        );
        const unreadCount = updatedNotifications.filter(n => !n.read).length;
        return { notifications: updatedNotifications, unreadCount };
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead: async (token) => {
    try {
      await api.put(`${API_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },
}));