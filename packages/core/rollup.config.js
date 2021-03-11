import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';

import { createConfig } from '../../rollup.config';

const files = {
    'index.js': {
        // prependPlugins: [
        //     alias({
        //         entries: [
        //             {
        //                 find: /(\.|\.\.)\/(contexts|utils|hooks|components)\/?$/,
        //                 replacement: '@micromag/core/$2',
        //             },
        //         ],
        //     }),
        // ],
        resolveOptions: {
            extensions: ['.mjs', '.js', '.jsx', '.json', '.node'],
            resolveOnly: [
                new RegExp(path.join(__dirname, './src/lib')),
            ],
        },
    },

    'components.js': {
        prependPlugins: [
            alias({
                entries: [
                    {
                        find: /^(\.\.\/)*\.\.\/\.\.\/(contexts|utils|hooks)\/?$/,
                        replacement: '@micromag/core/$2',
                    },
                    {
                        find: /(\.\.\/)*\.\.\/\.\.\/lib\/?$/,
                        replacement: '@micromag/core',
                    },
                ],
            }),
        ],
        resolveOptions: {
            extensions: ['.mjs', '.js', '.jsx', '.json', '.node'],
            resolveOnly: [
                new RegExp(path.join(__dirname, './src/components')),
                new RegExp(path.join(__dirname, './src/styles')),
            ],
        },
    },

    'contexts.js': {
        prependPlugins: [
            alias({
                entries: [
                    {
                        find: /\.\.\/(hooks|utils|contexts)\/?$/,
                        replacement: '@micromag/core/$1',
                    },
                    {
                        find: /\.\.\/lib\/?$/,
                        replacement: '@micromag/core',
                    },
                ],
            }),
        ],
        resolveOptions: {
            extensions: ['.mjs', '.js', '.jsx', '.json', '.node'],
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
                        replacement: '@micromag/core/$1',
                    },
                    {
                        find: /\.\.\/lib\/?$/,
                        replacement: '@micromag/core',
                    },
                ],
            }),
        ],
        resolveOptions: {
            extensions: ['.mjs', '.js', '.jsx', '.json', '.node'],
            resolveOnly: [
                path.join(__dirname, './src/lib/EventsManager'),
                new RegExp(path.join(__dirname, './src/hooks')),
            ],
        },
    },

    'utils.js': {
        resolveOptions: {
            extensions: ['.mjs', '.js', '.jsx', '.json', '.node'],
            resolveOnly: [
                new RegExp(path.join(__dirname, './src/utils')),
            ],
        },
    },
};

export default Object.keys(files).reduce(
    (configs, file) => [
        ...configs,
        createConfig({
            file,
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
