import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Explicitly using the credentials from the user's prompt as defaults
  const apiKey = process.env.API_KEY || env.API_KEY || '';
  const supabaseUrl = process.env.SUPABASE_URL || 'https://vuccpnjmorofpdfaxpfb.supabase.co';
  const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_nUlKzWTXo3smAdCaah94tA_PPDiiUMB';

  return {
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.SUPABASE_URL': JSON.stringify(supabaseUrl),
      'process.env.SUPABASE_KEY': JSON.stringify(supabaseKey),
    },
    base: '/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          app: resolve(__dirname, 'app.html'),
          about: resolve(__dirname, 'about.html'),
          blog: resolve(__dirname, 'blog.html'),
        },
      },
    },
    plugins: [react()],
  };
});