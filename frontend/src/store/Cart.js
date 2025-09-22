import axios from 'axios'
import debounce from 'lodash.debounce'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
	persist(
		(set, get) => ({
			cart: [],

			setCart: items => set({ cart: items }),

			fetchCart: async token => {
				try {
					const res = await axios.get('/api/cart', {
						headers: { Authorization: `Bearer ${token}` },
					})
					set({ cart: res.data })
					return res.data
				} catch (err) {
					console.error('Error fetching cart:', err)
					return null
				}
			},

			addToCart: async (product, token, quantity = 1) => {
				const { cart } = get()

				// Check if product already exists in cart, considering customization and size
				const existingItemIndex = cart.findIndex(
					item =>
						item &&
						item.product &&
						item.product._id === product._id &&
						JSON.stringify(item.selectedSize || null) ===
							JSON.stringify(product.selectedSize || null) &&
						JSON.stringify(item.customizedIngredients || []) ===
							JSON.stringify(product.customizedIngredients || [])
				)

				let newCart

				if (existingItemIndex !== -1) {
					// Update quantity if product exists with same customization and size
					newCart = cart.map((item, index) =>
						index === existingItemIndex && item
							? { ...item, quantity: item.quantity + quantity }
							: item
					)
				} else {
					// Add new item if product doesn't exist or has different customization/size
					const newCartItem = {
						cartItemId: Date.now() + Math.random(),
						product,
						quantity,
						selectedSize: product.selectedSize,
						customizedIngredients: product.customizedIngredients,
					}
					newCart = [...cart, newCartItem]
				}

				// Optimistic update
				set({ cart: newCart })

				try {
					const payload = {
						quantity,
						selectedSize: product.selectedSize,
						customizedIngredients: product.customizedIngredients,
					}

					if (product._id) {
						payload.productId = product._id
					}

					if (product.name && product.price) {
						payload.name = product.name
						payload.price = product.price
					}

					await axios.post('/api/cart', payload, {
						headers: { Authorization: `Bearer ${token}` },
					})
					// Refresh cart from backend so new items get real _id (not just local cartItemId)
					await get().fetchCart(token)
				} catch (err) {
					console.error('❌ Add to cart error:', err)
					// Revert on error
					set({ cart })
				}
			},

			updateQuantity: (cartItemId, quantity, token) => {
				const { cart } = get()

				const newCart = cart.map(item => {
					const id = item._id ?? item.cartItemId
					if (id === cartItemId) {
						return { ...item, quantity }
					}
					return item
				})

				set({ cart: newCart })

				// Only sync with backend if item has a real _id
				const backendId = cartItemId
				const hasBackendId = cart.some(i => (i._id ?? null) === backendId)
				if (hasBackendId) {
					axios
						.put(
							`/api/cart/${backendId}`,
							{ quantity },
							{ headers: { Authorization: `Bearer ${token}` } }
						)
						.then(() => {
							get().fetchCart(token) // Re-fetch cart after successful update
						})
						.catch(err => {
							console.error('Error syncing quantity:', err)
							// Revert on error
							set({ cart })
						})
				}
			},

			removeFromCart: (cartItemId, token) => {
				const { cart } = get()
				const newCart = cart.filter(
					item => (item._id ?? item.cartItemId) !== cartItemId
				) // Support local and backend ids

				set({ cart: newCart }) // Optimistic update

				if (token) {
					// Only call backend if this item exists there
					const backendItem = cart.find(i => i._id === cartItemId)
					if (backendItem) {
						axios
							.delete(`/api/cart/${cartItemId}`, {
								headers: { Authorization: `Bearer ${token}` },
							})
							.then(() => {
								get().fetchCart(token) // Re-fetch cart after successful deletion
							})
							.catch(err => {
								console.error('Error removing from cart:', err)
								// Revert on error
								set({ cart })
							})
					}
				}
			},

			// Helper method to check if product is in cart
			isInCart: productId => {
				const { cart } = get()
				if (!productId) return false
				return cart.some(
					item => item && item.product && item.product._id === productId
				)
			},

			// Helper method to get cart item quantity
			getCartItemQuantity: productId => {
				const { cart } = get()
				if (!productId) return 0
				const item = cart.find(
					item => item && item.product && item.product._id === productId
				)
				return item ? item.quantity : 0
			},

			debouncedSync: debounce(async (item, quantity, token) => {
				try {
					const res = await axios.put(
						`/api/cart/${item._id}`,
						{ quantity, selectedSize: item.selectedSize },
						{ headers: { Authorization: `Bearer ${token}` } }
					)
					set({ cart: res.data })
				} catch (err) {
					console.error('Error syncing quantity:', err)
				}
			}, 200),

			// Clear cart (useful for after checkout)
			clearCart: () => set({ cart: [] }),
		}),
		{ name: 'cart-storage' }
	)
)
