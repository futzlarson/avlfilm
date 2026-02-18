import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://avlfilm.com',
  output: 'server',
  adapter: vercel(),
  integrations: [
    sitemap({
      filter: (page) => {
        // Exclude admin pages, API routes and account pages
        if (page.includes('/admin')) return false;
        if (page.includes('/api/')) return false;
        if (page.includes('/account/')) return false;
        return true;
      },
      serialize(item) {
        // Homepage - highest priority
        if (item.url === 'https://avlfilm.com/') {
          item.priority = 1.0;
          item.changefreq = 'daily';
        }
        // Directory - high priority, updates frequently
        else if (item.url.includes('/directory')) {
          item.priority = 0.9;
          item.changefreq = 'daily';
        }
        // Calendar - time-sensitive content
        else if (item.url.includes('/calendar')) {
          item.priority = 0.8;
          item.changefreq = 'weekly';
        }
        // Production, festivals, resources
        else if (item.url.match(/\/(production|festivals|resources)/)) {
          item.priority = 0.8;
          item.changefreq = 'weekly';
        }
        // Submit form - mostly static
        else if (item.url.includes('/submit')) {
          item.priority = 0.7;
          item.changefreq = 'monthly';
        }
        return item;
      }
    })
  ]
});