import { create } from 'zustand'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const useReviewStore = create(set => ({
	reviews: [],
	bakerReviews: [],
	userReviews: [],
	loading: false,
	error: null,

	fetchReviews: async productId => {
		set({ loading: true, error: null })
		try {
			const response = await axios.get(`${API_URL}/reviews/product/${productId}`)
			set({ reviews: response.data, loading: false })
		} catch (error) {
			set({ error: error.message, loading: false })
		}
	},

	fetchBakerReviews: async bakerId => {
		set({ loading: true, error: null })
		try {
			const response = await axios.get(`${API_URL}/reviews/baker/${bakerId}`)
			set({ bakerReviews: response.data, loading: false })
		} catch (error) {
			set({ error: error.message, loading: false })
		}
	},

	fetchUserReviews: async token => {
		set({ loading: true, error: null })
		try {
			const response = await axios.get(`${API_URL}/reviews/user/my-reviews`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			set({ userReviews: response.data, loading: false })
		} catch (error) {
			set({ error: error.message, loading: false })
		}
	},

	addReview: async (productId, reviewData, token) => {
		set({ loading: true, error: null })
		try {
			const response = await axios.post(
				`${API_URL}/reviews/product/${productId}`,
				reviewData,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			)
			set(state => ({
				reviews: [...state.reviews, response.data],
				loading: false,
			}))
		} catch (error) {
			set({ error: error.message, loading: false })
		}
	},

	updateReview: async (reviewId, reviewData, token) => {
		set({ loading: true, error: null })
		try {
			const response = await axios.put(
				`${API_URL}/reviews/${reviewId}`,
				reviewData,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			)
			set(state => ({
				reviews: state.reviews.map(review =>
					review._id === reviewId ? response.data : review
				),
				loading: false,
			}))
		} catch (error) {
			set({ error: error.message, loading: false })
		}
	},

	deleteReview: async (reviewId, token) => {
		set({ loading: true, error: null })
		try {
			await axios.delete(`${API_URL}/reviews/${reviewId}`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			set(state => ({
				reviews: state.reviews.filter(review => review._id !== reviewId),
				loading: false,
			}))
		} catch (error) {
			set({ error: error.message, loading: false })
		}
	},

	deleteUserReview: async (reviewId, token) => {
		set({ loading: true, error: null })
		try {
			await axios.delete(`${API_URL}/reviews/user/${reviewId}`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			set(state => ({
				userReviews: state.userReviews.filter(review => review._id !== reviewId),
				loading: false,
			}))
		} catch (error) {
			set({ error: error.message, loading: false })
		}
	},
}))
