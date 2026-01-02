import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Prioritize process.env (Netlify) then fallback to loaded .env file
  const apiKey = process.env.API_KEY || env.API_KEY;

  return {
    define: {
      // JSON.stringify is necessary to embed the string value into the client code
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
    base: '/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
  };
});