import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      // Auth login endpoint
      '/auth/login': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // No rewrite needed as the endpoint is already /auth/login
      },
      // Fallback for any other API routes
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
