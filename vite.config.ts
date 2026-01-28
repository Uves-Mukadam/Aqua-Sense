
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// Added import for node:process to ensure types for process.cwd() are correctly recognized in the build context
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Load env file from the current directory
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // This ensures 'process.env.API_KEY' is replaced with the actual value at build/dev time
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
    },
    server: {
      port: 5173,
      proxy: {
        // Redirects frontend /api calls to the Flask backend on port 5000
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
});
