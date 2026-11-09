import { describe, expect, it } from 'vitest';

import { isInlineField } from './editable';

describe('isInlineField', () => {
    it('edits simple fields in place, but not those that forms leave out', () => {
        expect(isInlineField({ name: 'title', type: 'text' })).toBe(true);
        expect(isInlineField({ name: 'title', type: 'text', readOnly: true })).toBe(false);
        // The URL of a page, which only items give (decision 0071)
        expect(isInlineField({ name: 'url', type: 'text', notInForm: true })).toBe(false);
    });
});
