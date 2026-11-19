import { describe, expect, it } from 'vitest';

import { formatRuleFailure } from './messages';

describe('formatRuleFailure', () => {
    it('names the providers an embed must come from', () => {
        expect(formatRuleFailure({ rule: 'providers', value: ['YouTube'] })).toBe(
            'This embed must come from YouTube.',
        );
        expect(
            formatRuleFailure({ rule: 'providers', value: ['YouTube', 'Vimeo', 'Spotify'] }),
        ).toBe('This embed must come from YouTube, Vimeo, or Spotify.');
    });

    it('names the ratios of a crop, and falls back on an invalid value', () => {
        expect(formatRuleFailure({ rule: 'crop', value: { ratios: ['16:9', '1:1'] } })).toBe(
            'Crop the image to 16:9 or 1:1.',
        );
        expect(formatRuleFailure({ rule: 'crop' })).toBe('Crop the image for this use.');
        expect(formatRuleFailure({ rule: 'max', value: 1200 })).toBe(
            'This value must be at most 1,200.',
        );
        expect(formatRuleFailure({ rule: 'unknown' })).toBe('This value is invalid.');
        expect(formatRuleFailure({ rule: 'constructor' })).toBe('This value is invalid.');
    });

    it('prefers the message of the rule', () => {
        expect(formatRuleFailure({ rule: 'providers', value: ['YouTube'], message: 'Nope.' })).toBe(
            'Nope.',
        );
    });
});
