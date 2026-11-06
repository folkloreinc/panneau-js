import { fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { documentMedia } from '../__fixtures__/mediaSources';
import { renderInRoot } from '../__fixtures__/render';
import { Thumbnail } from './MediaGrid';

function media(id: string) {
    const item = documentMedia.find((candidate) => candidate.id === id);
    if (item === undefined) {
        throw new Error(`No media ${id}`);
    }
    return item;
}

const report = media('med_01');
const pricing = media('doc_03');

describe('the thumbnail of a media', () => {
    it('shows the icon of a document without a thumbnail', () => {
        const { container } = renderInRoot(<Thumbnail item={report} />);
        expect(container.querySelector('img')).toBeNull();
        expect(container.querySelector('[data-kind="document"]')).toHaveTextContent('PDF');
    });

    it('shows the icon of a spreadsheet from its MIME type', () => {
        const { container } = renderInRoot(<Thumbnail item={pricing} />);
        expect(container.querySelector('[data-kind="spreadsheet"]')).toHaveTextContent('XLSX');
    });

    it('falls back to the icon when the thumbnail fails to load', () => {
        const { container } = renderInRoot(
            <Thumbnail
                item={{
                    ...report,
                    media: { ...report.media, thumbnailUrl: 'https://files.test/missing.jpg' },
                }}
            />,
        );
        const image = container.querySelector('img');
        expect(image).not.toBeNull();
        if (image !== null) {
            fireEvent.error(image);
        }
        expect(container.querySelector('img')).toBeNull();
        expect(container.querySelector('[data-kind="document"]')).toBeInTheDocument();
    });
});
