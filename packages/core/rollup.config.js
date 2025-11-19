import alias from '@rollup/plugin-alias';
import typescript from '@rollup/plugin-typescript';
import path from 'path';
import copy from 'rollup-plugin-copy';

import { createConfig } from '../../rollup.config';

const files = {
    'index.js': {
        // prependPlugins: [
        //     alias({
        //         entries: [
        //             {
        //                 find: /(\.|\.\.)\/(contexts|utils|hooks|components)\/?$/,
        //                 replacement: '@panneau/core/$2',
        //             },
        //         ],
        //     }),
        // ],
        resolveOptions: {
            extensions: ['.mjs', '.js', '.jsx', '.json', '.node', '.ts', '.tsx'],
            resolveOnly: [new RegExp(path.join(__dirname, './src/lib'))],
        },
    },

    'contexts.js': {
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

    'hooks.js': {
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

    'utils.js': {
        prependPlugins: [
            copy({
                targets: [
                    { src: 'src/types/index.d.ts', dest: 'es/types' },
                    { src: 'src/types/core.d.ts', dest: 'es/types' },
                    { src: 'src/types/form.d.ts', dest: 'es/types' },
                    { src: 'src/types/panneau.d.ts', dest: 'es/types' },
                    { src: 'src/types/resource.d.ts', dest: 'es/types' },
                ],
            }),
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
        createConfig({
            file,
            format: 'cjs',
            ...files[file],
        }),
    ],
    [],
);

// console.log('Rollup config for @panneau/core:', config);

export default config;
