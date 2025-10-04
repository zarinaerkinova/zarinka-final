import { create } from 'zustand'
import api from '../config/axios.js'
import { useCartStore } from './Cart'
import { useUserStore } from './User'
import { useLoadingStore } from './Loading.js' // Import useLoadingStore

// zustand store for orders
export const useOrderStore = create((set, get) => ({
	orders: [], // This will now primarily be for customer's own orders
	customOrders: [],
	newOrders: [], // New state for baker's new orders
	completedOrders: [], // New state for baker's completed orders
	allBakerOrders: [], // New state for all orders for a baker

	placeOrder: async (token, orderData) => {
		const setLoading = useLoadingStore.getState().setLoading;
		setLoading(true);
		try {
			const { setCart } = useCartStore.getState()

			if (!orderData?.items || orderData.items.length === 0) {
				throw new Error('Order has no items')
			}

			const res = await api.post('/orders', orderData, {
				headers: { Authorization: `Bearer ${token}` },
			})

			setCart([]) // clear cart
			set(state => ({ orders: [...state.orders, res.data] }))
            get().fetchBakerOrders(token); // Refetch baker orders
			return res.data
		} catch (error) {
			console.error(error.response?.data || error.message)
			throw error
		} finally {
			setLoading(false);
		}
	},

	placeCustomOrder: async (token, orderDetails) => {
		const setLoading = useLoadingStore.getState().setLoading;
		setLoading(true);
		try {
			const res = await api.post('/orders/custom', orderDetails, {
				headers: { Authorization: `Bearer ${token}` },
			})
			set(state => ({ customOrders: [...state.customOrders, res.data] }))
            get().fetchBakerOrders(token); // Refetch baker orders
			return res.data
		} catch (error) {
			console.error(error.response?.data || error.message)
			throw error
		} finally {
			setLoading(false);
		}
	},

	fetchOrders: async token => {
		const setLoading = useLoadingStore.getState().setLoading;
		setLoading(true);
		try {
			const res = await api.get('/orders/my-orders', {
				headers: { Authorization: `Bearer ${token}` },
			})
			set({ orders: res.data })
		} catch (error) {
			console.error(error)
		} finally {
			setLoading(false);
		}
	},

	// New fetch actions for baker-specific orders
	fetchNewBakerOrders: async token => {
		const setLoading = useLoadingStore.getState().setLoading;
		setLoading(true);
		try {
			const res = await api.get('/orders/baker/new', {
				headers: { Authorization: `Bearer ${token}` },
			})
			set({ newOrders: res.data })
		} catch (error) {
			console.error('❌ Error fetching new baker orders:', error)
		} finally {
			setLoading(false);
		}
	},

	fetchCompletedBakerOrders: async token => {
		const setLoading = useLoadingStore.getState().setLoading;
		setLoading(true);
		try {
			const res = await api.get('/orders/baker/completed', {
				headers: { Authorization: `Bearer ${token}` },
			})
			const { userInfo } = useUserStore.getState()
			if (!userInfo) {
				console.error('User info not available in order store')
				set({ completedOrders: [] })
				return
			}
			const filteredOrders = res.data.filter(
				order => order.baker === userInfo._id
			)
			set({ completedOrders: filteredOrders })
		} catch (error) {
			console.error(error)
		} finally {
			setLoading(false);
		}
	},

	fetchAllBakerOrders: async token => {
		const setLoading = useLoadingStore.getState().setLoading;
		setLoading(true);
		try {
			const res = await api.get('/orders/baker-orders', {
				// This route now fetches all orders for the authenticated baker
				headers: { Authorization: `Bearer ${token}` },
			})
			// Include only in-progress buckets: accepted, confirmed, shipped
			const inProgress = new Set(['accepted', 'confirmed', 'shipped'])
			const filteredOrders = res.data.filter(order =>
				inProgress.has(order.status)
			)
			set({
				allBakerOrders: filteredOrders,
			})
		} catch (error) {
			console.error('❌ Error fetching all baker orders:', error)
		} finally {
			setLoading(false);
		}
	},

	// Update fetchBakerOrders to use the new specific fetch actions
	fetchBakerOrders: async token => {
		const {
			fetchNewBakerOrders,
			fetchCompletedBakerOrders,
			fetchAllBakerOrders,
		} = get()
		await fetchNewBakerOrders(token)
		await fetchCompletedBakerOrders(token)
		await fetchAllBakerOrders(token)
	},

	updateOrderStatus: async (token, orderId, status, reason = '') => {
		const setLoading = useLoadingStore.getState().setLoading;
		setLoading(true);
		try {
			const res = await api.put(
				`/orders/${orderId}/status`,
				{ status, reason },
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			)
			// Update the order in the state
			set(state => ({
				orders: state.orders.map(o => (o._id === orderId ? res.data : o)),
				customOrders: state.customOrders.map(o =>
					o._id === orderId ? res.data : o
				),
				newOrders: state.newOrders.map(o => (o._id === orderId ? res.data : o)),
				completedOrders: state.completedOrders.map(o =>
					o._id === orderId ? res.data : o
				),
				allBakerOrders: state.allBakerOrders.map(o =>
					o._id === orderId ? res.data : o
				),
			}))
			// Refresh categorized lists to move the order between buckets
			await get().fetchBakerOrders(token)
			return res.data
		} catch (error) {
			console.error(error.response?.data || error.message)
			throw error
		} finally {
			setLoading(false);
		}
	},

	deleteOrder: async (token, orderId) => {
		const setLoading = useLoadingStore.getState().setLoading;
		setLoading(true);
		try {
			await api.delete(`/orders/${orderId}`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			// Remove the deleted order from state
			set(state => ({
				orders: state.orders.filter(o => o._id !== orderId),
				customOrders: state.customOrders.filter(o => o._id !== orderId),
				newOrders: state.newOrders.filter(o => o._id !== orderId),
				completedOrders: state.completedOrders.filter(o => o._id !== orderId),
				allBakerOrders: state.allBakerOrders.filter(o => o._id !== orderId),
			}))
			return { success: true, message: 'Order deleted successfully' }
		} catch (error) {
			console.error(error.response?.data || error.message)
			throw error
		} finally {
			setLoading(false);
		}
	},

	// Delete user's own order
	deleteUserOrder: async (token, orderId) => {
		const setLoading = useLoadingStore.getState().setLoading;
		setLoading(true);
		try {
			await api.delete(`/orders/user/${orderId}`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			// Remove the deleted order from state
			set(state => ({
				orders: state.orders.filter(o => o._id !== orderId),
				customOrders: state.customOrders.filter(o => o._id !== orderId),
			}))
			return { success: true, message: 'Order deleted successfully' }
		} catch (error) {
			console.error(error.response?.data || error.message)
			throw error
		} finally {
			setLoading(false);
		}
	},
}))
