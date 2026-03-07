import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useCategoryStore } from '../stores/useCategoryStore';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';

export default function Categories() {
    const { categories, loadCategories, addCategory, deleteCategory } = useCategoryStore();
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');

    useEffect(() => {
        loadCategories();
    }, []);

    const [form, setForm] = useState({
        name: '',
        icon: '📌',
        color: '#6c5ce7',
        type: 'expense' as 'expense' | 'income' | 'both',
    });

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name) return;

        await addCategory({
            name: form.name,
            icon: form.icon,
            color: form.color,
            type: form.type,
            isDefault: false,
        });

        setForm({ name: '', icon: '📌', color: '#6c5ce7', type: 'expense' });
        setShowModal(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this category?')) {
            await deleteCategory(id);
        }
    };

    const filtered = filter === 'all'
        ? categories
        : categories.filter((c) => c.type === filter || c.type === 'both');

    const emojis = ['📌', '🍕', '🚗', '🛍️', '💡', '📱', '🏠', '✈️', '🎬', '💊', '📚', '🛒', '💰', '💻', '📈', '🎁', '🎮', '🏋️', '🎵', '☕', '🐾', '💇', '🔧', '🎨'];
    const colors = ['#6c5ce7', '#00cec9', '#ff6b81', '#ffc048', '#74b9ff', '#a29bfe', '#fd79a8', '#e17055', '#00b894', '#0984e3', '#55efc4', '#fab1a0'];

    return (
        <div className="animate-fade-in">
            <PageHeader
                title="Categories"
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

            <div className="px-4 py-3 flex gap-2">
                {(['all', 'expense', 'income'] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors
              ${filter === type
                                ? 'bg-[var(--color-accent)] text-white'
                                : 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)]'
                            }`}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                ))}
            </div>

            <div className="px-4 py-2 grid grid-cols-3 gap-2">
                {filtered.map((cat) => (
                    <div
                        key={cat.id}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl relative group"
                        style={{ background: 'var(--color-bg-card)' }}
                    >
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                            style={{ background: `${cat.color}20` }}
                        >
                            {cat.icon}
                        </div>
                        <span className="text-xs text-[var(--color-text-secondary)] text-center truncate w-full">{cat.name}</span>
                        {!cat.isDefault && (
                            <button
                                onClick={() => handleDelete(cat.id)}
                                className="absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-[var(--color-danger)]/10 transition-all"
                            >
                                <Trash2 size={12} className="text-[var(--color-danger)]" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Category">
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Pets"
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
                        <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">Icon</label>
                        <div className="grid grid-cols-8 gap-1.5">
                            {emojis.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setForm({ ...form, icon: emoji })}
                                    className={`p-2 rounded-lg text-lg transition-all
                    ${form.icon === emoji ? 'ring-2 ring-[var(--color-accent)] scale-110' : ''}`}
                                    style={{ background: form.icon === emoji ? 'var(--color-accent)/10' : 'var(--color-bg-input)' }}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">Color</label>
                        <div className="flex gap-2 flex-wrap">
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setForm({ ...form, color })}
                                    className={`w-8 h-8 rounded-full transition-all ${form.color === color ? 'ring-2 ring-white scale-110' : ''}`}
                                    style={{ background: color }}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-[var(--color-text-muted)] mb-1.5 block">Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['expense', 'income', 'both'] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setForm({ ...form, type: t })}
                                    className={`py-2 rounded-xl text-xs font-medium transition-colors
                    ${form.type === t ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-input)] text-[var(--color-text-secondary)]'}`}
                                >
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 rounded-xl text-sm font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))' }}
                    >
                        Add Category
                    </button>
                </form>
            </Modal>
        </div>
    );
}
