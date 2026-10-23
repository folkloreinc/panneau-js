import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { EmbedValue } from '@panneau/protocol';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import type { EmbedSource } from '../shared/embed';

const source: EmbedSource = {
    resolve: (url) =>
        url.includes('youtu')
            ? Promise.resolve({ url, type: 'video', title: 'A video', provider: 'YouTube' })
            : Promise.reject(new Error('Not embeddable')),
};

function renderEmbed(onChange: (value: unknown) => void, embedSource: EmbedSource | null) {
    renderField(
        <Controlled<unknown> initial={null} onChange={onChange}>
            {(value, setValue) => (
                <DefinitionField
                    field={{ name: 'video', type: 'embed', label: 'Video' }}
                    path="video"
                    value={value}
                    onChange={setValue}
                />
            )}
        </Controlled>,
        { embedSource },
    );
}

describe('EmbedField', () => {
    it('keeps the URL, then the preview of what it embeds', async () => {
        const onChange = vi.fn();
        renderEmbed(onChange, source);
        await userEvent.type(
            screen.getByRole('textbox', { name: 'Video' }),
            'https://youtu.be/abc',
        );
        expect(onChange).toHaveBeenLastCalledWith({ url: 'https://youtu.be/abc' });
        await waitFor(() =>
            expect(onChange).toHaveBeenLastCalledWith<[EmbedValue]>({
                url: 'https://youtu.be/abc',
                type: 'video',
                title: 'A video',
                provider: 'YouTube',
            }),
        );
        expect(await screen.findByRole('link', { name: /A video/ })).toHaveAttribute(
            'href',
            'https://youtu.be/abc',
        );
    });

    it('says when a URL can’t be embedded, and keeps it', async () => {
        const onChange = vi.fn();
        renderEmbed(onChange, source);
        await userEvent.type(screen.getByRole('textbox', { name: 'Video' }), 'https://example.com');
        expect(await screen.findByText('This URL can’t be embedded.')).toBeInTheDocument();
        expect(onChange).toHaveBeenLastCalledWith({ url: 'https://example.com' });
    });

    it('keeps the URL alone without a source', async () => {
        const onChange = vi.fn();
        renderEmbed(onChange, null);
        await userEvent.type(screen.getByRole('textbox', { name: 'Video' }), 'https://youtu.be/a');
        await userEvent.clear(screen.getByRole('textbox', { name: 'Video' }));
        expect(onChange).toHaveBeenLastCalledWith(null);
    });
});
