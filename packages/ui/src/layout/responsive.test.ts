import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { BREAKPOINTS, responsiveVariables, space, withVariables } from './responsive';

describe('responsiveVariables', () => {
    it('sets one variable per breakpoint', () => {
        expect(responsiveVariables('grid', 'columns', { base: 1, md: 2, xl: 4 }, String)).toEqual({
            '--_panneau-grid-columns-base': '1',
            '--_panneau-grid-columns-md': '2',
            '--_panneau-grid-columns-xl': '4',
        });
    });

    it('takes a single value as the base one', () => {
        expect(responsiveVariables('stack', 'gap', 2, space)).toEqual({
            '--_panneau-stack-gap-base': 'var(--panneau-space-2)',
        });
        expect(responsiveVariables('stack', 'gap', 0, space)).toEqual({
            '--_panneau-stack-gap-base': '0',
        });
        expect(responsiveVariables('stack', 'gap', undefined, space)).toEqual({});
    });
});

describe('withVariables', () => {
    it('lets the style prop win, and adds nothing without variables', () => {
        expect(withVariables([{ '--a': '1' }, {}], { color: 'red' })).toEqual({
            '--a': '1',
            color: 'red',
        });
        const style = { color: 'red' };
        expect(withVariables([{}], style)).toBe(style);
    });
});

describe('breakpoints', () => {
    it('are the widths of the container queries of the primitives', () => {
        const widths = new Set(Object.values(BREAKPOINTS));
        ['stack/Stack', 'inline/Inline', 'grid/Grid', 'grid/GridItem'].forEach((name) => {
            const css = readFileSync(join(import.meta.dirname, `../${name}.module.css`), 'utf8');
            const queries = [...css.matchAll(/@container \(min-width: ([0-9.]+rem)\)/g)].map(
                (match) => match[1],
            );
            expect(new Set(queries), name).toEqual(widths);
        });
    });
});
