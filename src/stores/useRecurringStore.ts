import { create } from 'zustand';
import { db } from '../db/database';
import type { RecurringPayment } from '../db/database';
import { v4 as uuidv4 } from 'uuid';

interface RecurringState {
    recurringPayments: RecurringPayment[];
    loading: boolean;
    loadRecurringPayments: () => Promise<void>;
    addRecurringPayment: (rp: Omit<RecurringPayment, 'id' | 'createdAt' | 'completedInstallments'>) => Promise<void>;
    updateRecurringPayment: (id: string, updates: Partial<RecurringPayment>) => Promise<void>;
    deleteRecurringPayment: (id: string) => Promise<void>;
    markInstallmentComplete: (id: string) => Promise<void>;
    getUpcomingPayments: () => RecurringPayment[];
}

export const useRecurringStore = create<RecurringState>((set, get) => ({
    recurringPayments: [],
    loading: true,

    loadRecurringPayments: async () => {
        const recurringPayments = await db.recurringPayments.toArray();
        set({ recurringPayments, loading: false });
    },

    addRecurringPayment: async (rpData) => {
        const rp: RecurringPayment = {
            ...rpData,
            id: uuidv4(),
            completedInstallments: 0,
            autoPay: rpData.autoPay ?? false,
            createdAt: new Date(),
        };
        await db.recurringPayments.add(rp);
        set({ recurringPayments: [...get().recurringPayments, rp] });
    },

    updateRecurringPayment: async (id, updates) => {
        await db.recurringPayments.update(id, updates);
        set({
            recurringPayments: get().recurringPayments.map((r) =>
                r.id === id ? { ...r, ...updates } : r
            ),
        });
    },

    deleteRecurringPayment: async (id) => {
        await db.recurringPayments.delete(id);
        set({ recurringPayments: get().recurringPayments.filter((r) => r.id !== id) });
    },

    markInstallmentComplete: async (id) => {
        const rp = get().recurringPayments.find((r) => r.id === id);
        if (rp) {
            const completed = rp.completedInstallments + 1;
            const isActive = rp.totalInstallments ? completed < rp.totalInstallments : true;
            await db.recurringPayments.update(id, {
                completedInstallments: completed,
                isActive,
            });
            set({
                recurringPayments: get().recurringPayments.map((r) =>
                    r.id === id ? { ...r, completedInstallments: completed, isActive } : r
                ),
            });
        }
    },

    getUpcomingPayments: () =>
        get().recurringPayments.filter((r) => r.isActive),
}));
