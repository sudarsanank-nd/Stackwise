import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { promptInstall } from '../../services/install';
import { useInstallPlatform } from '../../hooks/useInstall';
import { useToast } from '../../store/toast';
import { LogoMark } from '../brand/Logo';

const DISMISS_KEY = 'stackwise:install-dismissed';

function readDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

/** The one-tap install button where the browser supports it; otherwise a link to the instructions. */
export function InstallButton({ className = '' }: { className?: string }) {
  const platform = useInstallPlatform();
  const toast = useToast((s) => s.show);
  const base = `inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-navy px-5 text-[15px] font-bold text-white hover:opacity-90 dark:bg-brand dark:text-brand-ink ${className}`;
  if (platform === 'installed' || platform === 'unsupported') return null;
  if (platform === 'prompt') {
    return (
      <button
        type="button"
        className={base}
        onClick={async () => {
          const ok = await promptInstall();
          toast(ok ? 'Stackwise is on your home screen' : 'No problem — you can install it later from Profile');
        }}
      >
        <DownloadIcon /> Install Stackwise
      </button>
    );
  }
  return (
    <Link to="/install" className={base}>
      <DownloadIcon /> How to install
    </Link>
  );
}

/** Small, dismissible nudge on the feed. Hidden once installed or dismissed. */
export function InstallBanner() {
  const platform = useInstallPlatform();
  const [dismissed, setDismissed] = useState(readDismissed);
  if (dismissed || platform === 'installed' || platform === 'unsupported') return null;
  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // Private mode: the banner simply comes back next visit.
    }
    setDismissed(true);
  };
  return (
    <aside aria-label="Install Stackwise" className="mb-4 flex items-center gap-3 rounded-3xl bg-navy p-3 pl-4 text-white dark:bg-surface-2">
      <LogoMark size={36} />
      <p className="min-w-0 flex-1 text-[14px] leading-snug">
        <strong className="block font-bold">Add Stackwise to your home screen</strong>
        <span className="text-[#c7ccda]">Opens full-screen and works offline.</span>
      </p>
      {platform === 'prompt' ? (
        <button type="button" onClick={() => promptInstall().then((ok) => ok && dismiss())} className="min-h-11 rounded-2xl bg-marigold px-3.5 text-[14px] font-extrabold text-[#14213d]">
          Install
        </button>
      ) : (
        <Link to="/install" className="flex min-h-11 items-center rounded-2xl bg-marigold px-3.5 text-[14px] font-extrabold text-[#14213d]">
          How
        </Link>
      )}
      <button type="button" onClick={dismiss} aria-label="Dismiss install suggestion" className="flex h-11 w-9 items-center justify-center rounded-xl text-[#c7ccda] hover:text-white">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </aside>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </svg>
  );
}

function Steps({ title, active, children }: { title: string; active: boolean; children: ReactNode }) {
  return (
    <section className={`rounded-3xl border bg-surface p-5 ${active ? 'border-brand shadow-[var(--shadow)]' : 'border-line'}`}>
      <h2 className="flex items-center gap-2 font-display text-[19px] font-extrabold tracking-[-0.02em]">
        {title}
        {active && <span className="rounded-full bg-brand px-2 py-0.5 font-sans text-[11px] font-bold text-brand-ink">This device</span>}
      </h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[15px] leading-relaxed">{children}</ol>
    </section>
  );
}

export function InstallPage() {
  const platform = useInstallPlatform();
  return (
    <div>
      <div className="flex flex-col items-center rounded-[28px] bg-navy px-6 py-8 text-center text-white">
        <LogoMark size={72} />
        <h1 className="mt-3 font-display text-[28px] font-extrabold tracking-[-0.03em]">Install Stackwise</h1>
        <p className="mt-2 max-w-sm text-[15px] text-[#c7ccda]">
          Put it on your home screen like any other app. It opens full-screen, works offline, and your data stays on this device.
        </p>
        {platform === 'installed' ? (
          <p className="mt-5 rounded-2xl bg-white/10 px-4 py-2.5 text-[15px] font-semibold">You’re using the installed app. Nothing more to do.</p>
        ) : (
          platform === 'prompt' && <InstallButton className="mt-5 !bg-marigold !text-[#14213d]" />
        )}
      </div>

      {platform !== 'installed' && (
        <div className="mt-6 space-y-4">
          <Steps title="iPhone or iPad" active={platform === 'ios'}>
            <li>Open this page in <strong>Safari</strong> (other iPhone browsers may not offer the option).</li>
            <li>
              Tap the <strong>Share</strong> button — the square with an arrow pointing up.
            </li>
            <li>
              Scroll and tap <strong>Add to Home Screen</strong>, then <strong>Add</strong>.
            </li>
          </Steps>
          <Steps title="Android" active={platform === 'android' || platform === 'prompt'}>
            <li>Open this page in <strong>Chrome</strong>.</li>
            <li>
              Tap the <strong>⋮</strong> menu, then <strong>Install app</strong> (or <strong>Add to Home screen</strong>).
            </li>
            <li>Confirm. Stackwise appears with your other apps.</li>
          </Steps>
          <Steps title="Computer" active={platform === 'desktop'}>
            <li>In Chrome or Edge, click the install icon at the right of the address bar.</li>
            <li>Or open the browser menu and choose <strong>Install Stackwise</strong>.</li>
          </Steps>
          <p className="text-[13px] leading-relaxed text-ink-2">
            Installing doesn’t create an account or send anything anywhere. Uninstall it like any app; to also delete your data, first use Settings → Reset and remove → Start over. See the{' '}
            <Link to="/privacy" className="underline">
              privacy policy
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
