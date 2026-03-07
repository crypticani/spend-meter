import { create } from 'zustand';
import { db } from '../db/database';
import type { Transaction } from '../db/database';
import { v4 as uuidv4 } from 'uuid';

interface TransactionState {
    transactions: Transaction[];
    loading: boolean;
    loadTransactions: () => Promise<void>;
    addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
    updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    getTransactionsByAccount: (accountId: string) => Transaction[];
    getTransactionsByMonth: (year: number, month: number) => Transaction[];
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
    transactions: [],
    loading: true,

    loadTransactions: async () => {
        const transactions = await db.transactions.orderBy('date').reverse().toArray();
        set({ transactions, loading: false });
    },

    addTransaction: async (txData) => {
        const tx: Transaction = {
            ...txData,
            id: uuidv4(),
            createdAt: new Date(),
        };
        await db.transactions.add(tx);

        // Update account balance
        if (txData.type === 'expense') {
            const account = await db.accounts.get(txData.accountId);
            if (account) {
                await db.accounts.update(txData.accountId, {
                    balance: account.balance - txData.amount,
                    updatedAt: new Date(),
                });
            }
        } else if (txData.type === 'income') {
            const account = await db.accounts.get(txData.accountId);
            if (account) {
                await db.accounts.update(txData.accountId, {
                    balance: account.balance + txData.amount,
                    updatedAt: new Date(),
                });
            }
        } else if (txData.type === 'transfer' && txData.toAccountId) {
            const fromAccount = await db.accounts.get(txData.accountId);
            const toAccount = await db.accounts.get(txData.toAccountId);
            if (fromAccount) {
                await db.accounts.update(txData.accountId, {
                    balance: fromAccount.balance - txData.amount,
                    updatedAt: new Date(),
                });
            }
            if (toAccount) {
                await db.accounts.update(txData.toAccountId, {
                    balance: toAccount.balance + txData.amount,
                    updatedAt: new Date(),
                });
            }
        }

        set({ transactions: [tx, ...get().transactions] });
    },

    updateTransaction: async (id, updates) => {
        await db.transactions.update(id, updates);
        set({
            transactions: get().transactions.map((t) =>
                t.id === id ? { ...t, ...updates } : t
            ),
        });
    },

    deleteTransaction: async (id) => {
        const tx = get().transactions.find((t) => t.id === id);
        if (tx) {
            // Reverse the balance change
            if (tx.type === 'expense') {
                const account = await db.accounts.get(tx.accountId);
                if (account) {
                    await db.accounts.update(tx.accountId, {
                        balance: account.balance + tx.amount,
                        updatedAt: new Date(),
                    });
                }
            } else if (tx.type === 'income') {
                const account = await db.accounts.get(tx.accountId);
                if (account) {
                    await db.accounts.update(tx.accountId, {
                        balance: account.balance - tx.amount,
                        updatedAt: new Date(),
                    });
                }
            } else if (tx.type === 'transfer' && tx.toAccountId) {
                const fromAccount = await db.accounts.get(tx.accountId);
                const toAccount = await db.accounts.get(tx.toAccountId);
                if (fromAccount) {
                    await db.accounts.update(tx.accountId, {
                        balance: fromAccount.balance + tx.amount,
                        updatedAt: new Date(),
                    });
                }
                if (toAccount) {
                    await db.accounts.update(tx.toAccountId, {
                        balance: toAccount.balance - tx.amount,
                        updatedAt: new Date(),
                    });
                }
            }
        }
        await db.transactions.delete(id);
        set({ transactions: get().transactions.filter((t) => t.id !== id) });
    },

    getTransactionsByAccount: (accountId) =>
        get().transactions.filter((t) => t.accountId === accountId || t.toAccountId === accountId),

    getTransactionsByMonth: (year, month) =>
        get().transactions.filter((t) => {
            const d = new Date(t.date);
            return d.getFullYear() === year && d.getMonth() === month;
        }),
}));
