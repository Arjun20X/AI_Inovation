// vite.config.js (Example for Vite)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy requests starting with /api to your Express server
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
