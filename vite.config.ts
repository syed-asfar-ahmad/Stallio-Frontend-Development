import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  build: {
    chunkSizeWarningLimit: 520,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('recharts')) return 'recharts';
          if (id.includes('emoji-picker-react')) return 'emoji-picker';
          if (id.includes('world-countries')) return 'world-countries';
          if (id.includes('lucide-react')) return 'lucide';
          if (id.includes('i18next')) return 'i18n';
          if (id.includes('date-fns') || id.includes('react-day-picker')) return 'dates';
          if (id.includes('react-select')) return 'react-select';
        },
      },
    },
  },
  server: {
    port: 4000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
