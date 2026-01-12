import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  define: {
    'process.env': '{}',
    'process.version': JSON.stringify('v18.0.0'),
    'global': 'globalThis',
  },
  plugins: [
    react(),
    nodePolyfills({
      protocolImports: true,
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "fs": path.resolve(__dirname, "src/mocks/fs.ts"),
      "buffer": "buffer",
      "process": "process/browser",
      "stream": "stream-browserify",
      "util": "util",
    },
  },
  optimizeDeps: {
    force: true, // Force rebuild all deps to clear old cache
    include: ['buffer', 'process', '@switchboard-xyz/on-demand', '@switchboard-xyz/common'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    target: 'esnext',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
