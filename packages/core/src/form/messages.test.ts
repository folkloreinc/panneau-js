import { describe, expect, it } from 'vitest';

import { formatRuleFailure } from './messages';

describe('formatRuleFailure', () => {
    it('names the providers an embed must come from', () => {
        expect(formatRuleFailure({ rule: 'providers', value: ['YouTube'] })).toBe(
            'This embed must come from YouTube.',
        );
        expect(
            formatRuleFailure({ rule: 'providers', value: ['YouTube', 'Vimeo', 'Spotify'] }),
        ).toBe('This embed must come from YouTube, Vimeo or Spotify.');
    });

    it('prefers the message of the rule', () => {
        expect(formatRuleFailure({ rule: 'providers', value: ['YouTube'], message: 'Nope.' })).toBe(
            'Nope.',
        );
    });
});
