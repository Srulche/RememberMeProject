// client/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()], // חשוב! מפעיל JSX runtime אוטומטי
  server: {
    port: 5173,
    proxy: {
      "/auth": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
