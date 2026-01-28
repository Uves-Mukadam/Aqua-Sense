
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file from directory based on `mode`. Cast process to any to fix missing 'cwd' type in certain build environments.
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // This ensures process.env.API_KEY is available in the browser code
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    server: {
      port: 5173,
      host: true
    }
  };
});
