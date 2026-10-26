import { resolve } from 'node:path';
import { defineConfig, loadEnv, searchForWorkspaceRoot } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Browsers we support: every release of the last ~4 years
 * (Chrome/Edge 90+, Firefox 90+, Safari/iOS 15+, Samsung Internet 15+).
 */
const BROWSER_TARGETS = ['es2020', 'chrome90', 'edge90', 'firefox90', 'safari15', 'ios15'];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_DEV_API_TARGET || 'http://127.0.0.1:8000';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      // In development, /api is proxied to the Python backend so the app can use relative URLs.
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
      },
      // Allow the project itself plus ../shared/markets.json (shared with the backend), nothing else.
      fs: { allow: [searchForWorkspaceRoot(process.cwd()), resolve(__dirname, '../shared')] },
    },
    build: {
      target: BROWSER_TARGETS,
      cssTarget: BROWSER_TARGETS,
      // Maps are generated for debugging but not linked from the public bundle.
      sourcemap: 'hidden',
    },
  };
});
