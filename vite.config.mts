import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { nxReadySignal } from '@nx/vite/plugins/nx-ready-signal.plugin';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: './node_modules/.vite/home-anthill',
  server: {
    port: 4200,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://localhost:8082',
        secure: false,
      },
    },
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [
    react(),
    viteStaticCopy({ targets: [{ src: 'README.md', dest: '.' }] }),
    nxReadySignal(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    outDir: 'dist/home-anthill',
    emptyOutDir: true,
    reportCompressedSize: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost',
      },
    },
    env: {
      VITE_API_BASE_URL: 'http://localhost',
    },
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/test-setup.ts',
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/**/*.d.ts',
      ],
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg'],
});
