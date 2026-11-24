import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { FALLBACK_SEMANTIC_TOKENS, SEMANTIC_TOKENS } from './semanticTokens';

describe('semantic tokens', () => {
    it('are the tokens the default theme defines on the root', () => {
        const css = readFileSync(
            join(import.meta.dirname, '../root/PanneauRoot.module.css'),
            'utf8',
        );
        const start = css.indexOf(':where(.root) {');
        const block = css.slice(start, css.indexOf('\n}', start));
        const declared = [...block.matchAll(/--(panneau-[a-z0-9-]+)\s*:/g)].map(
            (match) => match[1],
        );
        expect([...SEMANTIC_TOKENS].sort()).toEqual(declared.sort());
    });

    it('read with a fallback are only reset by the root, never given a value', () => {
        const css = readFileSync(
            join(import.meta.dirname, '../root/PanneauRoot.module.css'),
            'utf8',
        );
        Object.keys(FALLBACK_SEMANTIC_TOKENS).forEach((name) => {
            const values = [...css.matchAll(new RegExp(`--${name}\\s*:\\s*([^;]+);`, 'g'))].map(
                (match) => match[1],
            );
            expect(values.length).toBeGreaterThan(0);
            values.forEach((value) => expect(value).toBe('initial'));
        });
    });
});
