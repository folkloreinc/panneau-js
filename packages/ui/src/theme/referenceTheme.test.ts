import { describe, expect, it } from 'vitest';

import { referenceTheme } from './__fixtures__/referenceTheme';
import { checkTheme } from './checkTheme';
import { findUnknownTokens } from './defineTheme';

describe('the reference theme', () => {
    it('only uses tokens Panneau knows', () => {
        expect(findUnknownTokens(referenceTheme)).toEqual([]);
    });

    it('passes checkTheme', () => {
        const report = checkTheme(referenceTheme);
        expect(report.failures).toEqual([]);
        expect(report.colorDifferences).toEqual([]);
    });
});
