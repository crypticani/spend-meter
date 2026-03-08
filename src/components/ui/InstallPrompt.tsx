import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

// Define the interface for the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Check if the user has previously dismissed the prompt
        const isDismissed = localStorage.getItem('pwa_prompt_dismissed') === 'true';

        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Update UI notify the user they can install the PWA
            if (!isDismissed) {
                setShowPrompt(true);
            }
        };

        const handleAppInstalled = () => {
            // Hide the prompt if the app was successfully installed
            setShowPrompt(false);
            setDeferredPrompt(null);
            console.log('SpendMeter was installed.');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Save dismissal state to avoid bothering the user again
        localStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed top-4 left-4 right-4 z-50 animate-fade-in shadow-lg rounded-xl overflow-hidden"
            style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
            <div className="p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                    <Download size={20} className="text-[var(--color-primary)]" />
                </div>

                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-[var(--color-text)]">Install SpendMeter</h3>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        Install the app on your device for quick access, offline support, and a better native experience.
                    </p>

                    <div className="flex items-center gap-3 mt-3">
                        <button
                            onClick={handleInstallClick}
                            className="bg-[var(--color-primary)] hover:opacity-90 text-[var(--color-bg)] text-xs font-semibold py-2 px-4 rounded-lg transition-opacity"
                        >
                            Install App
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-medium transition-colors"
                        >
                            Not now
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleDismiss}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1 rounded-md transition-colors shrink-0"
                    aria-label="Close"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
