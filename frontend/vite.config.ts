import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: "localhost", // Ou "127.0.0.1"
    port: 5173,
    open: true, // Abre o navegador automaticamente
    // Acesse via rede local (se quiser testar em outro dispositivo na rede)
    // host: true,

    // Proxy para evitar CORS, ajuste para sua API real
    proxy: {
      "/api": {
        target: "https://integracao.redeveiculos.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
