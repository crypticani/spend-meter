import { useEffect, useState } from 'react';
import { Plus, Trash2, CalendarClock, Check } from 'lucide-react';
import { useRecurringStore } from '../stores/useRecurringStore';
import { useAccountStore } from '../stores/useAccountStore';
import { useCategoryStore } from '../stores/useCategoryStore';
import { useTransactionStore } from '../stores/useTransactionStore';
import { formatCurrency, toDateInputValue, getNextDueDate, formatDateShort } from '../utils/format';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';

export default function RecurringPayments() {
    const { recurringPayments, loadRecurringPayments, addRecurringPayment, deleteRecurringPayment, markInstallmentComplete } = useRecurringStore();
    const { accounts, loadAccounts, getAccount } = useAccountStore();
    const { categories, loadCategories, getCategory } = useCategoryStore();
    const { addTransaction } = useTransactionStore();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadRecurringPayments();
        loadAccounts();
        loadCategories();
    }, [loadRecurringPayments, loadAccounts, loadCategories]);

    const [form, setForm] = useState({
        name: '',
        amount: '',
        accountId: '',
        categoryId: '',
        frequency: 'monthly' as 'monthly' | 'weekly' | 'yearly',
        startDate: toDateInputValue(new Date()),
        totalInstallments: '',
        autoPay: false,
    });

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.amount || !form.accountId || !form.categoryId) return;

        await addRecurringPayment({
            name: form.name,
            amount: parseFloat(form.amount),
            accountId: form.accountId,
            categoryId: form.categoryId,
            frequency: form.frequency,
            startDate: new Date(form.startDate),
            totalInstallments: form.totalInstallments ? parseInt(form.totalInstallments) : undefined,
            isActive: true,
            autoPay: form.autoPay,
        });

        setForm({ name: '', amount: '', accountId: '', categoryId: '', frequency: 'monthly', startDate: toDateInputValue(new Date()), totalInstallments: '', autoPay: false });
        setShowModal(false);
    };

    const handlePayInstallment = async (rp: typeof recurringPayments[0]) => {
        const nextDue = getNextDueDate(rp.startDate, rp.frequency, rp.completedInstallments);

        // Create a transaction for this installment on the due date instead of 'now'
        const transferCat = categories.find((c) => c.name === 'Transfer') || categories[0];
        await addTransaction({
            accountId: rp.accountId,
            amount: rp.amount,
            type: 'expense',
            categoryId: rp.categoryId || transferCat?.id || '',
            description: `${rp.name} - EMI ${rp.completedInstallments + 1}${rp.totalInstallments ? `/${rp.totalInstallments}` : ''}`,
            date: nextDue,
        });
        await markInstallmentComplete(rp.id);
        await loadAccounts();
    };

    const active = recurringPayments.filter((r) => r.isActive);
    const completed = recurringPayments.filter((r) => !r.isActive);

    return (
        <div className="animate-fade-in">
            <PageHeader
                title="Recurring Payments"
                showBack
                rightAction={
                    <button
                        onClick={() => setShowModal(true)}
                        className="p-2 rounded-full hover:bg-[var(--color-bg-elevated)] transition-colors"
                    >
                        <Plus size={20} className="text-[var(--color-accent-light)]" />
                    </button>
                }
            />

            <div className="px-4 py-4 space-y-5">
                {recurringPayments.length === 0 ? (
                    <EmptyState
                        icon="📅"
                        title="No recurring payments"
                        description="Set up EMIs and recurring bills to track them automatically"
                        action={
                            <button
                                onClick={() => setShowModal(true)}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                                style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))' }}
                            >
                                Add Recurring Payment
                            </button>
                        }
                    />
                ) : (
                    <>
                        {active.length > 0 && (
                            <section>
                                <h2 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Active</h2>
                                <div className="space-y-2">
                                    {active.map((rp) => {
                                        const account = getAccount(rp.accountId);
                                        const category = getCategory(rp.categoryId);
                                        const progress = rp.totalInstallments ? (rp.completedInstallments / rp.totalInstallments) * 100 : 0;
                                        const nextDue = getNextDueDate(rp.startDate, rp.frequency, rp.completedInstallments);
                                        const isOverdue = nextDue < new Date() && !rp.autoPay;

                                        return (
                                            <div
                                                key={rp.id}
                                                className="p-4 rounded-xl group"
                                                style={{ background: 'var(--color-bg-card)' }}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-[var(--color-warning)]/10 flex items-center justify-center">
                                                            <CalendarClock size={18} className="text-[var(--color-warning)]" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold">{rp.name}</p>
                                                            <p className="text-xs text-[var(--color-text-muted)]">
                                                                {account?.name} · {rp.frequency} · {category?.name}
                                                            </p>
                                                            {rp.autoPay && (
                                                                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--color-accent)]/10 text-[var(--color-accent-light)] uppercase tracking-wider">
                                                                    Auto-Pay
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handlePayInstallment(rp)}
                                                            className="p-1.5 rounded-lg hover:bg-[var(--color-success)]/10 transition-colors"
                                                            title="Pay installment"
                                                        >
                                                            <Check size={14} className="text-[var(--color-success)]" />
                                                        </button>
                                                        <button
                                                            onClick={() => { if (confirm('Delete?')) deleteRecurringPayment(rp.id); }}
                                                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[var(--color-danger)]/10 transition-all"
                                                        >
                                                            <Trash2 size={14} className="text-[var(--color-danger)]" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-[var(--color-text-muted)]">
                                                            {rp.totalInstallments ? `${rp.completedInstallments}/${rp.totalInstallments} paid` : `${rp.completedInstallments} paid (Ongoing)`}
                                                        </span>
                                                        <span className={`text-[10px] font-medium mt-0.5 ${isOverdue ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-muted)]'}`}>
                                                            Next due: {formatDateShort(nextDue)} {isOverdue ? '(Overdue)' : ''}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-bold text-[var(--color-expense)]">
                                                        {formatCurrency(rp.amount)}
                                                    </span>
                                                </div>
                                                {rp.totalInstallments !== undefined && (
                                                    <div className="w-full h-1.5 rounded-full bg-[var(--color-bg-elevated)]">
                                                        <div
                                                            className="h-full rounded-full transition-all bg-[var(--color-warning)]"
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {completed.length > 0 && (
                            <section>
                                <h2 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Completed</h2>
                                <div className="space-y-2">
                                    {completed.map((rp) => (
                                        <div
                                            key={rp.id}
                                            className="p-3 rounded-xl opacity-60 flex items-center justify-between"
                                            style={{ background: 'var(--color-bg-card)' }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[var(--color-success)]/10 flex items-center justify-center">
                                                    <Check size={14} className="text-[var(--color-success)]" />
                                                </div>
                                                <span className="text-sm">{rp.name}</span>
                                            </div>
                                            <span className="text-xs text-[var(--color-text-muted)]">
                                                {rp.totalInstallments} installments done
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Recurring Payment">
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Home Loan EMI"
                            required
                            className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                            style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                        />
                    </div>

                    <div>
                        <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">Amount per Installment</label>
                        <input
                            type="number"
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            placeholder="0"
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                            style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                        />
                    </div>

                    <div>
                        <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">Account</label>
                        <select
                            value={form.accountId}
                            onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-xl outline-none text-sm appearance-none"
                            style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                        >
                            <option value="">Select account</option>
                            {accounts.map((a) => (
                                <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">Category</label>
                        <select
                            value={form.categoryId}
                            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-xl outline-none text-sm appearance-none"
                            style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                        >
                            <option value="">Select category</option>
                            {categories.filter((c) => c.type === 'expense' || c.type === 'both').map((c) => (
                                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">Frequency</label>
                            <select
                                value={form.frequency}
                                onChange={(e) => setForm({ ...form, frequency: e.target.value as 'monthly' | 'weekly' | 'yearly' })}
                                className="w-full px-4 py-3 rounded-xl outline-none text-sm appearance-none"
                                style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                            >
                                <option value="monthly">Monthly</option>
                                <option value="weekly">Weekly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">Installments</label>
                            <input
                                type="number"
                                value={form.totalInstallments}
                                onChange={(e) => setForm({ ...form, totalInstallments: e.target.value })}
                                placeholder="Unlimited"
                                min="1"
                                className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                                style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">Start Date</label>
                        <input
                            type="date"
                            value={form.startDate}
                            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                            style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', colorScheme: 'dark' }}
                        />
                    </div>

                    <div className="flex items-center gap-3 py-2">
                        <input
                            type="checkbox"
                            checked={form.autoPay}
                            onChange={(e) => setForm({ ...form, autoPay: e.target.checked })}
                            id="autopay-toggle"
                            className="w-4 h-4 rounded text-[var(--color-accent)] focus:ring-[var(--color-accent)] focus:ring-2 bg-[var(--color-bg-input)] border-var(--color-border)"
                        />
                        <label htmlFor="autopay-toggle" className="text-sm cursor-pointer select-none font-medium mb-0">
                            Auto Pay (process on due date)
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 rounded-xl text-sm font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))' }}
                    >
                        Add Recurring Payment
                    </button>
                </form>
            </Modal>
        </div>
    );
}
