import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// base './' makes the build work on any GitHub Pages sub-path (HashRouter is used for routing)
export default defineConfig({
  plugins: [
    react(),
    // service worker precaches the whole app so it works offline after the first visit
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'IEDA3010 Prescriptive Analytics',
        short_name: 'IEDA3010',
        description: 'Interaktiv læringsplattform for IEDA3010 – midtveiseksamen.',
        lang: 'nb',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#334155',
        theme_color: '#334155',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2,ttf}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 }, cacheableResponse: { statuses: [0, 200] } },
          },
        ],
      },
    }),
  ],
  base: './',
  build: { chunkSizeWarningLimit: 1200 },
});
