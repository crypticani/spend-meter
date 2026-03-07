interface EmptyStateProps {
    icon: string;
    title: string;
    description: string;
    action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in">
            <span className="text-5xl mb-4">{icon}</span>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">{title}</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-xs">{description}</p>
            {action}
        </div>
    );
}
