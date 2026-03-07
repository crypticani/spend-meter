import { ArrowLeft, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
    title: string;
    showBack?: boolean;
    showSettings?: boolean;
    rightAction?: React.ReactNode;
}

export default function PageHeader({ title, showBack, showSettings, rightAction }: PageHeaderProps) {
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-40 glass">
            <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
                <div className="flex items-center gap-3">
                    {showBack && (
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 rounded-full hover:bg-[var(--color-bg-elevated)] transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <h1 className="text-lg font-bold">{title}</h1>
                </div>
                {showSettings && (
                    <button
                        onClick={() => navigate('/settings')}
                        className="p-2 -mr-2 rounded-full hover:bg-[var(--color-bg-elevated)] transition-colors"
                    >
                        <Settings size={20} />
                    </button>
                )}
                {rightAction}
            </div>
        </header>
    );
}
