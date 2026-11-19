import { afterEach, describe, expect, it, vi } from 'vitest';

import { prefersReducedMotion } from './motion';

describe('prefersReducedMotion', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('reads the media query of the system', () => {
        const matchMedia = vi.fn((query: string) => ({ matches: query.includes('reduce') }));
        vi.stubGlobal('matchMedia', matchMedia);
        expect(prefersReducedMotion()).toBe(true);
        expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });

    it('is false without matchMedia, as in jsdom', () => {
        vi.stubGlobal('matchMedia', undefined);
        expect(prefersReducedMotion()).toBe(false);
    });
});
