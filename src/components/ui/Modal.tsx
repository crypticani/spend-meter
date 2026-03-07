import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div
                className="relative w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl animate-slide-up"
                style={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                }}
            >
                <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]" style={{ background: 'var(--color-bg-secondary)' }}>
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-[var(--color-bg-elevated)] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}
