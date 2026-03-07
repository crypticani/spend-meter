import { useRef, useState } from 'react';
import { Download, Upload, Trash2, FolderOpen, Heart } from 'lucide-react';
import { exportAllData, importAllData } from '../db/backup';
import { db } from '../db/database';
import { seedDefaultCategories } from '../db/seed';
import PageHeader from '../components/ui/PageHeader';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
    const [status, setStatus] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const handleExport = async () => {
        try {
            const data = await exportAllData();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `spendmeter-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            setStatus('✅ Data exported successfully!');
        } catch {
            setStatus('❌ Export failed');
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            await importAllData(text);
            setStatus('✅ Data imported successfully! Refresh to see changes.');
            setTimeout(() => window.location.reload(), 1500);
        } catch {
            setStatus('❌ Import failed. Invalid file format.');
        }
    };

    const handleClearAll = async () => {
        if (!confirm('⚠️ This will delete ALL your data. Are you sure?')) return;
        if (!confirm('This action cannot be undone. Continue?')) return;

        await db.accounts.clear();
        await db.transactions.clear();
        await db.categories.clear();
        await db.recurringPayments.clear();
        await seedDefaultCategories();
        setStatus('✅ All data cleared. Refreshing...');
        setTimeout(() => window.location.reload(), 1500);
    };

    return (
        <div className="animate-fade-in">
            <PageHeader title="Settings" showBack />

            <div className="px-4 py-4 space-y-4">
                {/* Navigation */}
                <section>
                    <h2 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Manage</h2>
                    <div className="space-y-2">
                        <SettingsLink icon={<FolderOpen size={18} />} label="Categories" onClick={() => navigate('/categories')} />
                        <SettingsLink icon={<FolderOpen size={18} />} label="Recurring Payments" onClick={() => navigate('/recurring')} />
                    </div>
                </section>

                {/* Backup */}
                <section>
                    <h2 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Backup & Restore</h2>
                    <div className="space-y-2">
                        <SettingsLink
                            icon={<Download size={18} className="text-[var(--color-success)]" />}
                            label="Export Data (JSON)"
                            description="Download all your data as a backup file"
                            onClick={handleExport}
                        />
                        <SettingsLink
                            icon={<Upload size={18} className="text-[var(--color-info)]" />}
                            label="Import Data (JSON)"
                            description="Restore data from a backup file"
                            onClick={() => fileRef.current?.click()}
                        />
                        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
                    </div>
                </section>

                {/* Danger Zone */}
                <section>
                    <h2 className="text-xs font-semibold text-[var(--color-danger)] uppercase tracking-wider mb-2">Danger Zone</h2>
                    <SettingsLink
                        icon={<Trash2 size={18} className="text-[var(--color-danger)]" />}
                        label="Clear All Data"
                        description="Permanently delete all accounts, transactions, and settings"
                        onClick={handleClearAll}
                        danger
                    />
                </section>

                {/* Status */}
                {status && (
                    <div className="p-3 rounded-xl text-sm text-center animate-fade-in" style={{ background: 'var(--color-bg-card)' }}>
                        {status}
                    </div>
                )}

                {/* About */}
                <section className="pt-4">
                    <div className="text-center text-xs text-[var(--color-text-muted)] space-y-1">
                        <p className="flex items-center justify-center gap-1">
                            Made with <Heart size={12} className="text-[var(--color-danger)]" /> by SpendMeter
                        </p>
                        <p>v1.0.0 · Open Source</p>
                        <p>All data stored locally in your browser</p>
                    </div>
                </section>
            </div>
        </div>
    );
}

function SettingsLink({
    icon,
    label,
    description,
    onClick,
    danger,
}: {
    icon: React.ReactNode;
    label: string;
    description?: string;
    onClick: () => void;
    danger?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-colors
        ${danger ? 'hover:bg-[var(--color-danger)]/5' : 'hover:bg-[var(--color-bg-elevated)]'}`}
            style={{ background: 'var(--color-bg-card)' }}
        >
            {icon}
            <div>
                <p className={`text-sm font-medium ${danger ? 'text-[var(--color-danger)]' : ''}`}>{label}</p>
                {description && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{description}</p>
                )}
            </div>
        </button>
    );
}
