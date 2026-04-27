import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { VitePWA } from 'vite-plugin-pwa';

const rawPort = process.env.PORT || "3000";
const port = Number(rawPort);

const basePath = process.env.BASE_PATH || "/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Spacca POS & Kitchen',
        short_name: 'Spacca',
        description: 'Premium Point of Sale and Kitchen Management System for Spacca',
        theme_color: '#080808',
        background_color: '#080808',
        display: 'standalone',
        orientation: 'landscape',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/Asset 8@2x-8.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/Asset 8@2x-8.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          }
        ],
        shortcuts: [
          {
            name: 'Cashier Terminal',
            short_name: 'Cashier',
            description: 'Open the Cashier Approval Dashboard',
            url: '/cashier',
            icons: [{ src: '/icon-512.png', sizes: '192x192' }]
          },
          {
            name: 'Pickup Dashboard',
            short_name: 'Pickup',
            description: 'Open the Order Pickup Dashboard',
            url: '/pickup',
            icons: [{ src: '/icon-512.png', sizes: '192x192' }]
          },
          {
            name: 'POS Terminal',
            short_name: 'POS',
            description: 'Open the Main POS Terminal',
            url: '/pos',
            icons: [{ src: '/icon-512.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
    }),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    // Proxy /api to the API server when running locally (not on Replit)
    ...(process.env.REPL_ID === undefined && {
      proxy: {
        "/api": {
          target: `http://localhost:${process.env.API_PORT ?? 8080}`,
          changeOrigin: true,
        },
        "/uploads": {
          target: `http://localhost:${process.env.API_PORT ?? 8080}`,
          changeOrigin: true,
        },
      },
    }),
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
