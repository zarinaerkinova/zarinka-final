import { create } from 'zustand'
import axios from 'axios'

const useReviewStore = create(set => ({
	bakerReviews: [],
	error: null,
	fetchBakerReviews: async bakerId => {
		try {
			const { data } = await axios.get(
				`http://localhost:5000/api/reviews/baker/${bakerId}`
			)
			set({ bakerReviews: data })
		} catch (error) {
			set({ error: error.response.data.msg })
		}
	},
}))

export default useReviewStore
