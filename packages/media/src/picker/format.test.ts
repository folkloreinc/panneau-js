import { createIntl } from 'react-intl';
import { describe, expect, it } from 'vitest';

import { refusalOf } from './format';
import type { PickerMedia } from './types';

const intl = createIntl({ locale: 'en', messages: {} });

const failed = (error?: { code: string; message?: string }): PickerMedia =>
    ({
        id: 'med_1',
        label: 'clip.mp4',
        media: {
            type: 'video',
            mime: 'video/mp4',
            size: 10,
            status: 'failed',
            ...(error && { error }),
        },
    }) as unknown as PickerMedia;

describe('refusalOf', () => {
    it('says why a media that failed to process cannot be picked', () => {
        expect(refusalOf(failed(), null, null, intl)).toBe('Processing failed');
        expect(
            refusalOf(
                failed({ code: 'timeout', message: 'The poster took too long.' }),
                null,
                null,
                intl,
            ),
        ).toBe('Processing failed: The poster took too long.');
    });
});
