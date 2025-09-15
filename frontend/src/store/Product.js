import { create } from 'zustand'
import api from '../config/axios.js'

export const useProductStore = create(set => ({
	products: [],
	bakerProducts: [],
	categories: [],
	loading: false,
	error: '',
	success: '',

	setProducts: products =>
		set({ products, error: '', success: '', loading: false }),

	createProduct: async (productData, token) => {
		set({ loading: true, error: '', success: '' })
		try {
			const res = await api.post('/products', productData, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'multipart/form-data',
				},
			})

			// Check the actual response structure from your backend
			// The product might be in res.data or res.data.product
			const newProduct = res.data.product || res.data

			set(state => ({
				products: [...state.products, newProduct],
				bakerProducts: [...state.bakerProducts, newProduct],
				loading: false,
				success: '✅ Product successfully added!',
			}))

			return { success: true, product: newProduct }
		} catch (err) {
			console.error('Axios request failed:', err.config)
			console.error('Axios response error:', err.response)
			const message = err.response?.data?.message || err.message
			set({ loading: false, error: message })
			return { success: false, message }
		}
	},

	fetchProductById: async productId => {
		try {
			const res = await api.get(`/products/${productId}`)
			return res.data || null
		} catch {
			return null
		}
	},

	fetchProducts: async (filters = {}) => {
		set({ loading: true, error: '' })
		try {
			const params = new URLSearchParams()
			if (filters.search) params.append('search', filters.search)
			if (filters.minPrice) params.append('minPrice', filters.minPrice)
			if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
			if (filters.ingredients)
				params.append('ingredients', filters.ingredients.join(','))
			if (filters.minRating) params.append('minRating', filters.minRating)
			if (filters.category) params.append('category', filters.category)

			const queryString = params.toString()
			const url = queryString ? `/products?${queryString}` : '/products'

			const res = await api.get(url)

			let productsData = []
			if (Array.isArray(res.data)) {
				productsData = res.data
			} else if (res.data && Array.isArray(res.data.data)) {
				productsData = res.data.data
			} else if (res.data && Array.isArray(res.data.products)) {
				productsData = res.data.products
			}

			set({ products: productsData, loading: false })
		} catch (err) {
			console.error('Error fetching products:', err)
			set({ loading: false, error: err.message })
		}
	},

	fetchProductsByBaker: async bakerId => {
		set({ loading: true, error: '' })
		try {
			const res = await api.get(`/products/bakers/${bakerId}`)
			set({ bakerProducts: res.data || [], loading: false })
		} catch (err) {
			set({ loading: false, error: err.message, bakerProducts: [] })
		}
	},

	fetchCategories: async () => {
		set({ loading: true, error: '' })
		try {
			const res = await api.get('/categories')

			let categoriesData = []
			if (Array.isArray(res.data)) {
				categoriesData = res.data
			} else if (res.data && Array.isArray(res.data.data)) {
				categoriesData = res.data.data
			} else if (res.data && Array.isArray(res.data.categories)) {
				categoriesData = res.data.categories
			}

			set({ categories: categoriesData, loading: false })
		} catch (err) {
			console.error('Error fetching categories:', err)
			set({ loading: false, error: err.message, categories: [] })
		}
	},

	fetchProductsByCategory: async categoryId => {
		// Now uses the general fetchProducts with a category filter
		set({ loading: true, error: '' })
		try {
			await useProductStore.getState().fetchProducts({ category: categoryId })
		} catch (err) {
			set({ loading: false, error: err.message })
		}
	},

	deleteProduct: async (productId, token) => {
		set({ loading: true, error: '', success: '' })
		try {
			const res = await api.delete(`/products/${productId}`, {
				headers: { Authorization: `Bearer ${token}` },
			})

			set(state => ({
				products: state.products.filter(p => p._id !== productId),
				loading: false,
				success: '✅ Product successfully deleted!',
			}))

			return { success: true }
		} catch (err) {
			const message = err.response?.data?.message || err.message
			set({ loading: false, error: message })
			return { success: false, message }
		}
	},

	clearMessages: () => set({ error: '', success: '' }),
}))
