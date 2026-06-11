import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://eisyiah.github.io',
  base: '/mygo-kg',
  output: 'static',
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
  integrations: [
    mdx(),
    sitemap(),
  ],
  vite: {
    ssr: {
      noExternal: ['cytoscape'],
    },
  },
});