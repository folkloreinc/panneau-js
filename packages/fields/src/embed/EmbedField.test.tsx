import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { EmbedValue, Field } from '@panneau/protocol';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import type { EmbedSource } from '../shared/embed';
import { EmbedField } from './EmbedField';

const source: EmbedSource = {
    resolve: (url) =>
        url.includes('youtu')
            ? Promise.resolve({ url, type: 'video', title: 'A video', provider: 'YouTube' })
            : Promise.reject(new Error('Not embeddable')),
};

function renderEmbed(
    onChange: (value: unknown) => void,
    embedSource: EmbedSource | null,
    field: Partial<Field> = {},
) {
    renderField(
        <Controlled<unknown> initial={null} onChange={onChange}>
            {(value, setValue) => (
                <DefinitionField
                    field={{ name: 'video', type: 'embed', label: 'Video', ...field }}
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
        expect(await screen.findByText('A video')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Open in a new window' })).toHaveAttribute(
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

    it('names the providers of its providers rule, and refuses an embed of another one', async () => {
        const onChange = vi.fn();
        const vimeo: EmbedSource = {
            resolve: (url) => Promise.resolve({ url, type: 'video', provider: 'Vimeo' }),
        };
        renderEmbed(onChange, vimeo, {
            help: 'A trailer.',
            rules: [{ rule: 'providers', value: ['YouTube', 'Dailymotion'] }],
        });
        const input = screen.getByRole('textbox', { name: 'Video' });
        expect(input).toHaveAccessibleDescription(
            'A trailer. Accepted providers: YouTube and Dailymotion.',
        );
        await userEvent.type(input, 'https://vimeo.com/1');
        expect(
            await screen.findByText('This embed must come from YouTube or Dailymotion.'),
        ).toBeInTheDocument();
        expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('accepts an embed of a listed provider, without case', async () => {
        const onChange = vi.fn();
        renderEmbed(onChange, source, { rules: [{ rule: 'providers', value: ['youtube'] }] });
        await userEvent.type(screen.getByRole('textbox', { name: 'Video' }), 'https://youtu.be/a');
        expect(await screen.findByText('A video')).toBeInTheDocument();
        expect(screen.queryByText(/must come from/)).not.toBeInTheDocument();
    });

    it('shows the duration of a video over its thumbnail, as players do', () => {
        renderField(
            <EmbedField
                label="Video"
                value={{
                    url: 'https://vimeo.com/1',
                    title: 'A video',
                    provider: 'Vimeo',
                    thumbnailUrl: 'https://i.vimeocdn.com/1.jpg',
                    duration: 3723,
                }}
            />,
        );
        const duration = screen.getByText('1:02:03');
        expect(duration.tagName).toBe('TIME');
        expect(duration).toHaveAttribute('datetime', 'PT1H2M3S');
        expect(screen.getByRole('link', { name: 'Open in a new window' })).toHaveAttribute(
            'target',
            '_blank',
        );
    });

    it('shows the duration after the provider without a thumbnail', () => {
        renderField(
            <EmbedField
                label="Sound"
                value={{
                    url: 'https://example.com/1',
                    title: 'A sound',
                    provider: 'Podcast',
                    duration: 134,
                }}
            />,
        );
        expect(screen.getByText('2:14').parentElement).toHaveTextContent('Podcast2:14');
    });
});
