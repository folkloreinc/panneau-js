import { sync } from 'glob';
import path from 'path';
import { dts } from 'rollup-plugin-dts';

const files = sync('./dist/*.js');

const config = files.map((file) => {
    const name = path.basename(file, '.js');
    return {
        input: `./types/${name}.d.ts`,
        output: [{ file: `dist/${name}.d.ts`, format: 'es' }],
        plugins: [dts()],
    };
});

export default config;
