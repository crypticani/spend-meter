import { create } from 'zustand';
import { db } from '../db/database';
import type { Category } from '../db/database';
import { v4 as uuidv4 } from 'uuid';

interface CategoryState {
    categories: Category[];
    loading: boolean;
    loadCategories: () => Promise<void>;
    addCategory: (cat: Omit<Category, 'id' | 'createdAt'>) => Promise<void>;
    updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    getCategory: (id: string) => Category | undefined;
    getCategoriesByType: (type: 'expense' | 'income') => Category[];
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
    categories: [],
    loading: true,

    loadCategories: async () => {
        const categories = await db.categories.toArray();
        set({ categories, loading: false });
    },

    addCategory: async (catData) => {
        const category: Category = {
            ...catData,
            id: uuidv4(),
            createdAt: new Date(),
        };
        await db.categories.add(category);
        set({ categories: [...get().categories, category] });
    },

    updateCategory: async (id, updates) => {
        await db.categories.update(id, updates);
        set({
            categories: get().categories.map((c) =>
                c.id === id ? { ...c, ...updates } : c
            ),
        });
    },

    deleteCategory: async (id) => {
        await db.categories.delete(id);
        set({ categories: get().categories.filter((c) => c.id !== id) });
    },

    getCategory: (id) => get().categories.find((c) => c.id === id),

    getCategoriesByType: (type) =>
        get().categories.filter((c) => c.type === type || c.type === 'both'),
}));
