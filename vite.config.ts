import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    define: {
      'process.env': env,
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api/scrape': {
          target: 'https://api.scrapecreators.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/scrape/, ''),
          secure: false,
        },
      },
    },
    plugins: [react()],
  };
});