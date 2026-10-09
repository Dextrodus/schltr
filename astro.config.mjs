// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://schltr.com',
  trailingSlash: 'always',
  integrations: [react()],
});
