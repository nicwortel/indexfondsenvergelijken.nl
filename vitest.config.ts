import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    restoreMocks: true,
    coverage: {
      enabled: true,
      include: ['src/**'],
    },
  },
});
