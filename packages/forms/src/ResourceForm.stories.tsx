/**
 * A full resource form, from the protocol's example definition, saved through the REST adapter of
 * `@panneau/data` against the mock backend of `@panneau/protocol`: validation errors from the
 * portable rules, and a version conflict when someone else saves the page in between.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { PanneauProvider, getItemValues, resolveForm } from '@panneau/core';
import { createRestAdapter } from '@panneau/data';
import { createRelationSource } from '@panneau/fields';
import type { Definition, Item } from '@panneau/protocol';
import { createExampleDefinition, createMockBackend } from '@panneau/protocol/mock';
import { Button, Spinner } from '@panneau/ui';

import { Form } from './Form';

function createSetup() {
    const definition = createExampleDefinition();
    const backend = createMockBackend({
        definition,
        items: {
            pages: [
                {
                    id: '1',
                    title: { fr: 'À propos', en: 'About us' },
                    status: 'draft',
                    author: { id: '1', label: 'Ada Lovelace' },
                    blocks: [
                        { type: 'text', body: '<p>We make websites.</p>' },
                        { type: 'image', image: null },
                    ],
                },
            ],
            authors: [
                { id: '1', name: 'Ada Lovelace' },
                { id: '2', name: 'Grace Hopper' },
            ],
        },
    });
    const adapter = createRestAdapter({ baseUrl: definition.api.baseUrl, fetch: backend.fetch });
    const relationSource = createRelationSource(adapter, {
        getLabel: (item) => (typeof item.name === 'string' ? item.name : item.id),
    });
    return { adapter, relationSource };
}

function ResourceForm() {
    const [{ adapter, relationSource }] = useState(createSetup);
    const [definition, setDefinition] = useState<Definition | null>(null);
    const [item, setItem] = useState<Item | null>(null);

    useEffect(() => {
        void Promise.all([adapter.getDefinition(), adapter.get('pages', '1')]).then(
            ([loaded, page]) => {
                setDefinition(loaded);
                setItem(page);
            },
        );
    }, [adapter]);

    const resource = definition?.resources.find((candidate) => candidate.id === 'pages');
    if (definition === null || item === null || resource === undefined) {
        return <Spinner showLabel />;
    }
    const { fields, layout } = resolveForm(resource, { mode: 'update' });
    return (
        <PanneauProvider definition={definition}>
            <Form
                key={item.version}
                aria-label="Edit the page"
                fields={fields}
                layout={layout}
                values={getItemValues(
                    item,
                    fields.map((field) => field.name),
                )}
                version={item.version}
                mode="update"
                relationSource={relationSource}
                onSubmit={(_values, { version, changes }) =>
                    adapter.update('pages', item.id, changes, { version })
                }
                onReload={() => void adapter.get('pages', item.id).then(setItem)}
                actions={
                    <Button
                        variant="ghost"
                        onPress={() =>
                            void adapter.update('pages', item.id, {
                                status: 'published',
                                published_at: '2026-10-15T13:30:00Z',
                            })
                        }
                    >
                        Simulate another editor
                    </Button>
                }
            />
        </PanneauProvider>
    );
}

const meta = {
    title: 'Forms/Resource form',
    component: ResourceForm,
    parameters: { layout: 'padded' },
} satisfies Meta<typeof ResourceForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ValidationErrors: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const french = await canvas.findByRole('textbox', { name: /Français|French/ });
        await userEvent.clear(french);
        await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
        const summary = await canvas.findByRole('alert');
        await expect(summary).toHaveTextContent('Titre (fr): This field is required.');
        await waitFor(() => expect(french).toHaveFocus());
        await expect(french).toHaveAttribute('aria-invalid', 'true');
    },
};

export const VersionConflict: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const english = await canvas.findByRole('textbox', { name: /Anglais|English/ });
        await userEvent.type(english, ' and our team');
        await userEvent.click(canvas.getByRole('button', { name: 'Simulate another editor' }));
        await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
        const dialog = await within(canvasElement.ownerDocument.body).findByRole('alertdialog', {
            name: 'Someone else saved this item',
        });
        // The status changed to published (labelled in French in the example definition).
        await expect(dialog).toHaveTextContent('Publiée');
    },
};
