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
      "/api/kopis": {
        target: "http://www.kopis.or.kr",
        changeOrigin: true,
        rewrite: (path) => {
          // 상세 정보 API는 경로에 mt20id가 포함된 경우 처리
          // /api/kopis/pblprfr/PF250136 -> /openApi/restful/pblprfr/PF250136
          return path.replace(/^\/api\/kopis/, "/openApi/restful");
        },
      },
    },
  },
});
