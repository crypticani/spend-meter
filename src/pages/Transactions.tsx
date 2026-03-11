import { useEffect, useMemo, useState } from 'react';
import { useTransactionStore } from '../stores/useTransactionStore';
import { useAccountStore } from '../stores/useAccountStore';
import { useCategoryStore } from '../stores/useCategoryStore';
import { formatCurrency, formatDateShort } from '../utils/format';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';
import { Filter, Trash2, Edit2 } from 'lucide-react';

export default function Transactions() {
    const { transactions, loadTransactions, deleteTransaction } = useTransactionStore();
    const { loadAccounts, getAccount } = useAccountStore();
    const { loadCategories, getCategory } = useCategoryStore();
    const navigate = useNavigate();

    const [filterType, setFilterType] = useState<'all' | 'expense' | 'income' | 'transfer'>('all');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadTransactions();
        loadAccounts();
        loadCategories();
    }, []);

    const filtered = useMemo(
        () => filterType === 'all' ? transactions : transactions.filter((t) => t.type === filterType),
        [transactions, filterType]
    );

    // Group transactions by date
    const grouped = useMemo(() => {
        const groups: Record<string, typeof transactions> = {};
        filtered.forEach((tx) => {
            const key = new Date(tx.date).toDateString();
            if (!groups[key]) groups[key] = [];
            groups[key].push(tx);
        });
        return Object.entries(groups).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());
    }, [filtered]);

    const handleDelete = async (id: string) => {
        if (confirm('Delete this transaction?')) {
            await deleteTransaction(id);
            await loadAccounts();
        }
    };

    return (
        <div className="animate-fade-in">
            <PageHeader
                title="Transactions"
                rightAction={
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-full transition-colors ${showFilters ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent-light)]' : 'hover:bg-[var(--color-bg-elevated)]'}`}
                    >
                        <Filter size={20} />
                    </button>
                }
            />

            {showFilters && (
                <div className="px-4 py-3 flex gap-2 overflow-x-auto animate-fade-in">
                    {(['all', 'expense', 'income', 'transfer'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors
                ${filterType === type
                                    ? 'bg-[var(--color-accent)] text-white'
                                    : 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]'
                                }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>
            )}

            <div className="px-4 py-2">
                {grouped.length === 0 ? (
                    <EmptyState
                        icon="📝"
                        title="No transactions yet"
                        description="Tap the + button to add your first transaction"
                        action={
                            <button
                                onClick={() => navigate('/add')}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                                style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))' }}
                            >
                                Add Transaction
                            </button>
                        }
                    />
                ) : (
                    <div className="space-y-4">
                        {grouped.map(([dateStr, txs]) => (
                            <div key={dateStr}>
                                <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2 px-1">
                                    {formatDateShort(new Date(dateStr))}
                                </p>
                                <div className="space-y-1.5">
                                    {txs.map((tx) => {
                                        const category = getCategory(tx.categoryId);
                                        const account = getAccount(tx.accountId);
                                        const toAccount = tx.toAccountId ? getAccount(tx.toAccountId) : undefined;

                                        return (
                                            <div
                                                key={tx.id}
                                                className="flex items-center justify-between p-3 rounded-xl group"
                                                style={{ background: 'var(--color-bg-card)' }}
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div
                                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                                                        style={{ background: category ? `${category.color}20` : 'var(--color-bg-elevated)' }}
                                                    >
                                                        {category?.icon || '📌'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            {tx.description || category?.name || 'Transaction'}
                                                        </p>
                                                        <p className="text-xs text-[var(--color-text-muted)] truncate">
                                                            {tx.type === 'transfer'
                                                                ? `${account?.name || ''} → ${toAccount?.name || ''}`
                                                                : account?.name || ''
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-sm font-semibold whitespace-nowrap
                            ${tx.type === 'income' ? 'text-[var(--color-income)]'
                                                            : tx.type === 'expense' ? 'text-[var(--color-expense)]'
                                                                : 'text-[var(--color-transfer)]'
                                                        }`}
                                                    >
                                                        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatCurrency(tx.amount)}
                                                    </p>
                                                    <button
                                                        onClick={() => navigate(`/edit/${tx.id}`)}
                                                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[var(--color-accent)]/10 transition-all"
                                                    >
                                                        <Edit2 size={14} className="text-[var(--color-accent)]" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(tx.id)}
                                                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[var(--color-danger)]/10 transition-all"
                                                    >
                                                        <Trash2 size={14} className="text-[var(--color-danger)]" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
