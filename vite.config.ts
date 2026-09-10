import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiBase = process.env.API_BASE_URL ?? "http://localhost:8080";

// Vite development server configuration.
// The browser page runs on :5173; the Orbit-FMS backend is reached only
// through the Spring Cloud Gateway at :8080. To avoid CORS trouble during
// development, /api/** is proxied to the gateway so the SPA is same-origin
// in the browser at dev time. See docs/adr/0007-vite-dev-proxy-and-base-url-config.md.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: apiBase,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          mui: ["@mui/material", "@mui/icons-material", "@emotion/react", "@emotion/styled"],
        },
      },
    },
  },
});