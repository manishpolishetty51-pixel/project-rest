import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, forward /api requests to the FastAPI server (built in a later step)
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});
