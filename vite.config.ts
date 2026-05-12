import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// PWA removed — service worker was locking users into old cached versions.
// The app works perfectly without it. Add back later with proper cache-busting.

export default defineConfig({
  plugins: [react()],
  base: '/success-os/',
})
