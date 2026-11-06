import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import type { EmbedValue } from '@panneau/protocol';

import { FieldsProvider } from '../shared/context';
import type { EmbedSource } from '../shared/embed';
import { EmbedField } from './EmbedField';

/** A thumbnail drawn locally, so that the stories need no network. */
const THUMBNAIL = `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#1f2937"/><path d="M140 65l45 25-45 25z" fill="#fff"/></svg>',
)}`;

const source: EmbedSource = {
    resolve: (url) =>
        url.includes('spotify')
            ? Promise.resolve({ url, type: 'audio', title: 'A playlist', provider: 'Spotify' })
            : url.includes('youtu')
              ? new Promise((resolve) =>
                    setTimeout(
                        () =>
                            resolve({
                                url,
                                type: 'video',
                                title: 'The river festival, in two minutes',
                                provider: 'YouTube',
                                thumbnailUrl: THUMBNAIL,
                            }),
                        300,
                    ),
                )
              : Promise.reject(new Error('Not embeddable')),
};

function Controlled({
    initial,
    providers,
}: {
    initial: EmbedValue | null;
    providers?: readonly string[];
}) {
    const [value, setValue] = useState<EmbedValue | null>(initial);
    return (
        <FieldsProvider embedSource={source}>
            <div style={{ maxWidth: '32rem' }}>
                <EmbedField
                    label="Video"
                    placeholder="https://"
                    description="A video of the event."
                    value={value}
                    {...(providers !== undefined ? { providers } : {})}
                    onChange={setValue}
                />
            </div>
        </FieldsProvider>
    );
}

const meta = {
    title: 'Fields/Embed',
    component: Controlled,
    args: { initial: null },
} satisfies Meta<typeof Controlled>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The preview follows the URL. */
export const Empty: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.type(
            canvas.getByRole('textbox', { name: 'Video' }),
            'https://youtu.be/abc',
        );
        await expect(
            await canvas.findByText('The river festival, in two minutes', {}, { timeout: 3000 }),
        ).toBeVisible();
        await expect(canvas.getByRole('link', { name: 'Open in a new window' })).toHaveAttribute(
            'href',
            'https://youtu.be/abc',
        );
    },
};

export const WithVideo: Story = {
    args: {
        initial: {
            url: 'https://youtu.be/abc',
            type: 'video',
            title: 'The river festival, in two minutes',
            provider: 'YouTube',
            thumbnailUrl: THUMBNAIL,
            duration: 134,
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('2:14')).toBeVisible();
        await expect(canvas.getByRole('link', { name: 'Open in a new window' })).toHaveAttribute(
            'target',
            '_blank',
        );
    },
};

/** A URL that can't be embedded is kept, with a message. */
export const NotEmbeddable: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.type(canvas.getByRole('textbox', { name: 'Video' }), 'https://example.com');
        await expect(
            await canvas.findByText('This URL can’t be embedded.', {}, { timeout: 3000 }),
        ).toBeInTheDocument();
    },
};

/**
 * With a `providers` rule, the help names the providers, and an embed of another provider is
 * refused as soon as its preview comes back.
 */
export const Providers: Story = {
    args: { providers: ['YouTube', 'Vimeo'] },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByRole('textbox', { name: 'Video' });
        await expect(input).toHaveAccessibleDescription(
            'A video of the event. Accepted providers: YouTube and Vimeo.',
        );
        await userEvent.type(input, 'https://open.spotify.com/playlist/1');
        await expect(
            await canvas.findByText(
                'This embed must come from YouTube or Vimeo.',
                {},
                { timeout: 3000 },
            ),
        ).toBeInTheDocument();
        await expect(input).toHaveAttribute('aria-invalid', 'true');
    },
};
