import babelParser from '@babel/eslint-parser';
import eslintReact from '@eslint-react/eslint-plugin';
import js from '@eslint/js';
import formatjs from 'eslint-plugin-formatjs';
import importPlugin from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const config = tseslint.config(
    {
        files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    },
    {
        ignores: [
            '**/*.config.js',
            'node_modules',
            '*/*/lib/**',
            '*/*/es/**',
            'packages/*/*.js',
            'fields/*/*.js',
            'forms/*/*.js',
            '!.storybook',
        ],
    },
    {
        settings: {
            react: {
                version: '19',
                defaultVersion: '19',
            },
            'import/resolver': {
                typescript: {},
            },
        },
        languageOptions: {
            globals: {
                ...Object.keys(globals.browser).reduce(
                    (map, key) => ({
                        ...map,
                        [key.trim()]: globals.browser[key],
                    }),
                    {},
                ),
                __DEV__: 'readonly',
                __SERVER__: 'readonly',
                __EDITOR__: 'readonly',
                __ASSETS_MANIFEST__: 'readonly',
                __EMBEDDED_STYLES__: 'readonly',
                __EMBEDDED_SCRIPTS__: 'readonly',
            },
        },
    },
    {
        languageOptions: {
            parser: babelParser,
            parserOptions: {
                ecmaVersion: 'latest',
                requireConfigFile: false,
                babelOptions: {
                    presets: ['@babel/preset-react', '@babel/preset-typescript'],
                },
            },
        },
    },
    js.configs.recommended,
    tseslint.configs.recommended,
    eslintReact.configs['recommended-typescript'],
    importPlugin.flatConfigs.typescript,
    importPlugin.flatConfigs.recommended,
    formatjs.configs.recommended,
    reactPlugin.configs.flat.recommended,
    reactPlugin.configs.flat['jsx-runtime'],
    eslintPluginPrettierRecommended,
    {
        rules: {
            'formatjs/no-literal-string-in-jsx': 'off',
        },
    },
);

export default config;
