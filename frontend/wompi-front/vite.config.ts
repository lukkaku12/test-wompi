import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  server: {
    proxy: {
      // Proxy Wompi calls so we don't hit CORS in dev.
      '/wompi': {
        target: 'https://api-sandbox.co.uat.wompi.dev',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/wompi/, ''),
      },
    },
  },
})
