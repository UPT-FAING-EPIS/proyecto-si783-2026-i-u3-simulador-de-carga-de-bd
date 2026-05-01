import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Actions sets GITHUB_ACTIONS=true; use repo-relative base for Pages.
  // Electron needs './' for file:// protocol — fallback for local dev/desktop.
  base: process.env.GITHUB_ACTIONS ? '/simulador-bds/' : './',
  optimizeDeps: {
    include: ['alasql'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
