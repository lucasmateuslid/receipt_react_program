import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path"; // ✅ Usa a forma moderna compatível com ESM

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // ✅ Usa path nativo corretamente
    },
  },
});
