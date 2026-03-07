import { create } from 'zustand';
import { db } from '../db/database';
import type { Account } from '../db/database';
import { v4 as uuidv4 } from 'uuid';

interface AccountState {
    accounts: Account[];
    loading: boolean;
    loadAccounts: () => Promise<void>;
    addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
    deleteAccount: (id: string) => Promise<void>;
    getAccount: (id: string) => Account | undefined;
}

export const useAccountStore = create<AccountState>((set, get) => ({
    accounts: [],
    loading: true,

    loadAccounts: async () => {
        const accounts = await db.accounts.orderBy('createdAt').reverse().toArray();
        set({ accounts, loading: false });
    },

    addAccount: async (accountData) => {
        const account: Account = {
            ...accountData,
            id: uuidv4(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await db.accounts.add(account);
        set({ accounts: [account, ...get().accounts] });
    },

    updateAccount: async (id, updates) => {
        await db.accounts.update(id, { ...updates, updatedAt: new Date() });
        set({
            accounts: get().accounts.map((a) =>
                a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
            ),
        });
    },

    deleteAccount: async (id) => {
        await db.accounts.delete(id);
        await db.transactions.where('accountId').equals(id).delete();
        set({ accounts: get().accounts.filter((a) => a.id !== id) });
    },

    getAccount: (id) => get().accounts.find((a) => a.id === id),
}));
