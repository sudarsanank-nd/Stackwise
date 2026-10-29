/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Installable PWA for the hosted build: precaches the app shell + content so cards
// read offline, and caches Google Fonts at runtime. Skipped for the single-file build.
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
    background_color: '#fbfaf7',
    theme_color: '#1f5f5b',
    icons: [
      { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
    maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
    runtimeCaching: [
      {
        urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
        handler: 'StaleWhileRevalidate',
        options: { cacheName: 'google-fonts-css' },
      },
      {
        urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-files',
          expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  },
})

// `vite build --mode artifact` produces one self-contained HTML file (dist-artifact/)
// so the prototype can be opened without a dev server.
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), tailwindcss(), ...(mode === 'artifact' ? [viteSingleFile()] : [pwa])],
  define: { __PWA__: JSON.stringify(mode !== 'artifact') },
  // Content JSON is bundled, so the main chunk is ~650 kB (≈200 kB gzipped).
  build: mode === 'artifact' ? { outDir: 'dist-artifact', chunkSizeWarningLimit: 900 } : { chunkSizeWarningLimit: 900 },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/tests/**/*.test.{ts,tsx}'],
  },
}))
