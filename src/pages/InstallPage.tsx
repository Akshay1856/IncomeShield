import { useState, useEffect } from 'react';
import { Shield, Download, Share, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Shield className="h-10 w-10 text-primary" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Install RideShield</h1>
          <p className="text-muted-foreground mt-2">
            Get instant access from your home screen. Works offline, loads fast.
          </p>
        </div>

        {isInstalled ? (
          <div className="p-4 rounded-xl bg-safe/10 border border-safe/20">
            <p className="text-safe font-semibold">✅ App is already installed!</p>
            <p className="text-sm text-muted-foreground mt-1">Open it from your home screen</p>
          </div>
        ) : isIOS ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted text-left space-y-3">
              <p className="font-medium text-foreground text-sm">To install on iPhone:</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Share className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">1. Tap the <strong>Share</strong> button in Safari</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Download className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">2. Scroll down and tap <strong>"Add to Home Screen"</strong></p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Smartphone className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">3. Tap <strong>"Add"</strong> — done!</p>
              </div>
            </div>
          </div>
        ) : deferredPrompt ? (
          <Button onClick={handleInstall} className="w-full h-12 text-base gap-2">
            <Download className="h-5 w-5" /> Install App
          </Button>
        ) : (
          <div className="p-4 rounded-xl bg-muted">
            <p className="text-sm text-muted-foreground">
              Open this page in Chrome or Edge on your phone to install the app.
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 pt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">12K+</p>
            <p className="text-[10px] text-muted-foreground">Active Riders</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-safe">₹28L+</p>
            <p className="text-[10px] text-muted-foreground">Payouts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">&lt;3s</p>
            <p className="text-[10px] text-muted-foreground">Payout Speed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
