import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/health": { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/user": { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/decision": { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/chat": { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/simulation": { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/timeline": { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/checklist": { target: "http://127.0.0.1:8000", changeOrigin: true },
    },
  },
});
