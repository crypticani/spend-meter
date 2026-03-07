import { db } from './database';
import type { Category } from './database';
import { v4 as uuidv4 } from 'uuid';

const defaultCategories: Omit<Category, 'id' | 'createdAt'>[] = [
    { name: 'Food & Dining', icon: '🍕', color: '#ff6b6b', type: 'expense', isDefault: true },
    { name: 'Transport', icon: '🚗', color: '#74b9ff', type: 'expense', isDefault: true },
    { name: 'Shopping', icon: '🛍️', color: '#a29bfe', type: 'expense', isDefault: true },
    { name: 'Bills & Utilities', icon: '💡', color: '#ffc048', type: 'expense', isDefault: true },
    { name: 'Subscriptions', icon: '📱', color: '#fd79a8', type: 'expense', isDefault: true },
    { name: 'Rent', icon: '🏠', color: '#00cec9', type: 'expense', isDefault: true },
    { name: 'Travel', icon: '✈️', color: '#6c5ce7', type: 'expense', isDefault: true },
    { name: 'Entertainment', icon: '🎬', color: '#e17055', type: 'expense', isDefault: true },
    { name: 'Health', icon: '💊', color: '#00b894', type: 'expense', isDefault: true },
    { name: 'Education', icon: '📚', color: '#0984e3', type: 'expense', isDefault: true },
    { name: 'Groceries', icon: '🛒', color: '#55efc4', type: 'expense', isDefault: true },
    { name: 'Personal Care', icon: '💇', color: '#fab1a0', type: 'expense', isDefault: true },
    { name: 'Salary', icon: '💰', color: '#00cec9', type: 'income', isDefault: true },
    { name: 'Freelance', icon: '💻', color: '#6c5ce7', type: 'income', isDefault: true },
    { name: 'Investment', icon: '📈', color: '#00b894', type: 'income', isDefault: true },
    { name: 'Gift', icon: '🎁', color: '#fd79a8', type: 'both', isDefault: true },
    { name: 'Other', icon: '📌', color: '#636e72', type: 'both', isDefault: true },
    { name: 'Transfer', icon: '🔄', color: '#74b9ff', type: 'both', isDefault: true },
];

export async function seedDefaultCategories() {
    const count = await db.categories.count();
    if (count === 0) {
        const categories: Category[] = defaultCategories.map((cat) => ({
            ...cat,
            id: uuidv4(),
            createdAt: new Date(),
        }));
        await db.categories.bulkAdd(categories);
    }
}
