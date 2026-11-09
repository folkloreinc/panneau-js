import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PanneauProvider, definePlugin, selectValue } from '@panneau/core';
import type { Field, LayoutNode } from '@panneau/protocol';

import { Form } from '../Form';
import { renderForm } from '../__fixtures__/render';
import { useFormState } from '../context';
import type { FormPanelProps } from './panels';

const FIELDS: Field[] = [
    { name: 'title', type: 'text', label: 'Title', rules: [{ rule: 'required' }] },
    { name: 'notes', type: 'textarea', label: 'Notes' },
];

function sidebar() {
    return screen.getByRole('region', { name: 'Sidebar' });
}

function WordCount({ form, children, unit }: FormPanelProps & { unit: string }) {
    const title = selectValue(useFormState(form), 'title');
    return (
        <>
            <p>{`${String(typeof title === 'string' ? title.split(' ').length : 0)} ${unit}`}</p>
            {children}
        </>
    );
}

describe('Panels of the sidebar', () => {
    it('renders the panel of a plugin, with its props, its node and its children', () => {
        const layout: LayoutNode[] = [
            { type: 'field', name: 'title' },
            {
                type: 'sidebar',
                panel: 'words',
                label: 'Words',
                props: { unit: 'words' },
                children: [{ type: 'field', name: 'notes' }],
            },
        ];
        renderForm(
            <PanneauProvider
                plugins={[definePlugin({ id: 'words', panels: { words: WordCount } })]}
            >
                <Form fields={FIELDS} layout={layout} values={{ title: 'Hello the world' }} />
            </PanneauProvider>,
        );
        expect(within(sidebar()).getByRole('button', { name: 'Words' })).toBeInTheDocument();
        expect(within(sidebar()).getByText('3 words')).toBeInTheDocument();
        expect(within(sidebar()).getByRole('textbox', { name: 'Notes' })).toBeInTheDocument();
    });

    it('renders the children of a panel that no component provides', () => {
        const layout: LayoutNode[] = [
            { type: 'field', name: 'title' },
            { type: 'sidebar', panel: 'unknown', children: [{ type: 'field', name: 'notes' }] },
        ];
        renderForm(<Form fields={FIELDS} layout={layout} />);
        expect(within(sidebar()).getByRole('textbox', { name: 'Notes' })).toBeInTheDocument();
    });

    it('takes panels from Form over those of plugins and the built-in ones', () => {
        const layout: LayoutNode[] = [{ type: 'sidebar', panel: 'save' }];
        renderForm(<Form fields={FIELDS} layout={layout} panels={{ save: () => <p>Mine</p> }} />);
        expect(within(sidebar()).getByText('Mine')).toBeInTheDocument();
        expect(within(sidebar()).queryByRole('button', { name: 'Save' })).toBeNull();
    });

    it('has the state of the form and its Save button in the save panel', async () => {
        const onSubmit = vi.fn(() => Promise.resolve({}));
        const layout: LayoutNode[] = [
            { type: 'field', name: 'title' },
            { type: 'sidebar', panel: 'save' },
        ];
        renderForm(<Form fields={FIELDS} layout={layout} onSubmit={onSubmit} />);
        const panel = sidebar();
        await userEvent.type(screen.getByRole('textbox', { name: /Title/ }), 'Hello');
        expect(within(panel).getByRole('status')).toHaveTextContent('Unsaved changes');
        await userEvent.click(within(panel).getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(within(panel).getByRole('status')).toHaveTextContent('Saved'));
    });

    it('lists the errors in the errors panel after a failed save, and nothing before', async () => {
        const layout: LayoutNode[] = [
            { type: 'field', name: 'title' },
            { type: 'sidebar', panel: 'errors' },
        ];
        renderForm(<Form fields={FIELDS} layout={layout} />);
        expect(within(sidebar()).queryByRole('alert')).toBeNull();
        // The footer's button: the errors panel has none
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        const alert = await within(sidebar()).findByRole('alert');
        await userEvent.click(within(alert).getByRole('button', { name: 'Title' }));
        await waitFor(() => expect(screen.getByRole('textbox', { name: /Title/ })).toHaveFocus());
    });
});
