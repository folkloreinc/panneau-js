import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderField } from '../__fixtures__/render';
import { DefinitionField } from './DefinitionField';
import { lazyFieldEntry } from './lazy';
import type { FieldEntryProps } from './types';

function Entry({ field }: FieldEntryProps) {
    return <p>The {field.name} field</p>;
}

describe('lazyFieldEntry', () => {
    it('shows the skeleton of the field while its code loads, then the field', async () => {
        let resolve: (entry: typeof Entry) => void = () => undefined;
        const LazyEntry = lazyFieldEntry(
            () =>
                new Promise((done) => {
                    resolve = done;
                }),
        );
        renderField(
            <LazyEntry
                field={{ name: 'chart', type: 'chart', label: 'Chart' }}
                path="chart"
                value={null}
                onChange={() => undefined}
            />,
        );
        expect(screen.getByRole('status')).toHaveTextContent('Loading…');
        expect(document.querySelector('[aria-busy="true"] .panneau-skeleton')).not.toBeNull();
        resolve(Entry);
        expect(await screen.findByText('The chart field')).toBeInTheDocument();
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('loads the built-in types with heavy code on first use (#346)', async () => {
        renderField(
            <DefinitionField
                field={{ name: 'phone', type: 'tel', label: 'Phone' }}
                path="phone"
                value={null}
                onChange={() => undefined}
            />,
        );
        expect(await screen.findByRole('textbox', { name: 'Phone' })).toBeInTheDocument();
    });
});
