import { createIntl } from 'react-intl';
import { describe, expect, it } from 'vitest';

import { refusalOf, typeOfAccept } from './format';
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

describe('typeOfAccept', () => {
    it('gives the type of every MIME type accepted, or null', () => {
        expect(typeOfAccept(['image/*'])).toBe('image');
        expect(typeOfAccept(['image/png', 'image/jpeg'])).toBe('image');
        expect(typeOfAccept(['video/*'])).toBe('video');
        expect(typeOfAccept(['audio/mpeg'])).toBe('audio');
        expect(typeOfAccept(['application/pdf', 'text/*'])).toBe('document');
        expect(typeOfAccept(['image/*', 'application/pdf'])).toBeNull();
        expect(typeOfAccept(['application/zip'])).toBeNull();
        expect(typeOfAccept([])).toBeNull();
        expect(typeOfAccept(null)).toBeNull();
    });
});
