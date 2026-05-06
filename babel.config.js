module.exports = {
    presets: [
        [
            require('@babel/preset-env'),
            {
                modules: false,
                useBuiltIns: false,
                targets: {
                    node: '18',
                },
            },
        ],
        [
            require('@babel/preset-typescript'),
            {
                allExtensions: true,
                isTSX: true,
            },
        ],
        [
            require('@babel/preset-react'),
            {
                useBuiltIns: true,
                runtime: 'automatic',
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
                target: 'browser', // defaults to node
            },
        ],
        [
            require.resolve('babel-plugin-formatjs'),
            {
                removeDefaultMessage: true,
                idInterpolationPattern: '[sha512:contenthash:base64:6]',
            },
        ],
        [
            require.resolve('babel-plugin-react-compiler'),
            {
                // compilationMode: 'annotation',
                logger: {
                    logEvent(filename, event) {
                        if (event.kind === 'CompileError') {
                            console.error(`\nCompilation failed: ${filename}`);
                            console.error(`Reason: ${event.detail.reason}`);

                            if (event.detail.description) {
                                console.error(`Details: ${event.detail.description}`);
                            }

                            if (event.detail.loc) {
                                const { line, column } = event.detail.loc.start;
                                console.error(`Location: Line ${line}, Column ${column}`);
                            }

                            if (event.detail.suggestions) {
                                console.error('Suggestions:', event.detail.suggestions);
                            }
                        }
                    },
                },
            },
        ],
    ],
};
