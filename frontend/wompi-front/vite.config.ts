import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const wompiBaseUrl = env.VITE_BASE_URL || 'https://api-sandbox.co.uat.wompi.dev/v1'

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Proxy Wompi calls so we don't hit CORS in dev.
        '/wompi': {
          target: wompiBaseUrl.replace(/\/v1$/, ''),
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/wompi/, ''),
        },
      },
    },
  }
})
