// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  /*
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
          @use "/src/styles/_variables.scss" as var;
          `,
        }
      }
    }
  }
  */
});