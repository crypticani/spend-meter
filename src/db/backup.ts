import { db } from './database';
import type { Account, Transaction, Category, RecurringPayment } from './database';

export async function exportAllData(): Promise<string> {
    const accounts = await db.accounts.toArray();
    const transactions = await db.transactions.toArray();
    const categories = await db.categories.toArray();
    const recurringPayments = await db.recurringPayments.toArray();

    const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        accounts,
        transactions,
        categories,
        recurringPayments,
    };

    return JSON.stringify(data, null, 2);
}

export async function importAllData(jsonString: string): Promise<void> {
    const data = JSON.parse(jsonString);

    if (!data.version || !data.accounts || !data.transactions) {
        throw new Error('Invalid backup file format');
    }

    await db.transaction('rw', [db.accounts, db.transactions, db.categories, db.recurringPayments], async () => {
        await db.accounts.clear();
        await db.transactions.clear();
        await db.categories.clear();
        await db.recurringPayments.clear();

        if (data.accounts?.length) {
            await db.accounts.bulkAdd(data.accounts.map((a: Account) => ({
                ...a,
                createdAt: new Date(a.createdAt),
                updatedAt: new Date(a.updatedAt),
            })));
        }

        if (data.transactions?.length) {
            await db.transactions.bulkAdd(data.transactions.map((t: Transaction) => ({
                ...t,
                date: new Date(t.date),
                createdAt: new Date(t.createdAt),
            })));
        }

        if (data.categories?.length) {
            await db.categories.bulkAdd(data.categories.map((c: Category) => ({
                ...c,
                createdAt: new Date(c.createdAt),
            })));
        }

        if (data.recurringPayments?.length) {
            await db.recurringPayments.bulkAdd(data.recurringPayments.map((r: RecurringPayment) => ({
                ...r,
                startDate: new Date(r.startDate),
                createdAt: new Date(r.createdAt),
            })));
        }
    });
}
