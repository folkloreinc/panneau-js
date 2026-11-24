import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import type { FieldEntryProps } from '@panneau/fields';
import type { Field } from '@panneau/protocol';

import { Form } from './Form';
import { renderForm } from './__fixtures__/render';

/** Renders of each `counted` field since the last `takeRenders()`, by path. */
const renders = new Map<string, number>();

/** Renders counted since the last call, by path. */
function takeRenders(): Record<string, number> {
    const counts = Object.fromEntries(renders);
    renders.clear();
    return counts;
}

/** A text input that counts its renders. */
function Counted({ path, value, onChange, onBlur, errors = [], field }: FieldEntryProps) {
    renders.set(path, (renders.get(path) ?? 0) + 1);
    return (
        <>
            <input
                aria-label={field.label ?? path}
                value={typeof value === 'string' ? value : ''}
                onChange={(event) => onChange(event.target.value)}
                onBlur={onBlur}
            />
            {errors.map((error) => (
                <span key={error}>{error}</span>
            ))}
        </>
    );
}

const FIELDS: Field[] = [
    { name: 'title', type: 'counted', label: 'Title' },
    { name: 'summary', type: 'counted', label: 'Summary' },
    {
        name: 'blocks',
        type: 'repeater',
        label: 'Blocks',
        settings: { collapsible: false },
        types: [
            {
                id: 'text',
                label: 'Text',
                fields: [
                    {
                        name: 'heading',
                        type: 'counted',
                        label: 'Heading',
                        rules: [{ rule: 'max', value: 4 }],
                    },
                    { name: 'body', type: 'counted', label: 'Body' },
                ],
            },
        ],
    },
];

const VALUES = {
    title: 'Title',
    summary: '',
    blocks: [
        { type: 'text', heading: 'One', body: 'First' },
        { type: 'text', heading: 'Two', body: 'Second' },
        { type: 'text', heading: 'Three', body: 'Third' },
    ],
};

async function renderCountedForm() {
    renderForm(<Form fields={FIELDS} values={VALUES} components={{ counted: Counted }} />);
    // Once the repeater of the blocks has loaded
    await screen.findAllByRole('textbox', { name: 'Body', hidden: true });
    takeRenders();
}

// A field renders again when its value, its errors or the object it belongs to (`parentValue`,
// which slugs and regions read) change: the fields of other blocks don't.
describe('Form renders on a keystroke', () => {
    beforeEach(() => {
        renders.clear();
    });

    it('renders the field and the fields of its object only', async () => {
        await renderCountedForm();
        // The first keystroke also makes the form dirty
        await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), 'abc');
        expect(takeRenders()).toEqual({ title: 3, summary: 3 });
    });

    it('renders the field of a block and the fields of its block only', async () => {
        await renderCountedForm();
        const [, second] = screen.getAllByRole('textbox', { name: 'Body' });
        await userEvent.type(second as HTMLElement, 'abc');
        expect(takeRenders()).toEqual({
            'blocks.1.body': 3,
            'blocks.1.heading': 3,
            // The form's values are the object of the fields at the top
            title: 3,
            summary: 3,
        });
    });

    it("doesn't render a field in error when another one changes", async () => {
        await renderCountedForm();
        // `Three` is too long: its error shows once the field loses focus
        const [, , third] = screen.getAllByRole('textbox', { name: 'Heading' });
        await userEvent.click(third as HTMLElement);
        await userEvent.tab();
        expect(screen.getByText('At most 4 characters.')).toBeInTheDocument();
        takeRenders();
        const [, second] = screen.getAllByRole('textbox', { name: 'Body' });
        await userEvent.type(second as HTMLElement, 'abc');
        expect(takeRenders()).toEqual({
            'blocks.1.body': 3,
            'blocks.1.heading': 3,
            title: 3,
            summary: 3,
        });
    });
});
