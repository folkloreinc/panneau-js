import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import type { LinkValue } from '@panneau/protocol';
import type { LinkNewTab, LinkType } from '@panneau/protocol/runtime';

import { FieldsProvider } from '../shared/context';
import type { RelationSource } from '../shared/relation';
import { LinkField } from './LinkField';

const PAGES: Record<string, { id: string; label: string }[]> = {
    pages: [
        { id: '1', label: 'Programme' },
        { id: '2', label: 'About' },
    ],
    events: [{ id: '7', label: 'Opening night' }],
};

const relationSource: RelationSource = {
    search: (resource, query) =>
        Promise.resolve(
            (PAGES[resource] ?? []).filter((page) =>
                page.label.toLowerCase().includes(query.toLowerCase()),
            ),
        ),
};

function Controlled({
    initial,
    types,
    newTab,
}: {
    initial: LinkValue | null;
    types?: LinkType[];
    newTab?: LinkNewTab;
}) {
    const [value, setValue] = useState<LinkValue | null>(initial);
    return (
        <FieldsProvider locales={['fr', 'en']} relationSource={relationSource}>
            <div style={{ display: 'grid', gap: '1rem', maxWidth: '36rem' }}>
                <LinkField
                    label="Button"
                    pages={['pages', 'events']}
                    {...(types !== undefined ? { types } : {})}
                    {...(newTab !== undefined ? { newTab } : {})}
                    value={value}
                    onChange={setValue}
                />
                <output aria-label="Value" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {JSON.stringify(value)}
                </output>
            </div>
        </FieldsProvider>
    );
}

const meta = {
    title: 'Fields/Link',
    component: Controlled,
    args: {
        initial: null,
        types: [{ id: 'page' }, { id: 'url' }, { id: 'email' }, { id: 'tel' }],
    },
} satisfies Meta<typeof Controlled>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A page searched in every resource of the field, with its label in French. */
export const Page: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.type(canvas.getByRole('combobox', { name: /Page/ }), 'open');
        await userEvent.click(await body.findByRole('option', { name: 'Opening night' }));
        await userEvent.type(canvas.getByRole('textbox', { name: /Label/ }), 'Billets');
        await waitFor(() =>
            expect(canvas.getByRole('status', { name: 'Value' })).toHaveTextContent(
                '{"type":"page","page":{"id":"7","label":"Opening night","resource":"events"},"label":{"fr":"Billets"},"newTab":false}',
            ),
        );
    },
};

/** An email address, kept as `mailto:`. */
export const Email: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('radio', { name: 'Email' }));
        await userEvent.type(
            canvas.getByRole('textbox', { name: /Email address/ }),
            'info@example.com',
        );
        await waitFor(() =>
            expect(canvas.getByRole('status', { name: 'Value' })).toHaveTextContent(
                '"url":"mailto:info@example.com"',
            ),
        );
    },
};

/** URLs open in a new tab by themselves, without a checkbox. */
export const ExternalInNewTab: Story = {
    args: {
        newTab: 'external',
        initial: { type: 'url', url: 'https://example.com', label: { fr: 'Site' }, newTab: true },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.queryByRole('checkbox')).toBeNull();
    },
};

/** A type of the site: an anchor of the page. */
export const SiteType: Story = {
    args: {
        types: [{ id: 'url' }, { id: 'anchor', label: 'Anchor', placeholder: '#section' }],
        initial: { type: 'anchor', url: '#programme' },
    },
};
