import { create } from 'zustand'

export const useBakerStore = create(set => ({
	bakers: [],
	selectedBaker: null,

	fetchBakers: async () => {
		try {
			const response = await fetch('/api/auth/bakers')
			const data = await response.json()
			set({ bakers: data })
		} catch (error) {
			console.error('Failed to fetch bakers', error)
		}
	},

	fetchBakerById: async bakerId => {
		try {
			const response = await fetch(`/api/auth/bakers/${bakerId}`)
			const data = await response.json()
			set({ selectedBaker: data })
		} catch (error) {
			console.error('Failed to fetch baker', error)
		}
	},

	clearSelectedBaker: () => set({ selectedBaker: null }),
}))
