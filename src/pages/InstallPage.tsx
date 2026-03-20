import { useState, useEffect } from 'react';
import { Download, Share, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gigguardLogo from '@/assets/gigguard-logo.png';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
    if (window.matchMedia('(display-mode: standalone)').matches) setIsInstalled(true);
    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e as BeforeInstallPromptEvent); };
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
        <img src={gigguardLogo} alt="GigGuard" className="h-20 w-20 mx-auto" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Install GigGuard</h1>
          <p className="text-muted-foreground mt-2">Get instant access from your home screen.</p>
        </div>

        {isInstalled ? (
          <div className="p-4 rounded-xl bg-safe/10 border border-safe/20">
            <p className="text-safe font-semibold">✅ App is already installed!</p>
          </div>
        ) : isIOS ? (
          <div className="p-4 rounded-xl bg-muted text-left space-y-3">
            <p className="font-medium text-foreground text-sm">To install on iPhone:</p>
            <div className="flex items-center gap-3">
              <Share className="h-4 w-4 text-primary shrink-0" />
              <p className="text-sm text-muted-foreground">1. Tap <strong>Share</strong> in Safari</p>
            </div>
            <div className="flex items-center gap-3">
              <Download className="h-4 w-4 text-primary shrink-0" />
              <p className="text-sm text-muted-foreground">2. Tap <strong>"Add to Home Screen"</strong></p>
            </div>
            <div className="flex items-center gap-3">
              <Smartphone className="h-4 w-4 text-primary shrink-0" />
              <p className="text-sm text-muted-foreground">3. Tap <strong>"Add"</strong></p>
            </div>
          </div>
        ) : deferredPrompt ? (
          <Button onClick={handleInstall} className="w-full h-12 text-base gap-2">
            <Download className="h-5 w-5" /> Install App
          </Button>
        ) : (
          <div className="p-4 rounded-xl bg-muted">
            <p className="text-sm text-muted-foreground">Open in Chrome or Edge to install.</p>
          </div>
        )}
      </div>
    </div>
  );
}
