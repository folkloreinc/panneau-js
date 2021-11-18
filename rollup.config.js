import path from 'path';
import postcss from 'rollup-plugin-postcss';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
// import svgo from 'rollup-plugin-svgo';
import json from '@rollup/plugin-json';
import url from '@rollup/plugin-url';
import replace from '@rollup/plugin-replace';
import generateScopedName from './scripts/lib/generateScopedName';

export const createConfig = ({
    file = 'index.js',
    input = null,
    output = null,
    banner = null,
    format = null,
    withoutPostCss = false,
    withoutPostCssExtract = false,
    resolveOptions = null,
    prependPlugins = [],
    appendPlugins = [],
} = {}) => {
    const isNode = format === 'node';
    const isCjs = format === 'cjs' || format === 'node';
    const outputCjs = {
        file: output || `lib/${file}`,
        format: 'cjs',
        banner,
        exports: 'named'
    };
    const outputEs = {
        file: output || `es/${file}`,
        banner,
        exports: 'named'
    };
    let outputConfig;
    if (format === 'both') {
        outputConfig = [outputCjs, outputEs];
    } else {
        outputConfig = isCjs ? outputCjs : outputEs;
    }
    return {
        input: input || `src/${file}`,
        output: outputConfig,
        plugins: [
            ...prependPlugins,
            json(),
            resolve({
                extensions: ['.mjs', '.js', '.jsx', '.json', '.node'],
                jail: path.join(process.cwd(), 'src'),
                ...resolveOptions,
            }),
            commonjs(),
            babel({
                extensions: ['.mjs', '.js', '.jsx', '.json', '.node'],
                exclude: 'node_modules/**',
                // rootMode: 'upward',
                babelHelpers: 'runtime',
                presets: [
                    [
                        require('@babel/preset-env'),
                        isNode
                            ? {
                                  modules: false,
                                  useBuiltIns: false,
                                  targets: {
                                      node: '12',
                                  },
                              }
                            : {
                                  modules: false,
                                  useBuiltIns: false,
                              },
                    ],
                    [
                        require('@babel/preset-react'),
                        {
                            useBuiltIns: true,
                        },
                    ],
                ],
                plugins: [
                    [
                        require.resolve('@babel/plugin-transform-runtime'),
                        {
                            version: require('@babel/helpers/package.json').version,
                            helpers: true,
                            // useESModules: !isAbsolute,
                        },
                    ],
                    require.resolve('@babel/plugin-proposal-export-namespace-from'),
                    [
                        require.resolve('babel-plugin-static-fs'),
                        {
                            target: isNode ? 'node' : 'browser', // defaults to node
                        },
                    ],
                    [
                        require.resolve('babel-plugin-react-intl'),
                        {
                            ast: true,
                            extractFromFormatMessageCall: true,
                            idInterpolationPattern: '[sha512:contenthash:base64:6]',
                        },
                    ],
                ],
            }),
            !withoutPostCss &&
                postcss({
                    extensions: ['.css', '.scss'],
                    modules: {
                        generateScopedName,
                    },
                    autoModules: true,
                    extract: !withoutPostCssExtract ? 'styles.css' : false,
                    inject: false,
                }),
            image({
                // exclude: ['**/*.svg'],
            }),
            url({ include: ['**/*.mp4'] }),
            replace({
                values: {
                    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
                },
                preventAssignment: true,
            }),
            ...appendPlugins,
        ].filter(Boolean),
    };
};

export default [createConfig({ format: 'both' }) /* , createConfig({ format: 'cjs' }) */];
