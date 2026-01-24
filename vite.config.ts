
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  
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
        },
        external: [
          'react',
          'react-dom',
          'react-dom/client',
          'react-router-dom',
          'react-helmet-async',
          '@google/genai',
          '@supabase/supabase-js',
          'lucide-react'
        ]
      },
    },
    plugins: [react()],
  };
});
