import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';

const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'amigo-secreto';

export default defineConfig({
  base: `/${repo}/`,
  server: {
    port: 5183,
    strictPort: true,
    allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev', '.ngrok.app', '.ngrok.dev'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png}'] },
      manifest: {
        name: 'Amigo Secreto',
        short_name: 'Amigo',
        description: 'Secret Santa draws with private links and no server.',
        theme_color: '#10201b',
        background_color: '#10201b',
        display: 'standalone',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
});
