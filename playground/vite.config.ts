import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defaultClientConditions, defineConfig } from 'vite';

import { SOURCE_CONDITION, cssModules } from '../config/vite.package.ts';

/**
 * The playground: the whole app (`createPanneauApp()`) on the mock backend of the protocol, built
 * from the sources of the packages, like Storybook. `npm run playground`.
 */
export default defineConfig({
    root: import.meta.dirname,
    base: './',
    plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
    resolve: { conditions: [SOURCE_CONDITION, ...defaultClientConditions] },
    css: { modules: cssModules },
    server: { port: 5173 },
});
