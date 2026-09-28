import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 800 },
  // Pre-bundling three breaks DRACOLoader's import.meta.url decoder paths in dev.
  optimizeDeps: { exclude: ['three'] },
});
