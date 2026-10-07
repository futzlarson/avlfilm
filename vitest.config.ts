// Reuse Astro's Vite config so path aliases and import.meta.env work in tests.
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    env: { JWT_SECRET: 'test-secret-for-vitest' },
  },
});
