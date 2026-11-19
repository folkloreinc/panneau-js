import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

/**
 * Runs every story as a test in Chromium: it must render, its play function (interactions) must
 * pass, and axe must find no accessibility violation.
 *
 * Two projects run every story:
 *
 * - `storybook`, with the globals of `.storybook/preview.tsx` (light scheme, `auto` density);
 * - `storybook-dark-touch`, in the dark scheme and the `touch` density, so that contrast is checked
 *   in the dark scheme and target sizes and layouts in the largest density (decision 0020).
 *
 * A story that sets its own globals keeps them in both. CI runs each project in its own job
 * (`--project`); `npm run test:storybook` runs both.
 */
export default defineConfig({
    test: {
        browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
        },
        projects: [
            {
                extends: true,
                plugins: [storybookTest({ configDir: '.storybook' })],
                test: { name: 'storybook' },
            },
            {
                extends: true,
                plugins: [
                    storybookTest({
                        configDir: '.storybook',
                        initialGlobals: { colorScheme: 'dark', density: 'touch' },
                    }),
                ],
                test: { name: 'storybook-dark-touch' },
            },
        ],
    },
});
