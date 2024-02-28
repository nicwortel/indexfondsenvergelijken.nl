import sitemap from '@astrojs/sitemap';
import svelte from '@astrojs/svelte';
import AstroPWA from '@vite-pwa/astro';
import purgecss from 'astro-purgecss';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.indexfondsenvergelijken.nl',
  integrations: [
    sitemap(),
    svelte(),
    AstroPWA({
      includeAssets: ['favicon.svg', 'images/*'],
      registerType: 'autoUpdate',
      manifestFilename: 'manifest.json',
      manifest: {
        description: `Vergelijk de kosten en verwachte resultaten van beleggen in populaire indexfondsen en ETF's bij banken en brokers in Nederland.`,
        lang: 'nl',
        theme_color: '#212529',
        background_color: '#f8f9fa',
      },
      workbox: {
        cleanupOutdatedCaches: true,
      },
      pwaAssets: {
        config: true,
        overrideManifestIcons: true,
      },
      devOptions: {
        type: 'module',
      },
    }),
    // Remove unused CSS (mainly from Bootstrap)
    purgecss({
      content: [process.cwd() + 'src/**/*.{astro,svelte,ts}'],
    }),
  ],
});
