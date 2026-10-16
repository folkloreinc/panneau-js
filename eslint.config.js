import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
    globalIgnores([
        'legacy/',
        '.tmp/',
        '**/dist/',
        '**/node_modules/',
        '**/temp/',
        'coverage/',
        'storybook-static/',
    ]),
    js.configs.recommended,
    tseslint.configs.strict,
    reactHooks.configs.flat.recommended,
    {
        languageOptions: {
            ecmaVersion: 2023,
            globals: { ...globals.browser, ...globals.node },
        },
        rules: {
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
            ],
        },
    },
    {
        // UI packages and the engine end up in product bundles: they take the protocol's runtime
        // helpers from `@panneau/protocol/runtime`, which doesn't load zod, and only types from
        // the main entry point.
        files: ['packages/{core,fields,forms,intl,lists,ui}/src/**/*.{ts,tsx}'],
        ignores: ['**/*.test.{ts,tsx}', '**/*.stories.{ts,tsx}', '**/__fixtures__/**'],
        rules: {
            '@typescript-eslint/no-restricted-imports': [
                'error',
                {
                    paths: [
                        {
                            name: '@panneau/protocol',
                            allowTypeImports: true,
                            message:
                                'Import values from @panneau/protocol/runtime: the main entry point loads zod and its schemas.',
                        },
                    ],
                },
            ],
        },
    },
    prettier,
]);
