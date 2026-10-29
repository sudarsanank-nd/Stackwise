import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { platformFromUA } from '../services/install';
import { InstallBanner, InstallPage } from '../components/install/Install';
import { PrivacyPage } from '../pages/PrivacyPage';
import { WelcomePage } from '../pages/MiscPages';

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1';
const IPAD_DESKTOP_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15';
const ANDROID = 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36';

describe('install platform detection', () => {
  it('recognises iPhone, iPad (desktop UA + touch), Android and desktop', () => {
    expect(platformFromUA(IPHONE)).toBe('ios');
    expect(platformFromUA(IPAD_DESKTOP_UA, 5)).toBe('ios');
    expect(platformFromUA(IPAD_DESKTOP_UA, 0)).toBe('desktop');
    expect(platformFromUA(ANDROID)).toBe('android');
  });
});

describe('install UI', () => {
  beforeEach(() => localStorage.clear());

  it('shows step-by-step instructions for every platform', () => {
    render(
      <MemoryRouter>
        <InstallPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Install Stackwise' })).toBeInTheDocument();
    for (const name of [/iPhone or iPad/, /Android/, /Computer/]) expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    expect(screen.getByText(/Add to Home Screen/)).toBeInTheDocument();
  });

  it('feed banner can be dismissed and stays dismissed', async () => {
    const { unmount } = render(
      <MemoryRouter>
        <InstallBanner />
      </MemoryRouter>,
    );
    expect(screen.getByRole('complementary', { name: 'Install Stackwise' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss install suggestion' }));
    expect(screen.queryByRole('complementary', { name: 'Install Stackwise' })).toBeNull();
    unmount();
    render(
      <MemoryRouter>
        <InstallBanner />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('complementary', { name: 'Install Stackwise' })).toBeNull();
  });
});

describe('welcome install button', () => {
  it('links to the install page when not running as the installed app', () => {
    render(
      <MemoryRouter>
        <WelcomePage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Install the app first' })).toHaveAttribute('href', '/install');
  });

  it('is hidden inside the installed app', () => {
    const original = window.matchMedia;
    window.matchMedia = ((q: string) => ({ matches: q.includes('standalone'), media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
    try {
      render(
        <MemoryRouter>
          <WelcomePage />
        </MemoryRouter>,
      );
      expect(screen.queryByRole('link', { name: 'Install the app first' })).toBeNull();
    } finally {
      window.matchMedia = original;
    }
  });
});

describe('privacy policy', () => {
  it('states local-only storage and when data leaves the app', () => {
    render(
      <MemoryRouter>
        <PrivacyPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Privacy policy' })).toBeInTheDocument();
    expect(screen.getByText(/No accounts, no server, no analytics/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'When something leaves the app' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Settings → Reset and remove/ })).toHaveAttribute('href', '/settings');
  });
});
