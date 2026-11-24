import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Quote } from 'lucide-react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { Field } from '@panneau/protocol';
import { PanneauRoot } from '@panneau/ui';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { builtInFields } from '../shared/builtIn';
import { FieldsProvider } from '../shared/context';
import type { FieldEntryProps } from '../shared/types';
import {
    RepeaterField,
    type RepeaterItem,
    getItemExcerpt,
    getItemTitle,
    initialItemKeys,
    updateItemKeys,
} from './RepeaterField';

const LINK_FIELDS: Field[] = [
    { name: 'label', type: 'text', label: 'Label' },
    { name: 'url', type: 'url', label: 'URL', default: 'https://' },
];

function Links({
    onChange,
    max,
    invalidPaths,
    collapsible,
}: {
    onChange: (value: RepeaterItem[] | null) => void;
    max?: number;
    invalidPaths?: string[];
    collapsible?: boolean;
}) {
    return (
        <Controlled<RepeaterItem[] | null>
            initial={[{ label: 'A' }, { label: 'B' }]}
            onChange={onChange}
        >
            {(value, setValue) => (
                <RepeaterField
                    label="Links"
                    name="links"
                    fields={LINK_FIELDS}
                    value={value}
                    onChange={setValue}
                    {...(max !== undefined ? { max } : {})}
                    {...(invalidPaths !== undefined ? { invalidPaths } : {})}
                    {...(collapsible !== undefined ? { collapsible } : {})}
                />
            )}
        </Controlled>
    );
}

/** A field with a state of its own, which isn't its value, as an editor keeps its history. */
function Counter({ field }: FieldEntryProps) {
    const [count, setCount] = useState(0);
    return (
        <button type="button" onClick={() => setCount(count + 1)}>
            {`${field.label ?? ''} ${count}`}
        </button>
    );
}

/** The buttons that expand and collapse the items, in order: not the menus of their tools. */
function toggles(): HTMLElement[] {
    return screen
        .getAllByRole('button')
        .filter(
            (button) =>
                button.hasAttribute('aria-expanded') && !button.hasAttribute('aria-haspopup'),
        );
}

