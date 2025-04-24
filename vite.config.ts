import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '127.0.0.1', // força IPv4 e evita o erro com ::1
    port: 5174,        // opcional, pode ser 5173 também se quiser testar
  },
});
