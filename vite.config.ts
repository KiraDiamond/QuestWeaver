import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Vite requires a repository base path for project GitHub Pages sites.
// Source: https://vite.dev/guide/static-deploy.html#github-pages
export default defineConfig({
  base: '/QuestWeaver/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
});
