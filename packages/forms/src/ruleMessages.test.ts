import { createIntl } from 'react-intl';
import { describe, expect, it } from 'vitest';

import { type RuleMessageValues, ruleMessages } from '@panneau/core';

import { messages } from './messages';

/** Values that each message shows, to compare the English texts. */
const VALUES: Record<string, RuleMessageValues> = {
    min: { value: 3 },
    max: { value: 1200 },
    minLength: { value: 1 },
    maxLength: { value: 1200 },
    minItems: { value: 1 },
    maxItems: { value: 3 },
    minAmount: { value: '$5.00' },
    maxAmount: { value: '$10.00' },
    cropRatios: { ratios: ['16:9', '1:1'] },
    providers: { providers: ['YouTube', 'Vimeo', 'Spotify'] },
};

describe('the English messages of the rules of @panneau/core', () => {
    it('have the keys of the rule messages of @panneau/intl', () => {
        expect(Object.keys(ruleMessages).sort()).toEqual(Object.keys(messages.rule).sort());
    });

    it('say what the English messages of @panneau/intl say', () => {
        const intl = createIntl({ locale: 'en' });
        Object.entries(messages.rule).forEach(([key, descriptor]) => {
            const values = VALUES[key] ?? {};
            const formatted = Object.fromEntries(
                Object.entries(values).map(([name, value]) => [
                    name,
                    Array.isArray(value)
                        ? intl.formatList(value as string[], { type: 'disjunction' })
                        : value,
                ]),
            );
            expect(ruleMessages[key]?.(values), key).toBe(
                intl.formatMessage(descriptor, formatted),
            );
        });
    });
});
