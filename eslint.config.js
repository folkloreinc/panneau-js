import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
    globalIgnores(['legacy/', '.tmp/', '**/dist/', '**/node_modules/', '**/temp/', 'coverage/']),
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
    prettier,
]);
