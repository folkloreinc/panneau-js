const path = require('path');
const getPackagesAliases = require('./scripts/lib/getPackagesAliases');

module.exports = (api) => {
    if (api.env('node')) {
        return {
            ignore: [/node_modules\/(?!@panneau)/],
            presets: [
                [
                    require('@babel/preset-env'),
                    {
                        targets: {
                            node: 'current',
                        },
                        loose: true,
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
                    require.resolve('babel-plugin-module-resolver'),
                    {
                        alias: {
                            react: require.resolve('react'),
                            // '@folklore/routes': require.resolve('@folklore/routes'),
                            // 'react-dom/server': require.resolve('react-dom/server'),
                            // 'react-dom': require.resolve('react-dom'),
                            // 'react-intl': require.resolve('react-intl'),
                            ...getPackagesAliases({ withoutEndSign: true }),
                        },
                    },
                ],
                require.resolve('@babel/plugin-transform-runtime'),
                require.resolve('babel-plugin-dynamic-import-node'),
                require.resolve('@babel/plugin-proposal-export-namespace-from'),
                // [
                //     require.resolve('babel-plugin-css-modules-transform'),
                //     {
                //         preprocessCss: path.join(__dirname, './scripts/process-scss.js'),
                //         extensions: ['.scss'],
                //         generateScopedName: path.resolve(
                //             __dirname,
                //             './scripts/lib/generateScopedName.js',
                //         ),
                //     },
                // ],
                // [
                //     path.join(__dirname, './scripts/babel-plugin-transform-require-ignore'),
                //     {
                //         extensions: ['.global.scss'],
                //     },
                // ],
                [
                    require.resolve('babel-plugin-transform-assets-import-to-string'),
                    {
                        extensions: ['.png'],
                    },
                ],
            ],
        };
    }
    return {
        presets: api.env('development')
            ? [
                  '@babel/preset-react',
                  [
                      require('@babel/preset-env'),
                      {
                          targets: {
                              node: 'current',
                          },
                      },
                  ],
                  // require.resolve('@babel/plugin-proposal-numeric-separator'),
              ].filter(Boolean)
            : [],
        plugins: [
            require.resolve('@babel/plugin-proposal-export-namespace-from'),
            [
                require.resolve('babel-plugin-static-fs'),
                {
                    target: 'browser', // defaults to node
                },
            ],
            require.resolve('@babel/plugin-proposal-numeric-separator'),
            [require.resolve('@babel/plugin-proposal-private-property-in-object'), { loose: true }],
            [require.resolve('@babel/plugin-proposal-class-properties'), { loose: true }],
            [require.resolve('@babel/plugin-proposal-private-methods'), { loose: true }],
            [
                require.resolve('babel-plugin-react-intl'),
                {
                    ast: true,
                    extractFromFormatMessageCall: true,
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
        ].filter(Boolean),
    };
};
