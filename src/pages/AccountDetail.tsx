import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAccountStore } from '../stores/useAccountStore';
import { useTransactionStore } from '../stores/useTransactionStore';
import { useCategoryStore } from '../stores/useCategoryStore';
import { formatCurrency, formatDateShort, getAccountTypeLabel } from '../utils/format';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';

export default function AccountDetail() {
    const { id } = useParams<{ id: string }>();
    const { loadAccounts, getAccount } = useAccountStore();
    const { transactions, loadTransactions } = useTransactionStore();
    const { loadCategories, getCategory } = useCategoryStore();

    useEffect(() => {
        loadAccounts();
        loadTransactions();
        loadCategories();
    }, []);

    const account = getAccount(id || '');
    const accountTransactions = useMemo(
        () => transactions.filter((t) => t.accountId === id || t.toAccountId === id),
        [transactions, id]
    );

    if (!account) {
        return (
            <div>
                <PageHeader title="Account" showBack />
                <EmptyState icon="❓" title="Account not found" description="This account doesn't exist" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <PageHeader title={account.name} showBack />

            <div className="px-4 py-4 space-y-4">
                {/* Account Card */}
                <div
                    className="rounded-2xl p-5 relative overflow-hidden"
                    style={{
                        background: `linear-gradient(135deg, ${account.color}dd, ${account.color}88)`,
                    }}
                >
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10"
                        style={{ background: 'white', transform: 'translate(30%, -30%)' }}
                    />
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">{account.icon}</span>
                        <div>
                            <p className="text-base font-bold text-white">{account.name}</p>
                            <p className="text-xs text-white/70">{getAccountTypeLabel(account.type)}</p>
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{formatCurrency(account.balance)}</p>
                    {account.creditLimit && (
                        <div className="mt-2">
                            <div className="flex justify-between text-xs text-white/70 mb-1">
                                <span>Used</span>
                                <span>{formatCurrency(account.creditLimit)}</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-white/20">
                                <div
                                    className="h-full rounded-full bg-white/80 transition-all"
                                    style={{ width: `${Math.min(100, Math.max(0, ((account.creditLimit - account.balance) / account.creditLimit) * 100))}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Transactions */}
                <h2 className="text-sm font-semibold text-[var(--color-text-secondary)]">Transaction History</h2>
                {accountTransactions.length === 0 ? (
                    <EmptyState icon="📝" title="No transactions" description="No transactions for this account yet" />
                ) : (
                    <div className="space-y-2">
                        {accountTransactions.map((tx) => {
                            const category = getCategory(tx.categoryId);
                            const isIncoming = tx.type === 'income' || (tx.type === 'transfer' && tx.toAccountId === id);

                            return (
                                <div
                                    key={tx.id}
                                    className="flex items-center justify-between p-3 rounded-xl"
                                    style={{ background: 'var(--color-bg-card)' }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                            style={{ background: category ? `${category.color}20` : 'var(--color-bg-elevated)' }}
                                        >
                                            {category?.icon || '📌'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{tx.description || category?.name || 'Transaction'}</p>
                                            <p className="text-xs text-[var(--color-text-muted)]">{formatDateShort(tx.date)}</p>
                                        </div>
                                    </div>
                                    <p className={`text-sm font-semibold ${isIncoming ? 'text-[var(--color-income)]' : 'text-[var(--color-expense)]'}`}>
                                        {isIncoming ? '+' : '-'}{formatCurrency(tx.amount)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
