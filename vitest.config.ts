import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        projects: [
            'packages/*',
            // Tests of the shared build config.
            { test: { name: 'config', include: ['config/**/*.test.ts'], environment: 'node' } },
        ],
    },
});
