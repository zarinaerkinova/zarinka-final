import axios from 'axios'
import { create } from 'zustand'

const API_URL = '/api/notifications'

export const useNotificationStore = create((set, get) => ({
	notifications: [],
	addNotification: notification =>
		set(state => ({ notifications: [notification, ...state.notifications] })),
	fetchNotifications: async () => {
		try {
			const token = localStorage.getItem('token')
			if (!token) return

			const config = {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
			const res = await axios.get(`${API_URL}/me`, config)
			set({ notifications: res.data })
		} catch (error) {
			console.error('Error fetching notifications:', error)
		}
	},
	markAsRead: async notificationId => {
		try {
			const token = localStorage.getItem('token')
			if (!token) return

			const config = {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
			await axios.put(`${API_URL}/${notificationId}/read`, {}, config)
			set(state => ({
				notifications: state.notifications.map(n =>
					n._id === notificationId ? { ...n, read: true } : n
				),
			}))
		} catch (error) {
			console.error('Error marking notification as read:', error)
		}
	},
	markAllAsRead: async () => {
		try {
			const token = localStorage.getItem('token')
			if (!token) return

			const config = {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
			await axios.put(`${API_URL}/read-all`, {}, config)
			set(state => ({
				notifications: state.notifications.map(n => ({ ...n, read: true })),
			}))
		} catch (error) {
			console.error('Error marking all notifications as read:', error)
		}
	},
	getUnreadCount: () => {
		return get().notifications.filter(n => !n.read).length
	},
}))
