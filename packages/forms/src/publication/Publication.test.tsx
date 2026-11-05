import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { PanneauProvider, definePlugin } from '@panneau/core';
import type { Field, LayoutNode } from '@panneau/protocol';

import { Form } from '../Form';
import { renderForm } from '../__fixtures__/render';
import { publicationPlugin } from './Publication';

const FIELDS: Field[] = [
    { name: 'title', type: 'text', label: 'Title' },
    { name: 'published', type: 'boolean', label: 'Published' },
    { name: 'published_at', type: 'datetime', label: 'Publication date' },
];

const LAYOUT: LayoutNode[] = [
    { type: 'field', name: 'title' },
    {
        type: 'component',
        component: 'publication',
        children: [
            { type: 'field', name: 'published' },
            { type: 'field', name: 'published_at' },
        ],
    },
];

function renderPublication(values: Record<string, unknown>, fields = FIELDS) {
    return renderForm(
        <PanneauProvider plugins={[definePlugin(publicationPlugin)]}>
            <Form fields={fields} layout={LAYOUT} values={values} />
        </PanneauProvider>,
    );
}

describe('Publication', () => {
    it('frames its fields under the state of the publication', async () => {
        renderPublication({ published: false });
        const section = screen.getByRole('region', { name: /Publication/ });
        expect(section).toHaveTextContent('Not published');
        await userEvent.click(screen.getByRole('checkbox', { name: 'Published' }));
        expect(section).toHaveTextContent('Published');
    });

    it('says when an item is published, or will be', () => {
        const { unmount } = renderPublication({
            published: true,
            published_at: '2020-03-01T12:00:00Z',
        });
        expect(screen.getByRole('region', { name: /Publication/ }).textContent).toMatch(
            /Published on Mar 1, 2020/,
        );
        unmount();
        renderPublication({ published: true, published_at: '2999-03-01T12:00:00Z' });
        expect(screen.getByRole('region', { name: /Publication/ }).textContent).toMatch(
            /Scheduled.*Will be published on Mar 1, 2999/,
        );
    });

    it('takes the label and the tone of the status', () => {
        renderForm(
            <PanneauProvider plugins={[definePlugin(publicationPlugin)]}>
                <Form
                    fields={[
                        ...FIELDS,
                        {
                            name: 'status',
                            type: 'select',
                            label: 'Status',
                            options: [{ value: 'review', label: 'In review', tone: 'warning' }],
                        },
                    ]}
                    layout={[
                        {
                            type: 'component',
                            component: 'publication',
                            children: [{ type: 'field', name: 'status' }],
                        },
                    ]}
                    values={{ status: 'review' }}
                />
            </PanneauProvider>,
        );
        expect(screen.getByRole('heading', { name: /Publication/ })).toHaveTextContent('In review');
    });
});
