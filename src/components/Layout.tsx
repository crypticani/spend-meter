import { Outlet } from 'react-router-dom';
import BottomNav from './ui/BottomNav';

export default function Layout() {
    return (
        <div className="flex flex-col min-h-[100dvh]">
            <main className="flex-1 pb-20 max-w-lg mx-auto w-full">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
}
