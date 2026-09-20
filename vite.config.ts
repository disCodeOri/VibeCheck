import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://127.0.0.1:8787' } },
  build: { chunkSizeWarningLimit: 1200 },
  // e2e/ holds Playwright specs; vitest must not collect them or `npm test` fails.
  test: { exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'] },
});
