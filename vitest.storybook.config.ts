import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

/**
 * Runs every story as a test in Chromium: it must render, its play function (interactions) must
 * pass, and axe must find no accessibility violation.
 */
export default defineConfig({
    plugins: [storybookTest({ configDir: '.storybook' })],
    test: {
        name: 'storybook',
        browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
        },
    },
});
