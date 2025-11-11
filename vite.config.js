import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        search: resolve(__dirname, 'search.html'),
        applications: resolve(__dirname, 'applications.html'),
        'ai-guide': resolve(__dirname, 'ai-guide.html'),
      },
    },
  },
  server: {
    open: true,
    port: 5173,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
