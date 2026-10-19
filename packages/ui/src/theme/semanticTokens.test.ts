import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { SEMANTIC_TOKENS } from './semanticTokens';

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
});
