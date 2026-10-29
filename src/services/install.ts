// Install-to-home-screen support. Chrome/Edge/Android fire `beforeinstallprompt` once, early,
// so we capture it at startup (see main.tsx) and let any component ask for it later.
// iOS Safari has no prompt: there the UI shows Share → Add to Home Screen instructions.

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type InstallPlatform = 'installed' | 'prompt' | 'ios' | 'android' | 'desktop' | 'unsupported';

let deferred: InstallPromptEvent | null = null;
let installedNow = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function initInstallCapture(): void {
  if (typeof window === 'undefined') return;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    installedNow = true;
    notify();
  });
}

export function subscribeInstall(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return !!window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

/** Pure platform detection from a user-agent string (exported for tests). */
export function platformFromUA(ua: string, maxTouchPoints = 0): 'ios' | 'android' | 'desktop' {
  // iPadOS 13+ reports a Mac user agent; touch points give it away.
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && maxTouchPoints > 1)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}

export function installPlatform(): InstallPlatform {
  if (import.meta.env.MODE === 'artifact') return 'unsupported';
  if (installedNow || isStandalone()) return 'installed';
  if (deferred) return 'prompt';
  return platformFromUA(navigator.userAgent, navigator.maxTouchPoints);
}

/** Shows the browser's own install dialog. Resolves true if the reader accepted. */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  const e = deferred;
  deferred = null;
  await e.prompt();
  const { outcome } = await e.userChoice;
  notify();
  return outcome === 'accepted';
}
