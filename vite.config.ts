import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { rmSync } from 'node:fs';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
  },
  // 環境変数をクライアントに公開
  define: {
    'process.env': process.env
  }
});

