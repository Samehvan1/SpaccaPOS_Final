import { useState, useEffect } from 'react';

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detect if already running as installed PWA app
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstalled(true);
      setIsInstallable(false);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
      setIsInstalling(false);
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setIsInstalling(false);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const installApp = async () => {
    if (!installPrompt) return;
    setIsInstalling(true);
    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      if (choiceResult && choiceResult.outcome === 'accepted') {
        setIsInstallable(false);
        setInstallPrompt(null);
      } else {
        setIsInstalling(false);
      }
    } catch (err) {
      console.error("PWA install error:", err);
      setIsInstalling(false);
    }
  };

  return { isInstallable, isInstalling, isInstalled, installApp };
}
