import alias from '@rollup/plugin-alias';
import typescript from '@rollup/plugin-typescript';
import path from 'path';
import { fileURLToPath } from 'url';
import copy from 'rollup-plugin-copy';

import { createConfig } from '../../rollup.config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const files = {
    'index.ts': {
        prependPlugins: [
            alias({
                entries: [
                    {
                        find: /(\.|\.\.)\/(contexts|utils|hooks|components)\/?$/,
                        replacement: '@panneau/core/$2',
                    },
                ],
            }),
        ],
        resolveOptions: {
            extensions: ['.mjs', '.js', '.jsx', '.json', '.node', '.ts', '.tsx'],
            resolveOnly: [new RegExp(path.join(__dirname, './src/lib'))],
        },
    },

    'contexts.ts': {
        prependPlugins: [
            alias({
                entries: [
                    {
                        find: /\.\.\/(hooks|utils|contexts)\/?$/,
                        replacement: '@panneau/core/$1',
                    },
                    {
                        find: /\.\.\/lib\/?$/,
                        replacement: '@panneau/core',
                    },
                ],
            }),
        ],
        resolveOptions: {
            extensions: ['.mjs', '.js', '.jsx', '.json', '.node', '.ts', '.tsx'],
            resolveOnly: [
                new RegExp(path.join(__dirname, './src/components/namespaces')),
                new RegExp(path.join(__dirname, './src/contexts')),
                new RegExp(path.join(__dirname, './src/hooks/useUppyLocale')),
                new RegExp(path.join(__dirname, './src/utils/getTransloaditMediasFromResponse')),
            ],
        },
    },

    'hooks.ts': {
        prependPlugins: [
            alias({
                entries: [
                    {
                        find: /\.\.\/(contexts|utils)\/?$/,
                        replacement: '@panneau/core/$1',
                    },
                    {
                        find: /\.\.\/lib\/?$/,
                        replacement: '@panneau/core',
                    },
                ],
            }),
        ],
        resolveOptions: {
            extensions: ['.mjs', '.js', '.jsx', '.json', '.node', '.ts', '.tsx'],
            resolveOnly: [
                path.join(__dirname, './src/lib/EventsManager'),
                new RegExp(path.join(__dirname, './src/hooks')),
            ],
        },
    },

    'utils.ts': {
        prependPlugins: [
        ],
        resolveOptions: {
            extensions: ['.mjs', '.js', '.jsx', '.json', '.node', '.ts', '.tsx'],
            resolveOnly: [new RegExp(path.join(__dirname, './src/utils'))],
        },
    },
};

const config = Object.keys(files).reduce(
    (configs, file) => [
        ...configs,
        createConfig({
            file,
            format: 'es',
            ...files[file],
        }),
        // createConfig({
        //     file,
        //     format: 'cjs',
        //     ...files[file],
        // }),
    ],
    [],
);

export default config;
