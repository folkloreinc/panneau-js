import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Field } from '@panneau/protocol';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { RepeaterField, type RepeaterItem } from './RepeaterField';

const LINK_FIELDS: Field[] = [
    { name: 'label', type: 'text', label: 'Label' },
    { name: 'url', type: 'url', label: 'URL', default: 'https://' },
];

function Links({
    onChange,
    max,
}: {
    onChange: (value: RepeaterItem[] | null) => void;
    max?: number;
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
                />
            )}
        </Controlled>
    );
}

describe('RepeaterField', () => {
    it('renders each item with its fields at their paths', () => {
        renderField(<Links onChange={() => undefined} />);
        const items = screen.getAllByRole('listitem');
        expect(items).toHaveLength(2);
        expect(
            within(items[1] as HTMLElement).getByRole('textbox', { name: 'Label' }),
        ).toHaveAttribute('name', 'links.1.label');
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

    it('has no tools when read-only', () => {
        renderField(
            <RepeaterField label="Links" fields={LINK_FIELDS} value={[{ label: 'A' }]} readOnly />,
        );
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
});
