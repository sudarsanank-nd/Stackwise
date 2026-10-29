import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/common/ui';

// Plain-language privacy policy. Keep it in step with what the code actually does:
// if a feature starts storing or sending something new, update this page in the same change.

export const PRIVACY_UPDATED = '29 October 2026';

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="font-display text-[19px] font-extrabold tracking-[-0.02em]">{title}</h2>
      <div className="mt-2 space-y-3 text-[16px] leading-relaxed">{children}</div>
    </section>
  );
}

export function PrivacyPage() {
  return (
    <article>
      <PageHeader title="Privacy policy" subtitle={`Last updated ${PRIVACY_UPDATED}`} />

      <div className="rounded-3xl bg-navy p-5 text-white dark:bg-surface-2">
        <p className="font-display text-[19px] font-extrabold">The short version</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-[#e4e7ef]">
          <li>No accounts, no server, no analytics, no ads, no tracking.</li>
          <li>Everything you do in Stackwise is stored only in this browser on this device.</li>
          <li>Nothing leaves the app unless you tap a link that opens another website.</li>
        </ul>
      </div>

      <Block title="Who we are">
        <p>
          Stackwise is a free, educational micro-learning app published as an open-source project on GitHub. In this policy, “we” means the Stackwise project and “you” means anyone using the app.
        </p>
      </Block>

      <Block title="What is stored, and where">
        <p>Stackwise has no backend. To personalise your feed and keep your progress, it saves the following in your browser’s local storage on your device:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Your profile: the name you choose to give (optional), interests, goals, daily target and settings.</li>
          <li>Your activity: which cards you read, liked, skipped, saved or explored, and your reading sessions.</li>
          <li>What you write: reflections, Explain It Back answers and Decision Gym choices.</li>
          <li>Your collections and recent searches.</li>
        </ul>
        <p>
          The app also keeps a copy of its own files on your device (a “service worker” cache) so it works offline. That cache contains the app and its content, not your data.
        </p>
        <p>We never receive any of this. We cannot see it, back it up or recover it, and it is not shared with anyone.</p>
      </Block>

      <Block title="What we don’t do">
        <ul className="list-disc space-y-1 pl-5">
          <li>No analytics, advertising or tracking scripts, and no cookies.</li>
          <li>No third-party fonts or content loaded when you open the app: everything is served with the app itself.</li>
          <li>No inferring of sensitive personal information. Personalisation uses only the topics you pick and how you interact with cards.</li>
          <li>No selling or sharing of data — there is none on our side to sell or share.</li>
        </ul>
      </Block>

      <Block title="When something leaves the app">
        <p>Only when you choose to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Research with Claude</strong> opens claude.ai in a new tab with a prompt about the card you’re reading. The prompt contains the card’s text and source, not your profile or activity. It is also copied to your clipboard. What happens there is covered by Anthropic’s privacy policy.
          </li>
          <li>
            <strong>Further reading and source links</strong> open other websites (for example Google Scholar, YouTube, Wikipedia or a publisher). Those sites have their own privacy policies.
          </li>
          <li>
            <strong>Share</strong> uses your device’s share sheet or clipboard, and sends only the card you chose to whoever you choose.
          </li>
        </ul>
      </Block>

      <Block title="Hosting">
        <p>
          The app is hosted on GitHub Pages. Like any web host, GitHub may process technical information such as your IP address when your browser downloads the app; this is covered by GitHub’s privacy statement. Once installed and cached, the app can run without contacting the host.
        </p>
      </Block>

      <Block title="Your control">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Review your activity in <Link to="/history" className="underline">Learning history</Link> and remove individual items.
          </li>
          <li>
            Reset recommendations, remove history, or delete everything in <Link to="/settings" className="underline">Settings → Reset and remove</Link>.
          </li>
          <li>Clearing this site’s data in your browser, or uninstalling the app, also removes it.</li>
        </ul>
      </Block>

      <Block title="Children">
        <p>Stackwise is a general-audience learning app and is not directed at children under 13.</p>
      </Block>

      <Block title="Changes and contact">
        <p>
          If this policy changes, the date at the top will change with it. Questions or concerns: open an issue on the{' '}
          <a href="https://github.com/sudarsanank-nd/Stackwise/issues" target="_blank" rel="noreferrer" className="underline">
            Stackwise GitHub page
          </a>
          .
        </p>
      </Block>
    </article>
  );
}
