import axios from 'axios'
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react'
import { AuthContext } from './AuthContext' // Assuming you have an AuthContext for user info

export const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
	const { user, isAuthenticated } = useContext(AuthContext)
	const [notifications, setNotifications] = useState([])
	const [unreadCount, setUnreadCount] = useState(0)
	const API_URL = '/api/notifications' // Use Vite proxy

	const fetchNotifications = useCallback(async () => {
		if (!isAuthenticated || !user) {
			setNotifications([])
			setUnreadCount(0)
			return
		}
		try {
			const config = {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			}
			const res = await axios.get(`${API_URL}/me`, config)
			setNotifications(res.data)
			setUnreadCount(res.data.filter(notif => !notif.read).length)
		} catch (err) {
			console.error('Error fetching notifications:', err)
			// Handle error, e.g., show a toast notification
		}
	}, [isAuthenticated, user])

	const markAsRead = useCallback(async id => {
		try {
			const config = {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			}
			await axios.put(`${API_URL}/${id}/read`, {}, config)
			setNotifications(prev =>
				prev.map(notif => (notif._id === id ? { ...notif, read: true } : notif))
			)
			setUnreadCount(prev => (prev > 0 ? prev - 1 : 0))
		} catch (err) {
			console.error('Error marking notification as read:', err)
		}
	}, [])

	const markAllAsRead = useCallback(async () => {
		try {
			const config = {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			}
			await axios.put(`${API_URL}/read-all`, {}, config)
			setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
			setUnreadCount(0)
		} catch (err) {
			console.error('Error marking all notifications as read:', err)
		}
	}, [])

	useEffect(() => {
		fetchNotifications()
		// Optionally, set up polling for new notifications
		const interval = setInterval(fetchNotifications, 60000) // Poll every 60 seconds
		return () => clearInterval(interval)
	}, [fetchNotifications])

	return (
		<NotificationContext.Provider
			value={{
				notifications,
				unreadCount,
				fetchNotifications,
				markAsRead,
				markAllAsRead,
			}}
		>
			{children}
		</NotificationContext.Provider>
	)
}
