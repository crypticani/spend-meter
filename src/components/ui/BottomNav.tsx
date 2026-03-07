import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, PlusCircle, BarChart3, Wallet } from 'lucide-react';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
    { to: '/add', icon: PlusCircle, label: 'Add', isCenter: true },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/accounts', icon: Wallet, label: 'Accounts' },
];

export default function BottomNav() {
    return (
        <nav
            id="bottom-nav"
            className="fixed bottom-0 left-0 right-0 z-50 glass"
            style={{
                paddingBottom: 'env(safe-area-inset-bottom)',
                borderTop: '1px solid var(--color-border)',
            }}
        >
            <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
                {navItems.map(({ to, icon: Icon, label, isCenter }) => (
                    <NavLink
                        key={to}
                        to={to}
                        id={`nav-${label.toLowerCase()}`}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200
              ${isCenter ? '' : ''}
              ${isActive
                                ? 'text-[var(--color-accent-light)]'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                            }`
                        }
                    >
                        {isCenter ? (
                            <div
                                className="flex items-center justify-center w-12 h-12 rounded-full -mt-5 shadow-lg transition-transform duration-200 hover:scale-110"
                                style={{
                                    background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))',
                                    boxShadow: '0 4px 15px rgba(108, 92, 231, 0.4)',
                                }}
                            >
                                <Icon size={24} className="text-white" />
                            </div>
                        ) : (
                            <>
                                <Icon size={20} />
                                <span className="text-[10px] font-medium">{label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
