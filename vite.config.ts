import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

const tunnelAllowedHosts = ["app-procedures.dev-integra.com", ".dev-integra.com"];

/**
 * Vite configuration for Formulario Integra.
 */
export default defineConfig({
  plugins: [tanstackStart(), react(), tsconfigPaths(), tailwindcss()],
  server: {
    port: 3000,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: tunnelAllowedHosts,
  },
  preview: {
    port: 3000,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: tunnelAllowedHosts,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
