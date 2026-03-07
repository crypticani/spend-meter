import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '../stores/useTransactionStore';
import { useAccountStore } from '../stores/useAccountStore';
import { useCategoryStore } from '../stores/useCategoryStore';
import { toDateInputValue } from '../utils/format';
import PageHeader from '../components/ui/PageHeader';

type TxType = 'expense' | 'income' | 'transfer';

export default function AddTransaction() {
    const navigate = useNavigate();
    const { addTransaction } = useTransactionStore();
    const { accounts, loadAccounts } = useAccountStore();
    const { categories, loadCategories } = useCategoryStore();

    const [type, setType] = useState<TxType>('expense');
    const [amount, setAmount] = useState('');
    const [accountId, setAccountId] = useState('');
    const [toAccountId, setToAccountId] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(toDateInputValue(new Date()));
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadAccounts();
        loadCategories();
    }, []);

    useEffect(() => {
        if (accounts.length > 0 && !accountId) {
            setAccountId(accounts[0].id);
        }
    }, [accounts]);

    const filteredCategories = categories.filter(
        (c) => c.type === type || c.type === 'both' || type === 'transfer'
    );

    useEffect(() => {
        if (type === 'transfer') {
            const transferCat = categories.find((c) => c.name === 'Transfer');
            if (transferCat) setCategoryId(transferCat.id);
        } else if (filteredCategories.length > 0 && !filteredCategories.find(c => c.id === categoryId)) {
            setCategoryId(filteredCategories[0].id);
        }
    }, [type, categories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !accountId || (!categoryId && type !== 'transfer')) return;
        if (type === 'transfer' && !toAccountId) return;

        setSaving(true);
        try {
            await addTransaction({
                accountId,
                toAccountId: type === 'transfer' ? toAccountId : undefined,
                amount: parseFloat(amount),
                type,
                categoryId,
                description,
                date: new Date(date),
            });
            await loadAccounts();
            navigate(-1);
        } catch {
            setSaving(false);
        }
    };

    const typeColors: Record<TxType, string> = {
        expense: 'var(--color-expense)',
        income: 'var(--color-income)',
        transfer: 'var(--color-transfer)',
    };

    return (
        <div className="animate-fade-in">
            <PageHeader title="Add Transaction" showBack />

            <form onSubmit={handleSubmit} className="px-4 py-4 space-y-5">
                {/* Type Selector */}
                <div className="flex rounded-xl overflow-hidden" style={{ background: 'var(--color-bg-card)' }}>
                    {(['expense', 'income', 'transfer'] as TxType[]).map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setType(t)}
                            className="flex-1 py-3 text-sm font-semibold transition-all"
                            style={{
                                background: type === t ? typeColors[t] : 'transparent',
                                color: type === t ? 'white' : 'var(--color-text-muted)',
                            }}
                        >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Amount Input */}
                <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">Amount</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-[var(--color-text-muted)]">₹</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            required
                            min="0"
                            step="0.01"
                            className="w-full pl-10 pr-4 py-4 rounded-xl text-2xl font-bold outline-none transition-colors"
                            style={{
                                background: 'var(--color-bg-card)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text-primary)',
                            }}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Account */}
                <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">
                        {type === 'transfer' ? 'From Account' : 'Account'}
                    </label>
                    <select
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl outline-none text-sm appearance-none"
                        style={{
                            background: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)',
                        }}
                    >
                        <option value="">Select account</option>
                        {accounts.map((a) => (
                            <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                        ))}
                    </select>
                </div>

                {/* To Account (for transfers) */}
                {type === 'transfer' && (
                    <div className="animate-fade-in">
                        <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">To Account</label>
                        <select
                            value={toAccountId}
                            onChange={(e) => setToAccountId(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl outline-none text-sm appearance-none"
                            style={{
                                background: 'var(--color-bg-card)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text-primary)',
                            }}
                        >
                            <option value="">Select account</option>
                            {accounts
                                .filter((a) => a.id !== accountId)
                                .map((a) => (
                                    <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                                ))}
                        </select>
                    </div>
                )}

                {/* Category */}
                {type !== 'transfer' && (
                    <div>
                        <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">Category</label>
                        <div className="grid grid-cols-4 gap-2">
                            {filteredCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setCategoryId(cat.id)}
                                    className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-all
                    ${categoryId === cat.id ? 'ring-2 scale-105' : ''}`}
                                    style={{
                                        background: categoryId === cat.id ? `${cat.color}20` : 'var(--color-bg-card)',
                                        ...(categoryId === cat.id ? { borderColor: cat.color, borderWidth: '2px', borderStyle: 'solid' } : {}),
                                    }}
                                >
                                    <span className="text-xl">{cat.icon}</span>
                                    <span className="text-[10px] text-[var(--color-text-secondary)] truncate w-full">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Description */}
                <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">Description</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add a note..."
                        className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                        style={{
                            background: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)',
                        }}
                    />
                </div>

                {/* Date */}
                <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                        style={{
                            background: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)',
                            colorScheme: 'dark',
                        }}
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={saving || !amount || !accountId}
                    className="w-full py-4 rounded-xl text-base font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                    style={{
                        background: `linear-gradient(135deg, ${typeColors[type]}, ${typeColors[type]}cc)`,
                    }}
                >
                    {saving ? 'Saving...' : `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                </button>
            </form>
        </div>
    );
}
