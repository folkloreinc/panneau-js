import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Field } from '@panneau/protocol';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { RepeaterField, type RepeaterItem, getItemExcerpt } from './RepeaterField';

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

/** The buttons that expand and collapse the items, in order. */
function toggles(): HTMLElement[] {
    return screen.getAllByRole('button').filter((button) => button.hasAttribute('aria-expanded'));
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
        expect(screen.getByRole('listitem', { name: /Quote/ })).toBeInTheDocument();
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

    it('shows the items of a disabled list, which can’t expand', () => {
        renderField(
            <RepeaterField label="Links" fields={LINK_FIELDS} value={[{ label: 'A' }]} disabled />,
        );
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Label' })).toBeDisabled();
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
