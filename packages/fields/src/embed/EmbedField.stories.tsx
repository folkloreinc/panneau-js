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
        url.includes('youtu')
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

function Controlled({ initial }: { initial: EmbedValue | null }) {
    const [value, setValue] = useState<EmbedValue | null>(initial);
    return (
        <FieldsProvider embedSource={source}>
            <div style={{ maxWidth: '32rem' }}>
                <EmbedField
                    label="Video"
                    placeholder="https://"
                    description="A YouTube or Vimeo video."
                    value={value}
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
            await canvas.findByRole('link', { name: /The river festival/ }, { timeout: 3000 }),
        ).toHaveAttribute('href', 'https://youtu.be/abc');
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
        },
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
