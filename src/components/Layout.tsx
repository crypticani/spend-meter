import { Outlet } from 'react-router-dom';
import BottomNav from './ui/BottomNav';
import InstallPrompt from './ui/InstallPrompt';

export default function Layout() {
    return (
        <div className="flex flex-col min-h-[100dvh]">
            <main className="flex-1 pb-20 max-w-lg mx-auto w-full">
                <InstallPrompt />
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
}
