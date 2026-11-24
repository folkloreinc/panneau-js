import { defaultServerConditions } from 'vite';
import { defineConfig } from 'vitest/config';

import { SOURCE_CONDITION } from './config/vite.package.ts';

export default defineConfig({
    test: {
        projects: [
            'packages/*',
            // Tests of the shared build config.
            { test: { name: 'config', include: ['config/**/*.test.ts'], environment: 'node' } },
            // Tests of the playground's definition and data, on the sources of the packages.
            {
                ssr: { resolve: { conditions: [SOURCE_CONDITION, ...defaultServerConditions] } },
                test: {
                    name: 'playground',
                    include: ['playground/**/*.test.ts'],
                    environment: 'node',
                },
            },
        ],
    },
});
