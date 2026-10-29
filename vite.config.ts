/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Installable PWA for the hosted build: precaches the app shell + content so cards
// read offline (fonts are self-hosted, so they are precached too). Skipped for the single-file build.
const pwa = VitePWA({
  registerType: 'autoUpdate',
  injectRegister: false,
  includeAssets: ['icons/*.svg', 'icons/*.png'],
  manifest: {
    name: 'Stackwise',
    short_name: 'Stackwise',
    description: 'A calm, personalised micro-learning feed.',
    start_url: './',
    scope: './',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#14213d',
    theme_color: '#14213d',
    icons: [
      { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
    maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
    // A new version takes over open pages straight away; registerServiceWorker reloads onto it.
    clientsClaim: true,
    skipWaiting: true,
  },
})

// `vite build --mode artifact` produces one self-contained HTML file (dist-artifact/)
// so the prototype can be opened without a dev server.
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), tailwindcss(), ...(mode === 'artifact' ? [viteSingleFile()] : [pwa])],
  define: {
    __PWA__: JSON.stringify(mode !== 'artifact'),
    // Short commit id in CI builds (GitHub Actions sets GITHUB_SHA), shown on the About page.
    __APP_VERSION__: JSON.stringify(process.env.GITHUB_SHA?.slice(0, 7) ?? 'dev'),
  },
  // Content JSON is bundled, so the main chunk is ~650 kB (≈200 kB gzipped).
  build: mode === 'artifact' ? { outDir: 'dist-artifact', chunkSizeWarningLimit: 900 } : { chunkSizeWarningLimit: 900 },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/tests/**/*.test.{ts,tsx}'],
  },
}))
