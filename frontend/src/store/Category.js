import { create } from 'zustand';

export const useCategoryStore = create((set) => ({
    categories: [],
    loading: false,
    error: '',
    success: '',

    createCategory: async (categoryData, token) => {
        set({ loading: true, error: '', success: '' });
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(categoryData),
            });

            const data = await res.json();

            if (!res.ok) {
                set({ loading: false, error: data.message || 'Ошибка добавления категории' });
                return { success: false, message: data.message || 'Ошибка добавления категории' };
            }

            set((state) => ({
                categories: [...state.categories, data.category],
                loading: false,
                success: 'Категория успешно добавлена!',
            }));

            return { success: true, category: data.category };
        } catch (err) {
            set({ loading: false, error: err.message || 'Ошибка сети' });
            return { success: false, message: err.message || 'Ошибка сети' };
        }
    },

    fetchCategories: async () => {
        set({ loading: true, error: '' });
        try {
            const res = await fetch('/api/categories');
            const response = await res.json();
            if (!res.ok) throw new Error(response.message || 'Failed to fetch categories');

            set({ categories: response.data, loading: false });
            return { success: true };
        } catch (err) {
            set({ loading: false, error: err.message });
            return { success: false, message: err.message };
        }
    },

    updateCategory: async (categoryId, categoryData, token) => {
        set({ loading: true, error: '', success: '' });
        try {
            const res = await fetch(`/api/categories/${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(categoryData),
            });

            const data = await res.json();

            if (!res.ok) {
                set({ loading: false, error: data.message || 'Ошибка обновления категории' });
                return { success: false, message: data.message || 'Ошибка обновления категории' };
            }

            set((state) => ({
                categories: state.categories.map(cat => 
                    cat._id === categoryId ? data.data : cat
                ),
                loading: false,
                success: 'Категория успешно обновлена!',
            }));

            return { success: true, category: data.data };
        } catch (err) {
            set({ loading: false, error: err.message || 'Ошибка сети' });
            return { success: false, message: err.message || 'Ошибка сети' };
        }
    },

    deleteCategory: async (categoryId, token) => {
        set({ loading: true, error: '', success: '' });
        try {
            const res = await fetch(`/api/categories/${categoryId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok) {
                set({ loading: false, error: data.message || 'Ошибка удаления категории' });
                return { success: false, message: data.message || 'Ошибка удаления категории' };
            }

            set((state) => ({
                categories: state.categories.filter(cat => cat._id !== categoryId),
                loading: false,
                success: 'Категория успешно удалена!',
            }));

            return { success: true };
        } catch (err) {
            set({ loading: false, error: err.message || 'Ошибка сети' });
            return { success: false, message: err.message || 'Ошибка сети' };
        }
    },

    clearMessages: () => set({ error: '', success: '' }),
})); 