describe('RepeaterField', () => {
    it('renders each item with its fields at their paths', () => {
        renderField(<Links onChange={() => undefined} />);
        const items = screen.getAllByRole('listitem');
        expect(items).toHaveLength(2);
        expect(
            within(items[1] as HTMLElement).getByRole('textbox', { name: 'Label', hidden: true }),
        ).toHaveAttribute('name', 'links.1.label');
    });

    it('starts with the items it has collapsed, under their title and first text', () => {
        renderField(<Links onChange={() => undefined} />);
        const [first, second] = toggles();
        expect(first).toHaveAccessibleName('1 Item 1 A');
        expect(first).toHaveAttribute('aria-expanded', 'false');
        expect(second).toHaveAttribute('aria-expanded', 'false');
        const body = document.getElementById(first?.getAttribute('aria-controls') ?? '');
        expect(body).not.toBeVisible();
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('expands and collapses an item from its header, with the keyboard', async () => {
        renderField(<Links onChange={() => undefined} />);
        const [first] = toggles();
        first?.focus();
        await userEvent.keyboard('{Enter}');
        expect(first).toHaveAttribute('aria-expanded', 'true');
        expect(first).toHaveFocus();
        expect(screen.getByRole('textbox', { name: 'Label' })).toHaveValue('A');
        await userEvent.keyboard(' ');
        expect(first).toHaveAttribute('aria-expanded', 'false');
    });

    it('expands an item that is added, and keeps the state of each item as they move', async () => {
        renderField(<Links onChange={() => undefined} />);
        await userEvent.click(screen.getByRole('button', { name: 'Add' }));
        expect(toggles().map((toggle) => toggle.getAttribute('aria-expanded'))).toEqual([
            'false',
            'false',
            'true',
        ]);
        await userEvent.click(screen.getByRole('button', { name: 'Move item 3 up' }));
        expect(toggles().map((toggle) => toggle.getAttribute('aria-expanded'))).toEqual([
            'false',
            'true',
            'false',
        ]);
        await userEvent.click(screen.getByRole('button', { name: 'Remove item 1' }));
        expect(toggles().map((toggle) => toggle.getAttribute('aria-expanded'))).toEqual([
            'true',
            'false',
        ]);
    });

    it('expands and collapses every item at once', async () => {
        renderField(<Links onChange={() => undefined} />);
        await userEvent.click(screen.getByRole('button', { name: 'Expand all' }));
        expect(toggles().every((toggle) => toggle.getAttribute('aria-expanded') === 'true')).toBe(
            true,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Collapse all' }));
        expect(toggles().every((toggle) => toggle.getAttribute('aria-expanded') === 'false')).toBe(
            true,
        );
    });

    it('expands an item that has an error, and says so in its header', () => {
        renderField(<Links onChange={() => undefined} invalidPaths={['links.1.url']} />);
        const [first, second] = toggles();
        expect(first).toHaveAttribute('aria-expanded', 'false');
        expect(second).toHaveAttribute('aria-expanded', 'true');
        expect(second).toHaveAccessibleName('2 Item 2 Has errors');
    });

    it('expands an item again when it gets a new error', async () => {
        const { rerender } = renderField(
            <RepeaterField
                label="Links"
                name="links"
                fields={LINK_FIELDS}
                value={[{ label: 'A' }]}
            />,
        );
        expect(toggles()[0]).toHaveAttribute('aria-expanded', 'false');
        rerender(
            <RepeaterField
                label="Links"
                name="links"
                fields={LINK_FIELDS}
                value={[{ label: 'A' }]}
                invalidPaths={['links.0.label']}
            />,
        );
        expect(toggles()[0]).toHaveAttribute('aria-expanded', 'true');
        // Collapsed by hand, it stays collapsed while it keeps the same error.
        await userEvent.click(toggles()[0] as HTMLElement);
        rerender(
            <RepeaterField
                label="Links"
                name="links"
                fields={LINK_FIELDS}
                value={[{ label: 'A ' }]}
                invalidPaths={['links.0.label']}
            />,
        );
        expect(toggles()[0]).toHaveAttribute('aria-expanded', 'false');
    });

    it('shows every item without collapsing with `collapsible` false', () => {
        renderField(<Links onChange={() => undefined} collapsible={false} />);
        expect(toggles()).toHaveLength(0);
        expect(screen.getAllByRole('textbox', { name: 'Label' })).toHaveLength(2);
    });

    it('adds an item with the defaults of its fields', async () => {
        const onChange = vi.fn();
        renderField(<Links onChange={onChange} />);
        await userEvent.click(screen.getByRole('button', { name: 'Add' }));
        expect(onChange).toHaveBeenLastCalledWith([
            { label: 'A' },
            { label: 'B' },
            { url: 'https://' },
        ]);
    });

    it('moves and removes items', async () => {
        const onChange = vi.fn();
        renderField(<Links onChange={onChange} />);
        expect(screen.getByRole('button', { name: 'Move item 1 up' })).toBeDisabled();
        await userEvent.click(screen.getByRole('button', { name: 'Move item 1 down' }));
        expect(onChange).toHaveBeenLastCalledWith([{ label: 'B' }, { label: 'A' }]);
        await userEvent.click(screen.getByRole('button', { name: 'Remove item 2' }));
        await userEvent.click(screen.getByRole('button', { name: 'Remove item 1' }));
        expect(onChange).toHaveBeenLastCalledWith(null);
        expect(screen.getByText('No items yet.')).toBeInTheDocument();
    });

    it('stops adding at max', () => {
        renderField(<Links onChange={() => undefined} max={2} />);
        expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
    });

    it('adds typed blocks from a menu, with the fields of their type', async () => {
        const onChange = vi.fn();
        renderField(
            <Controlled<unknown> initial={[{ type: 'quote', text: 'Hi' }]} onChange={onChange}>
                {(value, setValue) => (
                    <DefinitionField
                        field={{
                            name: 'blocks',
                            type: 'repeater',
                            label: 'Blocks',
                            rules: [{ rule: 'min', value: 1 }],
                            types: [
                                {
                                    id: 'quote',
                                    label: 'Quote',
                                    fields: [{ name: 'text', type: 'textarea', label: 'Text' }],
                                },
                                {
                                    id: 'video',
                                    label: 'Video',
                                    fields: [{ name: 'url', type: 'url', label: 'Video URL' }],
                                },
                            ],
                        }}
                        path="blocks"
                        value={value}
                        onChange={setValue}
                    />
                )}
            </Controlled>,
        );
        // The repeater of the definition loads with its first use
        expect(await screen.findByRole('listitem', { name: /Quote/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Remove item 1' })).toBeDisabled();
        await userEvent.click(screen.getByRole('button', { name: 'Add' }));
        await userEvent.click(await screen.findByRole('menuitem', { name: 'Video' }));
        expect(onChange).toHaveBeenLastCalledWith([
            { type: 'quote', text: 'Hi' },
            { type: 'video' },
        ]);
        expect(screen.getByRole('textbox', { name: 'Video URL' })).toHaveAttribute(
            'name',
            'blocks.1.url',
        );
    });

    it('has no tools when read-only, and still expands its items', async () => {
        renderField(
            <RepeaterField label="Links" fields={LINK_FIELDS} value={[{ label: 'A' }]} readOnly />,
        );
        expect(screen.getAllByRole('button')).toEqual(toggles());
        await userEvent.click(toggles()[0] as HTMLElement);
        expect(screen.getByRole('textbox', { name: 'Label' })).toHaveAttribute('readonly');
    });

    it('puts a removed item back at its place, with its value and its state, from “Undo”', async () => {
        const onChange = vi.fn();
        renderField(<Links onChange={onChange} />);
        await userEvent.click(toggles()[0] as HTMLElement);
        await userEvent.click(screen.getByRole('button', { name: 'Remove item 1' }));
        expect(onChange).toHaveBeenLastCalledWith([{ label: 'B' }]);
        expect(toggles()).toHaveLength(1);
        expect(screen.getByText('“Item 1” removed')).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
        expect(onChange).toHaveBeenLastCalledWith([{ label: 'A' }, { label: 'B' }]);
        const [first, second] = toggles();
        // Expanded as it was, with its value, and focused
        expect(screen.getByRole('textbox', { name: 'Label' })).toHaveValue('A');
        expect(first).toHaveAttribute('aria-expanded', 'true');
        expect(first).toHaveFocus();
        expect(second).toHaveAttribute('aria-expanded', 'false');
        expect(screen.getByText('“Item 1” put back')).toBeInTheDocument();
        expect(screen.queryByText('“Item 1” removed')).not.toBeInTheDocument();
    });

    it('puts an item back in the value it has when “Undo” is pressed', async () => {
        const onChange = vi.fn();
        renderField(<Links onChange={onChange} />);
        await userEvent.click(screen.getByRole('button', { name: 'Remove item 1' }));
        await userEvent.click(screen.getByRole('button', { name: 'Add' }));
        await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
        expect(onChange).toHaveBeenLastCalledWith([
            { label: 'A' },
            { label: 'B' },
            { url: 'https://' },
        ]);
    });

    it('keeps the state of the fields of an item, and the focus, as it moves', async () => {
        renderField(
            <Controlled<RepeaterItem[] | null> initial={[{ label: 'A' }, { label: 'B' }]}>
                {(value, setValue) => (
                    <RepeaterField
                        label="Notes"
                        name="notes"
                        fields={[{ name: 'count', type: 'counter', label: 'Count' }]}
                        itemTitle={(item) => (typeof item.label === 'string' ? item.label : null)}
                        collapsible={false}
                        value={value}
                        onChange={setValue}
                    />
                )}
            </Controlled>,
            { components: { ...builtInFields, counter: Counter } },
        );
        const [first] = screen.getAllByRole('listitem');
        await userEvent.click(
            within(first as HTMLElement).getByRole('button', { name: 'Count 0' }),
        );
        await userEvent.click(
            within(first as HTMLElement).getByRole('button', { name: 'Count 1' }),
        );

        await userEvent.click(screen.getByRole('button', { name: 'Move item 1 down' }));
        const [top, bottom] = screen.getAllByRole('listitem');
        expect(top).toHaveAccessibleName('1 B');
        expect(within(top as HTMLElement).getByRole('button', { name: 'Count 0' })).toBeVisible();
        expect(bottom).toHaveAccessibleName('2 A');
        expect(
            within(bottom as HTMLElement).getByRole('button', { name: 'Count 2' }),
        ).toBeVisible();
        // On the other button of the item, since it is now the last one
        expect(screen.getByRole('button', { name: 'Move item 2 up' })).toHaveFocus();

        await userEvent.keyboard('{Enter}');
        expect(screen.getAllByRole('listitem')[0]).toHaveAccessibleName('1 A');
        expect(screen.getByRole('button', { name: 'Move item 1 down' })).toHaveFocus();
    });

    it('closes its “Undo” toast when the list unmounts', async () => {
        const onChange = vi.fn();
        const { rerender } = renderField(<Links onChange={onChange} />);
        await userEvent.click(screen.getByRole('button', { name: 'Remove item 1' }));
        expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();

        rerender(
            <PanneauRoot>
                <p>Another page</p>
            </PanneauRoot>,
        );
        expect(screen.queryByText('“Item 1” removed')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument();
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('removes an item at once outside a PanneauRoot, without a toast', async () => {
        const onChange = vi.fn();
        render(<Links onChange={onChange} />);
        await userEvent.click(screen.getByRole('button', { name: 'Remove item 1' }));
        expect(onChange).toHaveBeenLastCalledWith([{ label: 'B' }]);
        expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument();
    });

    it('shows the items of a disabled list, which can’t expand', () => {
        renderField(
            <RepeaterField label="Links" fields={LINK_FIELDS} value={[{ label: 'A' }]} disabled />,
        );
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Label' })).toBeDisabled();
    });
});

/** Picks an item up by its handle with the keyboard, and drops it at the place named `place`. */
async function dragWithKeyboard(handle: string, place: string) {
    act(() => screen.getByRole('button', { name: handle }).focus());
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(document.activeElement).toHaveAttribute('data-reorder-gap'));
    act(() => screen.getByRole('button', { name: place }).focus());
    await userEvent.keyboard('{Enter}');
}

const items = () =>
    screen.getAllByRole('listitem').map((item) => item.getAttribute('aria-labelledby'));

describe('RepeaterField: drag and drop', () => {
    it('has a handle at the start of the header of each item, named after it', () => {
        renderField(<Links onChange={() => undefined} />);
        const [first] = screen.getAllByRole('listitem');
        const header = (first as HTMLElement).querySelector('[data-header]');
        expect(header?.firstElementChild).toBe(screen.getByRole('button', { name: 'Move Item 1' }));
        expect(header).toHaveAttribute('data-reorder-preview');
        // The buttons that move an item stay in its tools
        expect(screen.getByRole('button', { name: 'Move item 1 down' })).toBeInTheDocument();
    });

    it('moves an item with the keyboard, with its value, its state and the focus', async () => {
        const onChange = vi.fn();
        renderField(
            <Controlled<RepeaterItem[] | null>
                initial={[{ label: 'A' }, { label: 'B' }, { label: 'C' }]}
                onChange={onChange}
            >
                {(value, setValue) => (
                    <RepeaterField
                        label="Notes"
                        name="notes"
                        fields={[{ name: 'count', type: 'counter', label: 'Count' }]}
                        itemTitle={(item) => (typeof item.label === 'string' ? item.label : null)}
                        value={value}
                        onChange={setValue}
                    />
                )}
            </Controlled>,
            { components: { ...builtInFields, counter: Counter } },
        );
        await userEvent.click(toggles()[0] as HTMLElement);
        await userEvent.click(screen.getByRole('button', { name: 'Count 0' }));
        const before = items();

        await dragWithKeyboard('Move A (item 1)', 'After C (item 3)');
        expect(onChange).toHaveBeenLastCalledWith([{ label: 'B' }, { label: 'C' }, { label: 'A' }]);
        // The item and its state moved: its key, its expanded fields, the state of its field
        expect(items()).toEqual([before[1], before[2], before[0]]);
        const [, , last] = toggles();
        expect(last).toHaveAccessibleName('3 A');
        expect(last).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('button', { name: 'Count 1' })).toBeVisible();
        await waitFor(() =>
            expect(screen.getByRole('button', { name: 'Move A (item 3)' })).toHaveFocus(),
        );
        expect(screen.getByRole('status')).toHaveTextContent('A (item 1) moved to position 3 of 3');
    });

    it('keeps an item with an error collapsed by hand when it moves', async () => {
        const a = { label: 'A' };
        const b = { label: '' };
        const props = { label: 'Links', name: 'links', fields: LINK_FIELDS };
        const { rerender } = renderField(
            <RepeaterField {...props} value={[a, b]} invalidPaths={['links.1.label']} />,
        );
        await userEvent.click(toggles()[1] as HTMLElement);
        expect(toggles()[1]).toHaveAttribute('aria-expanded', 'false');
        // The form gives the error at the new path of the item
        rerender(
            <PanneauRoot>
                <FieldsProvider components={builtInFields}>
                    <RepeaterField {...props} value={[b, a]} invalidPaths={['links.0.label']} />
                </FieldsProvider>
            </PanneauRoot>,
        );
        const [first] = toggles();
        expect(first).toHaveAccessibleName('1 Item 1 Has errors');
        expect(first).toHaveAttribute('aria-expanded', 'false');
    });

    it('puts a removed item back before the item that followed it, after a move', async () => {
        const onChange = vi.fn();
        renderField(
            <Controlled<RepeaterItem[] | null>
                initial={[{ label: 'A' }, { label: 'B' }, { label: 'C' }]}
                onChange={onChange}
            >
                {(value, setValue) => (
                    <RepeaterField
                        label="Links"
                        name="links"
                        fields={LINK_FIELDS}
                        itemTitle={(item) => (typeof item.label === 'string' ? item.label : null)}
                        value={value}
                        onChange={setValue}
                    />
                )}
            </Controlled>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Remove item 1' }));
        await dragWithKeyboard('Move C (item 2)', 'Before B (item 1)');
        expect(onChange).toHaveBeenLastCalledWith([{ label: 'C' }, { label: 'B' }]);
        await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
        expect(onChange).toHaveBeenLastCalledWith([{ label: 'C' }, { label: 'A' }, { label: 'B' }]);
    });

    it('has no handle when read-only or disabled', () => {
        const { rerender } = renderField(
            <RepeaterField label="Links" fields={LINK_FIELDS} value={[{}, {}]} readOnly />,
        );
        expect(screen.queryByRole('button', { name: /^Move Item/ })).not.toBeInTheDocument();
        rerender(
            <PanneauRoot>
                <FieldsProvider components={builtInFields}>
                    <RepeaterField label="Links" fields={LINK_FIELDS} value={[{}, {}]} disabled />
                </FieldsProvider>
            </PanneauRoot>,
        );
        expect(document.querySelector('[data-reorder-handle]')).toBeNull();
    });
});

describe('RepeaterField: duplicate and add in between', () => {
    it('duplicates an item right after it, expanded, with the focus on its header', async () => {
        const onChange = vi.fn();
        renderField(<Links onChange={onChange} />);
        await userEvent.click(screen.getByRole('button', { name: 'Duplicate item 1' }));
        expect(onChange).toHaveBeenLastCalledWith([{ label: 'A' }, { label: 'A' }, { label: 'B' }]);
        const [first, copy] = onChange.mock.lastCall?.[0] as RepeaterItem[];
        // A copy, not the same object: editing it leaves the original alone
        expect(copy).not.toBe(first);
        const [, second] = toggles();
        expect(second).toHaveAttribute('aria-expanded', 'true');
        expect(second).toHaveFocus();
        expect(toggles()[0]).toHaveAttribute('aria-expanded', 'false');

        await userEvent.clear(screen.getByRole('textbox', { name: 'Label' }));
        await userEvent.type(screen.getByRole('textbox', { name: 'Label' }), 'C');
        expect(onChange).toHaveBeenLastCalledWith([{ label: 'A' }, { label: 'C' }, { label: 'B' }]);
    });

    it('copies the nested values of an item, which the copy doesn’t share', async () => {
        const onChange = vi.fn();
        const tags = ['a', 'b'];
        renderField(
            <Controlled<RepeaterItem[] | null> initial={[{ tags }]} onChange={onChange}>
                {(value, setValue) => (
                    <RepeaterField
                        label="Lists"
                        fields={[{ name: 'tags', type: 'json' }]}
                        value={value}
                        onChange={setValue}
                    />
                )}
            </Controlled>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Duplicate item 1' }));
        const [, copy] = onChange.mock.lastCall?.[0] as RepeaterItem[];
        expect(copy?.tags).toEqual(['a', 'b']);
        expect(copy?.tags).not.toBe(tags);
    });

    it('doesn’t duplicate or add in between at max', () => {
        renderField(<Links onChange={() => undefined} max={2} />);
        expect(screen.getByRole('button', { name: 'Duplicate item 1' })).toBeDisabled();
        expect(
            screen.queryByRole('button', { name: 'Add an item between items 1 and 2' }),
        ).not.toBeInTheDocument();
    });

    it('adds an item between two others, expanded, with the focus on its header', async () => {
        const onChange = vi.fn();
        renderField(<Links onChange={onChange} />);
        // Between items only: the footer adds at the end
        expect(screen.getAllByRole('button', { name: /^Add an item between/ })).toHaveLength(1);
        await userEvent.click(
            screen.getByRole('button', { name: 'Add an item between items 1 and 2' }),
        );
        expect(onChange).toHaveBeenLastCalledWith([
            { label: 'A' },
            { url: 'https://' },
            { label: 'B' },
        ]);
        const [, added] = toggles();
        expect(added).toHaveAttribute('aria-expanded', 'true');
        expect(added).toHaveFocus();
        expect(screen.getAllByRole('button', { name: /^Add an item between/ })).toHaveLength(2);
    });

    it('reaches the control between items with the keyboard', async () => {
        renderField(<Links onChange={() => undefined} />);
        // The last tool of the header: the menu of its tools, which the CSS shows when narrow
        screen.getByRole('button', { name: 'Actions for item 1' }).focus();
        await userEvent.tab();
        expect(
            screen.getByRole('button', { name: 'Add an item between items 1 and 2' }),
        ).toHaveFocus();
    });

    it('has no control between items when read-only', () => {
        renderField(
            <RepeaterField
                label="Links"
                fields={LINK_FIELDS}
                value={[{ label: 'A' }, { label: 'B' }]}
                readOnly
            />,
        );
        expect(screen.queryByRole('button', { name: /^Add an item/ })).not.toBeInTheDocument();
    });
});

const BLOCKS: Field = {
    name: 'blocks',
    type: 'repeater',
    label: 'Blocks',
    types: [
        {
            id: 'quote',
            label: 'Quote',
            icon: 'quote',
            description: 'A quote and its author',
            itemTitle: '{author}',
            fields: [
                { name: 'text', type: 'textarea', label: 'Text' },
                { name: 'author', type: 'text', label: 'Author' },
            ],
        },
        {
            id: 'video',
            label: 'Video',
            fields: [{ name: 'url', type: 'url', label: 'Video URL' }],
        },
    ],
};

const iconLoader = (name: string) => Promise.resolve(name === 'quote' ? Quote : null);

function Blocks({
    field = BLOCKS,
    initial,
    onChange,
}: {
    field?: Field;
    initial: unknown;
    onChange?: (value: unknown) => void;
}) {
    return (
        <PanneauRoot iconLoader={iconLoader}>
            <FieldsProvider components={builtInFields}>
                <Controlled<unknown> initial={initial} {...(onChange ? { onChange } : {})}>
                    {(value, setValue) => (
                        <DefinitionField
                            field={field}
                            path="blocks"
                            value={value}
                            onChange={setValue}
                        />
                    )}
                </Controlled>
            </FieldsProvider>
        </PanneauRoot>
    );
}

describe('RepeaterField: block types', () => {
    it('shows the icon and the description of each type in the menu', async () => {
        render(<Blocks initial={null} />);
        await userEvent.click(await screen.findByRole('button', { name: 'Add' }));
        const quote = await screen.findByRole('menuitem', { name: 'Quote' });
        expect(quote).toHaveAccessibleDescription('A quote and its author');
        await waitFor(() => {
            expect(quote.querySelector('svg.lucide-quote')).not.toBeNull();
        });
        // A type without an icon keeps its place, so that labels align
        const video = screen.getByRole('menuitem', { name: 'Video' });
        expect(video.querySelector('svg')).toBeNull();
        expect(video.firstElementChild?.firstElementChild).toBeEmptyDOMElement();
    });

    it('adds a block of a type between two others', async () => {
        const onChange = vi.fn();
        render(
            <Blocks
                initial={[
                    { type: 'video', url: 'https://a' },
                    { type: 'video', url: 'https://b' },
                ]}
                onChange={onChange}
            />,
        );
        await userEvent.click(
            await screen.findByRole('button', { name: 'Add an item between items 1 and 2' }),
        );
        await userEvent.click(await screen.findByRole('menuitem', { name: 'Quote' }));
        expect(onChange).toHaveBeenLastCalledWith([
            { type: 'video', url: 'https://a' },
            { type: 'quote' },
            { type: 'video', url: 'https://b' },
        ]);
        expect(screen.getByRole('textbox', { name: 'Author' })).toHaveAttribute(
            'name',
            'blocks.1.author',
        );
        expect(screen.getByRole('button', { name: '2 Quote', expanded: true })).toHaveFocus();
    });

    it('titles a block from the `itemTitle` of its type, or its label and first text', async () => {
        render(
            <Blocks
                initial={[
                    { type: 'quote', text: 'To be', author: 'Hamlet' },
                    { type: 'quote', text: 'Or not' },
                    { type: 'video', url: 'https://a' },
                ]}
            />,
        );
        const [hamlet, unsigned, video] = await screen.findAllByRole('listitem');
        expect(hamlet).toHaveAccessibleName('1 Hamlet');
        expect(unsigned).toHaveAccessibleName('2 Quote Or not');
        expect(video).toHaveAccessibleName('3 Video https://a');
    });
});

describe('RepeaterField: titles from the definition', () => {
    it('titles items from the field that `settings.itemTitle` names', async () => {
        renderField(
            <DefinitionField
                field={{
                    name: 'people',
                    type: 'repeater',
                    settings: { itemTitle: '{first} {last} ({role})' },
                    fields: [
                        { name: 'first', type: 'text' },
                        { name: 'last', type: 'text' },
                        {
                            name: 'role',
                            type: 'select',
                            options: [{ value: 'dir', label: 'Director' }],
                        },
                        { name: 'bio', type: 'textarea' },
                    ],
                }}
                path="people"
                value={[
                    { first: 'Ada', last: 'Lovelace', role: 'dir' },
                    { first: 'Jane' },
                    { bio: 'Unnamed' },
                ]}
                onChange={() => undefined}
            />,
        );
        const [ada, jane, unnamed] = await screen.findAllByRole('listitem');
        expect(ada).toHaveAccessibleName('1 Ada Lovelace (Director)');
        expect(jane).toHaveAccessibleName('2 Jane');
        // Without a value for the title: "Item 3", and its first text
        expect(unnamed).toHaveAccessibleName('3 Item 3 Unnamed');
    });
});

describe('getItemTitle', () => {
    const fields: Field[] = [
        { name: 'title', type: 'text', localized: true },
        { name: 'body', type: 'richtext' },
        { name: 'year', type: 'number' },
    ];

    it('gives the value of a field name, or fills a template', () => {
        expect(getItemTitle({ title: 'Summer' }, 'title', fields)).toBe('Summer');
        expect(getItemTitle({ title: 'Summer', year: 2026 }, '{title}, {year}', fields)).toBe(
            'Summer, 2026',
        );
        expect(getItemTitle({ body: '<p>Jazz &amp; <b>fire</b></p>' }, 'body', fields)).toBe(
            'Jazz & fire',
        );
    });

    it('gives the locale of the interface of a localized value, its language, or the first one', () => {
        const item = { title: { fr: 'Été', en: 'Summer' } };
        expect(getItemTitle(item, 'title', fields, 'fr')).toBe('Été');
        expect(getItemTitle(item, 'title', fields, 'en-CA')).toBe('Summer');
        expect(getItemTitle({ title: { fr: '', en: 'Summer' } }, 'title', fields, 'fr')).toBe(
            'Summer',
        );
    });

    it('gives null without any value, and drops the brackets of a missing one', () => {
        expect(getItemTitle({}, '{title} ({year})', fields)).toBeNull();
        expect(getItemTitle({ title: 'Summer' }, '{title} ({year})', fields)).toBe('Summer');
        expect(getItemTitle({ year: [2026] }, 'year', fields)).toBeNull();
    });
});

describe('getItemExcerpt', () => {
    it('gives the first text of an item, without the tags of a rich text', () => {
        const fields: Field[] = [
            { name: 'image', type: 'file' },
            { name: 'title', type: 'text' },
            { name: 'body', type: 'richtext' },
        ];
        expect(
            getItemExcerpt({ title: '', body: '<p>Jazz &amp; <b>fireworks</b></p>' }, fields),
        ).toBe('Jazz & fireworks');
        expect(getItemExcerpt({ title: 'Summer', body: '<p>Jazz</p>' }, fields)).toBe('Summer');
        expect(getItemExcerpt({ image: 'a.jpg' }, fields)).toBeNull();
    });

    it('gives the first locale that has a text, and cuts a long text', () => {
        const fields: Field[] = [{ name: 'title', type: 'text', localized: true }];
        expect(getItemExcerpt({ title: { fr: '', en: 'Summer' } }, fields)).toBe('Summer');
        expect(getItemExcerpt({ title: 'a'.repeat(200) }, fields)).toBe(`${'a'.repeat(140)}…`);
    });
});

describe('updateItemKeys', () => {
    const a = { label: 'A' };
    const b = { label: 'B' };
    const c = { label: 'C' };

    it('keeps the key of an item that moved, or that changed in place', () => {
        const keys = initialItemKeys([a, b, c]);
        expect(updateItemKeys(keys, [a, b, c])).toBe(keys);
        expect(updateItemKeys(keys, [c, a, b]).keys).toEqual([2, 0, 1]);
        expect(updateItemKeys(keys, [a, { label: 'B2' }, c]).keys).toEqual([0, 1, 2]);
    });

    it('gives new keys to new items, and never reuses one', () => {
        const keys = updateItemKeys(initialItemKeys([a, b]), [b]);
        expect(keys.keys).toEqual([1]);
        const added = updateItemKeys(keys, [b, c, { label: 'D' }]);
        expect(added.keys).toEqual([1, 2, 3]);
        expect(added.next).toBe(4);
    });
});
