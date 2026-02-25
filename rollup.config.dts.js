import { sync } from 'glob';
import path from 'path';
import { dts } from 'rollup-plugin-dts';

const files = sync('./es/*.js');

const config = files.map((file) => {
    const name = path.basename(file, '.js');
    return {
        input: `./types/${name}.d.ts`,
        output: [{ file: `es/${name}.d.ts`, format: 'es' }],
        plugins: [dts()],
    };
});

export default config;
