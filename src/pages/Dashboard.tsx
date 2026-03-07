import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, CreditCard, CalendarClock, Wallet } from 'lucide-react';
import { useAccountStore } from '../stores/useAccountStore';
import { useTransactionStore } from '../stores/useTransactionStore';
import { useRecurringStore } from '../stores/useRecurringStore';
import { useCategoryStore } from '../stores/useCategoryStore';
import { formatCurrency } from '../utils/format';
import PageHeader from '../components/ui/PageHeader';

export default function Dashboard() {
    const { accounts, loadAccounts } = useAccountStore();
    const { transactions, loadTransactions } = useTransactionStore();
    const { loadRecurringPayments, getUpcomingPayments } = useRecurringStore();
    const { loadCategories } = useCategoryStore();
    const navigate = useNavigate();

    useEffect(() => {
        loadAccounts();
        loadTransactions();
        loadRecurringPayments();
        loadCategories();
    }, []);

    const stats = useMemo(() => {
        const now = new Date();
        const thisMonth = transactions.filter((t) => {
            const d = new Date(t.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        const totalBalance = accounts
            .filter((a) => a.type !== 'credit_card')
            .reduce((sum, a) => sum + a.balance, 0);

        const creditOutstanding = accounts
            .filter((a) => a.type === 'credit_card')
            .reduce((sum, a) => sum + Math.abs(Math.min(0, a.balance)), 0);

        const creditBalance = accounts
            .filter((a) => a.type === 'credit_card')
            .reduce((sum, a) => sum + a.balance, 0);

        const monthlyExpense = thisMonth
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const monthlyIncome = thisMonth
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const netWorth = totalBalance + creditBalance;

        return { totalBalance, creditOutstanding, creditBalance, monthlyExpense, monthlyIncome, netWorth };
    }, [accounts, transactions]);

    const upcomingPayments = getUpcomingPayments();

    return (
        <div className="animate-fade-in">
            <PageHeader title="SpendMeter" showSettings />

            <div className="px-4 py-4 space-y-4">
                {/* Net Worth Hero Card */}
                <div
                    className="relative overflow-hidden rounded-2xl p-5"
                    style={{
                        background: 'linear-gradient(135deg, var(--color-accent-dark), var(--color-accent), #a29bfe)',
                        boxShadow: 'var(--shadow-glow)',
                    }}
                >
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
                        style={{ background: 'white', transform: 'translate(30%, -30%)' }}
                    />
                    <p className="text-sm text-white/70 mb-1">Net Worth</p>
                    <p className="text-3xl font-bold text-white mb-3">{formatCurrency(stats.netWorth)}</p>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                <TrendingUp size={14} className="text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] text-white/60">Income</p>
                                <p className="text-xs font-semibold text-white">{formatCurrency(stats.monthlyIncome)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                <TrendingDown size={14} className="text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] text-white/60">Expense</p>
                                <p className="text-xs font-semibold text-white">{formatCurrency(stats.monthlyExpense)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <StatCard
                        icon={<Wallet size={18} className="text-[var(--color-success)]" />}
                        label="Total Balance"
                        value={formatCurrency(stats.totalBalance)}
                        color="var(--color-success)"
                    />
                    <StatCard
                        icon={<CreditCard size={18} className="text-[var(--color-warning)]" />}
                        label="Credit Used"
                        value={formatCurrency(stats.creditOutstanding)}
                        color="var(--color-warning)"
                    />
                    <StatCard
                        icon={<TrendingDown size={18} className="text-[var(--color-expense)]" />}
                        label="This Month"
                        value={formatCurrency(stats.monthlyExpense)}
                        color="var(--color-expense)"
                    />
                    <StatCard
                        icon={<TrendingUp size={18} className="text-[var(--color-income)]" />}
                        label="Income"
                        value={formatCurrency(stats.monthlyIncome)}
                        color="var(--color-income)"
                    />
                </div>

                {/* Accounts Quick View */}
                {accounts.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-semibold text-[var(--color-text-secondary)]">Accounts</h2>
                            <button
                                onClick={() => navigate('/accounts')}
                                className="text-xs text-[var(--color-accent-light)] hover:underline"
                            >
                                View all
                            </button>
                        </div>
                        <div className="space-y-2">
                            {accounts.slice(0, 4).map((account) => (
                                <div
                                    key={account.id}
                                    onClick={() => navigate(`/accounts/${account.id}`)}
                                    className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors hover:bg-[var(--color-bg-elevated)]"
                                    style={{ background: 'var(--color-bg-card)' }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                            style={{ background: `${account.color}20` }}
                                        >
                                            {account.icon}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{account.name}</p>
                                            <p className="text-xs text-[var(--color-text-muted)]">
                                                {account.type === 'bank' ? 'Bank' : account.type === 'credit_card' ? 'Credit Card' : 'Cash'}
                                            </p>
                                        </div>
                                    </div>
                                    <p className={`text-sm font-semibold ${account.balance >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                                        {formatCurrency(account.balance)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Upcoming Payments */}
                {upcomingPayments.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-semibold text-[var(--color-text-secondary)]">Upcoming Payments</h2>
                            <button
                                onClick={() => navigate('/recurring')}
                                className="text-xs text-[var(--color-accent-light)] hover:underline"
                            >
                                View all
                            </button>
                        </div>
                        <div className="space-y-2">
                            {upcomingPayments.slice(0, 3).map((rp) => (
                                <div
                                    key={rp.id}
                                    className="flex items-center justify-between p-3 rounded-xl"
                                    style={{ background: 'var(--color-bg-card)' }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[var(--color-warning)]/10 flex items-center justify-center">
                                            <CalendarClock size={18} className="text-[var(--color-warning)]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{rp.name}</p>
                                            <p className="text-xs text-[var(--color-text-muted)]">
                                                {rp.completedInstallments}/{rp.totalInstallments} paid
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold text-[var(--color-expense)]">
                                        {formatCurrency(rp.amount)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Recent Transactions */}
                {transactions.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-semibold text-[var(--color-text-secondary)]">Recent Transactions</h2>
                            <button
                                onClick={() => navigate('/transactions')}
                                className="text-xs text-[var(--color-accent-light)] hover:underline"
                            >
                                View all
                            </button>
                        </div>
                        <RecentTransactions transactions={transactions.slice(0, 5)} />
                    </section>
                )}

                {/* Empty State */}
                {accounts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <span className="text-5xl mb-4">📊</span>
                        <h3 className="text-lg font-semibold mb-2">Welcome to SpendMeter</h3>
                        <p className="text-sm text-[var(--color-text-muted)] mb-4 max-w-xs">
                            Start by adding your accounts to track spending
                        </p>
                        <button
                            onClick={() => navigate('/accounts')}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-transform hover:scale-105"
                            style={{
                                background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))',
                            }}
                        >
                            Add Account
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
    return (
        <div
            className="p-4 rounded-xl"
            style={{
                background: 'var(--color-bg-card)',
                borderLeft: `3px solid ${color}`,
            }}
        >
            <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-[var(--color-text-muted)]">{label}</span></div>
            <p className="text-lg font-bold">{value}</p>
        </div>
    );
}

function RecentTransactions({ transactions }: { transactions: import('../db/database').Transaction[] }) {
    const { getCategory } = useCategoryStore();
    const { getAccount } = useAccountStore();

    return (
        <div className="space-y-2">
            {transactions.map((tx) => {
                const category = getCategory(tx.categoryId);
                const account = getAccount(tx.accountId);
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
                                <p className="text-xs text-[var(--color-text-muted)]">{account?.name || ''}</p>
                            </div>
                        </div>
                        <p className={`text-sm font-semibold ${tx.type === 'income' ? 'text-[var(--color-income)]' : tx.type === 'expense' ? 'text-[var(--color-expense)]' : 'text-[var(--color-transfer)]'}`}>
                            {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatCurrency(tx.amount)}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
