import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';

// https://vite.dev/config/
// base — путь подпапки на GitHub Pages: https://erzyukov.github.io/promt_engineering_academy/
export default defineConfig({
  base: '/promt_engineering_academy/',
  plugins: [
    // MDX должен обрабатываться до react-плагина
    { enforce: 'pre', ...mdx({ providerImportSource: '@mdx-js/react' }) },
    react(),
  ],
});
