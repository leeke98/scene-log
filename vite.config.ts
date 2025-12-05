import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // 백엔드 API 프록시 (개발 환경)
      "/api": {
        target: "https://scene-log-backend.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
