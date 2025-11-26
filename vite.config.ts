import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'MERLIN',
        short_name: 'MERLIN',
        start_url: '/',
        display: 'standalone',
        background_color: '#1a102b',
        theme_color: '#1a102b',
        icons: [
          {
            src: '/icons/logomerlin.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/logomerlin.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }), ,
  ],
})