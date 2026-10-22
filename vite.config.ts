import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' makes the build work on any GitHub Pages sub-path (HashRouter is used for routing)
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { chunkSizeWarningLimit: 1200 },
});
