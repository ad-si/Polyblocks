import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const SERVER_PORT = Number(process.env.PORT || 9014);

export default defineConfig({
  root: path.resolve(projectRoot, 'src'),
  publicDir: path.resolve(projectRoot, 'public'),
  build: {
    outDir: path.resolve(projectRoot, 'dist/public'),
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/socket.io': {
        target: `http://localhost:${SERVER_PORT}`,
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
