import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return undefined;
            }

            if (
              id.includes('/d3-') ||
              id.includes('\\d3-') ||
              id.includes('node_modules/d3') ||
              id.includes('internmap')
            ) {
              return 'viz-core';
            }

            if (
              id.includes('react-markdown') ||
              id.includes('remark-gfm') ||
              id.includes('remark-math') ||
              id.includes('rehype-katex') ||
              id.includes('katex')
            ) {
              return 'ai-markdown';
            }

            if (
              id.includes('react-simple-maps') ||
              id.includes('topojson-client')
            ) {
              return 'maps';
            }

            return undefined;
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify; file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
