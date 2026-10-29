import babel from '@rolldown/plugin-babel';
import type { StorybookConfig } from '@storybook/react-vite';
import { reactCompilerPreset } from '@vitejs/plugin-react';
import { defaultClientConditions } from 'vite';

import { SOURCE_CONDITION, cssModules } from '../config/vite.package.ts';

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
            css: { modules: cssModules },
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
                    '@tanstack/react-query',
                    // The editor of @panneau/editor
                    '@tiptap/core',
                    '@tiptap/react',
                    '@tiptap/pm/model',
                    '@tiptap/pm/state',
                    '@tiptap/extension-blockquote',
                    '@tiptap/extension-bold',
                    '@tiptap/extension-code',
                    '@tiptap/extension-document',
                    '@tiptap/extension-hard-break',
                    '@tiptap/extension-heading',
                    '@tiptap/extension-horizontal-rule',
                    '@tiptap/extension-italic',
                    '@tiptap/extension-link',
                    '@tiptap/extension-list',
                    '@tiptap/extension-paragraph',
                    '@tiptap/extension-strike',
                    '@tiptap/extension-subscript',
                    '@tiptap/extension-superscript',
                    '@tiptap/extension-text',
                    '@tiptap/extension-underline',
                    '@tiptap/extensions',
                ],
                // The names of `getNamedIcon()` of @panneau/ui, served as they are. Optimized with
                // `lucide-react`, they would split it into one chunk per icon, which every story
                // then loads: Chromium gives up after a few dozen story files.
                exclude: ['lucide-react/dynamicIconImports.mjs'],
            },
        });
    },
};

export default config;
