// Fades out the load screen from index.html once the app has rendered.
// Kept on screen for a short minimum so the logo animation can finish instead of flashing.
const MIN_MS = 1100;

export function hideSplash(): void {
  const el = document.getElementById('splash');
  if (!el) return;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const wait = reduced ? 0 : Math.max(0, MIN_MS - performance.now());
  window.setTimeout(() => {
    el.classList.add('sw-hide');
    window.setTimeout(() => el.remove(), 400);
  }, wait);
}
