import replace from '@rollup/plugin-replace';
import { createConfig } from '../../rollup.config';
import { supportedLocales as locales } from './package.json';

const localesFiles = locales.reduce(
    (configs, locale) => [
        ...configs,
        createConfig({
            input: 'src/lang.js',
            output: `locale/${locale}.js`,
            prependPlugins: [
                replace({
                    REPLACE_LOCALE: locale,
                }),
            ],
        }),
        createConfig({
            input: 'src/lang.js',
            output: `locale/${locale}.cjs.js`,
            format: 'cjs',
            prependPlugins: [
                replace({
                    REPLACE_LOCALE: locale,
                }),
            ],
        }),
    ],
    [],
);

export default [
    createConfig({
        format: 'both',
    }),
    // createConfig({
    //     format: 'cjs',
    // }),
    ...localesFiles,
];
