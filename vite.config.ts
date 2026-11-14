import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    // Saat dev lokal, teruskan /api ke backend production (sama seperti rewrite di vercel.json).
    proxy: {
      "/api": { target: "https://www.intelligo.id", changeOrigin: true, secure: true },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
