/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `vite build --mode artifact` produces one self-contained HTML file (dist-artifact/)
// so the prototype can be opened without a dev server.
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), tailwindcss(), ...(mode === 'artifact' ? [viteSingleFile()] : [])],
  // Content JSON is bundled, so the main chunk is ~650 kB (≈200 kB gzipped).
  build: mode === 'artifact' ? { outDir: 'dist-artifact', chunkSizeWarningLimit: 900 } : { chunkSizeWarningLimit: 900 },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/tests/**/*.test.{ts,tsx}'],
  },
}))
