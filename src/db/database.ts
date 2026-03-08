import Dexie, { type EntityTable } from 'dexie';

export interface Account {
    id: string;
    name: string;
    type: 'bank' | 'credit_card' | 'cash';
    balance: number;
    creditLimit?: number;
    color: string;
    icon: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Transaction {
    id: string;
    accountId: string;
    toAccountId?: string; // for transfers
    amount: number;
    type: 'expense' | 'income' | 'transfer';
    categoryId: string;
    description: string;
    date: Date;
    createdAt: Date;
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: 'expense' | 'income' | 'both';
    isDefault: boolean;
    createdAt: Date;
}

export interface RecurringPayment {
    id: string;
    name: string;
    amount: number;
    accountId: string;
    categoryId: string;
    frequency: 'monthly' | 'weekly' | 'yearly';
    startDate: Date;
    totalInstallments?: number;
    completedInstallments: number;
    isActive: boolean;
    createdAt: Date;
}

class SpendMeterDB extends Dexie {
    accounts!: EntityTable<Account, 'id'>;
    transactions!: EntityTable<Transaction, 'id'>;
    categories!: EntityTable<Category, 'id'>;
    recurringPayments!: EntityTable<RecurringPayment, 'id'>;

    constructor() {
        super('SpendMeterDB');
        this.version(1).stores({
            accounts: 'id, name, type, createdAt',
            transactions: 'id, accountId, toAccountId, type, categoryId, date, createdAt',
            categories: 'id, name, type, isDefault',
            recurringPayments: 'id, accountId, categoryId, isActive, startDate',
        });
    }
}

export const db = new SpendMeterDB();
