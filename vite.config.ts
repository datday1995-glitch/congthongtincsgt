import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const port = Number(process.env.PORT) || 3000;
  const hmrDisabled = process.env.DISABLE_HMR === 'true';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port,
      strictPort: true,
      allowedHosts: true as const,
      // HMR is controlled via DISABLE_HMR env var to prevent flickering during automated edits.
      hmr: !hmrDisabled,
      watch: hmrDisabled ? null : {},
    },
  };
});
