// https://astro.build/config
import { defineConfig } from 'astro/config';

const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://example.com/';
const BASE_PATH = process.env.PUBLIC_BASE_PATH || '/';

export default defineConfig({
  envPrefix: 'PUBLIC_',
  devToolbar: {
    enabled: false,
  },
  site: SITE_URL,
  base: BASE_PATH,
  css: {
    preprocessorOptions: {
      sass: {
        api: 'modern',
      },
    },
  },
});
