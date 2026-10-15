import babel from '@rolldown/plugin-babel';
import type { StorybookConfig } from '@storybook/react-vite';
import { reactCompilerPreset } from '@vitejs/plugin-react';
import { defaultClientConditions } from 'vite';

import { SOURCE_CONDITION } from '../config/vite.package.ts';

/**
 * Storybook for the v5 packages: the stories next to each component, built from the sources (the
 * `@panneau/source` condition) with the React Compiler, like the packages.
 */
const config: StorybookConfig = {
    framework: '@storybook/react-vite',
    stories: ['../packages/*/src/**/*.stories.@(ts|tsx)'],
    addons: ['@storybook/addon-a11y', '@storybook/addon-vitest'],
    core: { disableTelemetry: true },
    async viteFinal(viteConfig) {
        const { mergeConfig } = await import('vite');
        return mergeConfig(viteConfig, {
            plugins: [babel({ presets: [reactCompilerPreset()] })],
            resolve: { conditions: [SOURCE_CONDITION, ...defaultClientConditions] },
            // Optimized up front: discovering them during a test run reloads the page, and the
            // tests then fail with two copies of React.
            optimizeDeps: {
                include: [
                    'react',
                    'react-dom',
                    'react-dom/client',
                    'react/jsx-runtime',
                    'react/jsx-dev-runtime',
                    'react/compiler-runtime',
                    'react-aria-components',
                    'react-intl',
                    'lucide-react',
                    '@internationalized/date',
                ],
            },
        });
    },
};

export default config;
