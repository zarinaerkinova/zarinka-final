import { create } from 'zustand';

export const useFavoriteStore = create((set) => ({
    favorites: [],
    addToFavorite: (item) => set((state) => {
        if (!state.favorites.some(fav => fav._id === item._id)) {
            return { favorites: [...state.favorites, item] };
        }
        return state;
    }),
    removeFromFavorite: (itemId) => set((state) => ({
        favorites: state.favorites.filter(fav => fav._id !== itemId)
    })),
}));