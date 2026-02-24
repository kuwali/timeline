import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json'

export default defineConfig({
    base: '/timeline/',
    define: {
        __APP_VERSION__: JSON.stringify(pkg.version),
    },
    plugins: [
        react(),
        VitePWA({
            registerType: 'prompt',
            includeAssets: ['icon.svg', 'apple-touch-icon.png'],
            manifest: {
                name: 'Personal Timeline Tracker',
                short_name: 'Timeline',
                description: 'Understand your life through time anchors',
                theme_color: '#0f172a',
                background_color: '#0f172a',
                display: 'standalone',
                start_url: '/timeline/',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable',
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                cleanupOutdatedCaches: true,
                skipWaiting: false,
                clientsClaim: true,
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                        },
                    },
                ],
            },
        }),
    ],
})
