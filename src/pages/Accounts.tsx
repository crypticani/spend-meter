import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useAccountStore } from '../stores/useAccountStore';
import { formatCurrency, getAccountTypeIcon, getAccountTypeLabel, getRandomAccountColor } from '../utils/format';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';

export default function Accounts() {
    const { accounts, loadAccounts, addAccount, deleteAccount } = useAccountStore();
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadAccounts();
    }, []);

    const [form, setForm] = useState({
        name: '',
        type: 'bank' as 'bank' | 'credit_card' | 'cash',
        balance: '',
        creditLimit: '',
    });

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.balance) return;

        await addAccount({
            name: form.name,
            type: form.type,
            balance: parseFloat(form.balance),
            creditLimit: form.creditLimit ? parseFloat(form.creditLimit) : undefined,
            color: getRandomAccountColor(),
            icon: getAccountTypeIcon(form.type),
        });

        setForm({ name: '', type: 'bank', balance: '', creditLimit: '' });
        setShowModal(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this account and all its transactions?')) {
            await deleteAccount(id);
        }
    };

    // Group by type
    const grouped = {
        bank: accounts.filter((a) => a.type === 'bank'),
        credit_card: accounts.filter((a) => a.type === 'credit_card'),
        cash: accounts.filter((a) => a.type === 'cash'),
    };

    return (
        <div className="animate-fade-in">
            <PageHeader
                title="Accounts"
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
                {accounts.length === 0 ? (
                    <EmptyState
                        icon="🏦"
                        title="No accounts yet"
                        description="Add your bank accounts, credit cards, and cash wallets"
                        action={
                            <button
                                onClick={() => setShowModal(true)}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                                style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))' }}
                            >
                                Add Account
                            </button>
                        }
                    />
                ) : (
                    <>
                        {Object.entries(grouped).map(([type, accs]) =>
                            accs.length > 0 ? (
                                <section key={type}>
                                    <h2 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                                        {getAccountTypeLabel(type)}s
                                    </h2>
                                    <div className="space-y-2">
                                        {accs.map((account) => (
                                            <div
                                                key={account.id}
                                                className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors hover:bg-[var(--color-bg-elevated)] group"
                                                style={{ background: 'var(--color-bg-card)' }}
                                                onClick={() => navigate(`/accounts/${account.id}`)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                                                        style={{ background: `${account.color}20` }}
                                                    >
                                                        {account.icon}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold">{account.name}</p>
                                                        {account.creditLimit && (
                                                            <p className="text-xs text-[var(--color-text-muted)]">
                                                                Limit: {formatCurrency(account.creditLimit)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-base font-bold ${account.balance >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                                                        {formatCurrency(account.balance)}
                                                    </p>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(account.id);
                                                        }}
                                                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[var(--color-danger)]/10 transition-all"
                                                    >
                                                        <Trash2 size={14} className="text-[var(--color-danger)]" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ) : null
                        )}
                    </>
                )}
            </div>

            {/* Add Account Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Account">
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">Account Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. HDFC Savings"
                            required
                            className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                            style={{
                                background: 'var(--color-bg-input)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text-primary)',
                            }}
                        />
                    </div>

                    <div>
                        <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">Account Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            {([
                                { value: 'bank', icon: '🏦', label: 'Bank' },
                                { value: 'credit_card', icon: '💳', label: 'Credit Card' },
                                { value: 'cash', icon: '💵', label: 'Cash' },
                            ] as const).map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setForm({ ...form, type: opt.value })}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all
                    ${form.type === opt.value ? 'ring-2 ring-[var(--color-accent)] bg-[var(--color-accent)]/10' : ''}`}
                                    style={{ background: form.type === opt.value ? undefined : 'var(--color-bg-input)' }}
                                >
                                    <span className="text-xl">{opt.icon}</span>
                                    <span className="text-xs">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">
                            {form.type === 'credit_card' ? 'Current Balance (negative if owed)' : 'Opening Balance'}
                        </label>
                        <input
                            type="number"
                            value={form.balance}
                            onChange={(e) => setForm({ ...form, balance: e.target.value })}
                            placeholder="0"
                            required
                            step="0.01"
                            className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                            style={{
                                background: 'var(--color-bg-input)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text-primary)',
                            }}
                        />
                    </div>

                    {form.type === 'credit_card' && (
                        <div className="animate-fade-in">
                            <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">Credit Limit</label>
                            <input
                                type="number"
                                value={form.creditLimit}
                                onChange={(e) => setForm({ ...form, creditLimit: e.target.value })}
                                placeholder="e.g. 100000"
                                step="0.01"
                                className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                                style={{
                                    background: 'var(--color-bg-input)',
                                    border: '1px solid var(--color-border)',
                                    color: 'var(--color-text-primary)',
                                }}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02]"
                        style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))' }}
                    >
                        Add Account
                    </button>
                </form>
            </Modal>
        </div>
    );
}
