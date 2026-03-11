export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export function formatDateShort(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
    });
}

export function formatMonthYear(date: Date): string {
    return date.toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
    });
}

export function getMonthRange(year: number, month: number): { start: Date; end: Date } {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return { start, end };
}

export function isCurrentMonth(date: Date): boolean {
    const now = new Date();
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export function toDateInputValue(date: Date): string {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
}

export function getAccountTypeLabel(type: string): string {
    switch (type) {
        case 'bank': return 'Bank Account';
        case 'credit_card': return 'Credit Card';
        case 'cash': return 'Cash';
        default: return type;
    }
}

export function getAccountTypeIcon(type: string): string {
    switch (type) {
        case 'bank': return '🏦';
        case 'credit_card': return '💳';
        case 'cash': return '💵';
        default: return '💰';
    }
}

const accountColors = [
    '#6c5ce7', '#00cec9', '#fd79a8', '#e17055',
    '#00b894', '#0984e3', '#ffc048', '#a29bfe',
    '#ff6b6b', '#55efc4', '#74b9ff', '#fab1a0',
];

export function getRandomAccountColor(): string {
    return accountColors[Math.floor(Math.random() * accountColors.length)];
}

export function getNextDueDate(startDate: Date, frequency: 'monthly' | 'weekly' | 'yearly', completedInstallments: number): Date {
    const date = new Date(startDate);
    if (frequency === 'monthly') date.setMonth(date.getMonth() + completedInstallments);
    else if (frequency === 'yearly') date.setFullYear(date.getFullYear() + completedInstallments);
    else if (frequency === 'weekly') date.setDate(date.getDate() + 7 * completedInstallments);
    return date;
}
