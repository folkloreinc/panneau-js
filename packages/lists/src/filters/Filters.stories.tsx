import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { FieldsProvider, type RelationSource } from '@panneau/fields';
import type { FilterValue } from '@panneau/protocol';

import type { FilterControlProps, FilterEntry } from '../types';
import {
    DateFilter,
    DateRangeFilter,
    RelationFilter,
    SelectFilter,
    TextFilter,
    ToggleFilter,
} from './controls';

/** Renders a control with its value in a state, as a list keeps it, and reports each change. */
function renderControl(Control: FilterEntry) {
    return function Render(args: FilterControlProps) {
        const [value, setValue] = useState<unknown>(args.value);
        return (
            <Control
                {...args}
                value={value}
                onChange={(next: FilterValue | undefined) => {
                    setValue(next);
                    args.onChange(next);
                }}
            />
        );
    };
}

const authors = [
    { id: '7', label: 'Ada Lovelace' },
    { id: '8', label: 'Grace Hopper' },
];

/** A relation source without a backend: it finds the authors whose name has the text. */
const relationSource: RelationSource = {
    search: (_resource, query) =>
        Promise.resolve(
            authors.filter((author) => author.label.toLowerCase().includes(query.toLowerCase())),
        ),
    resolve: (_resource, ids) =>
        Promise.resolve(authors.filter((author) => ids.includes(author.id))),
};

const RelationControl = renderControl(RelationFilter);

/**
 * The controls of the filters of a list, by filter type. Each one reports a value, or `undefined`
 * to remove the filter.
 */
const meta = {
    title: 'Lists/Filters',
    component: TextFilter,
    parameters: { layout: 'padded' },
    args: {
        filter: { id: 'city', type: 'text', label: 'City' },
        label: 'City',
        options: [],
        value: undefined,
        onChange: fn(),
        onLabel: fn(),
        getValueLabel: () => null,
    },
} satisfies Meta<typeof TextFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Text: the filter changes once the user stops typing, and an empty text removes it. */
export const Text: Story = {
    render: renderControl(TextFilter),
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByRole('textbox', { name: 'City' });
        await userEvent.type(input, 'Montréal');
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith('Montréal'));
        // Once, for the whole text
        await expect(args.onChange).toHaveBeenCalledTimes(1);
        await userEvent.clear(input);
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(undefined));
    },
};

/** One choice among the options; "Any" removes the filter. */
export const SelectOne: Story = {
    name: 'Select',
    args: {
        filter: { id: 'status', type: 'select', label: 'Status' },
        label: 'Status',
        options: [
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
        ],
    },
    render: renderControl(SelectFilter),
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('button', { name: /Status/ }));
        await userEvent.click(await body.findByRole('option', { name: 'Published' }));
        await expect(args.onChange).toHaveBeenLastCalledWith('published');
        await expect(canvas.getByRole('button', { name: /Status/ })).toHaveTextContent('Published');
    },
};

/** Several choices, with `multiple`: the filter has every value picked. */
export const SelectMultiple: Story = {
    args: {
        filter: { id: 'status', type: 'select', label: 'Statuses', multiple: true },
        label: 'Statuses',
        options: [
            { value: 'draft', label: 'Draft' },
            { value: 'review', label: 'In review' },
            { value: 'published', label: 'Published' },
        ],
        // From the URL: strings, matched to the options
        value: ['draft'],
    },
    render: renderControl(SelectFilter),
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await expect(canvas.getByRole('button', { name: /Statuses/ })).toHaveTextContent('Draft');
        await userEvent.click(canvas.getByRole('button', { name: /Statuses/ }));
        await userEvent.click(await body.findByRole('option', { name: 'Published' }));
        await expect(args.onChange).toHaveBeenLastCalledWith(['draft', 'published']);
    },
};

/** On filters with `true`; off removes the filter. */
export const Toggle: Story = {
    args: {
        filter: { id: 'featured', type: 'toggle', label: 'Featured' },
        label: 'Featured',
    },
    render: renderControl(ToggleFilter),
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const toggle = canvas.getByRole('switch', { name: 'Featured' });
        await expect(toggle).not.toBeChecked();
        await userEvent.click(toggle);
        await expect(args.onChange).toHaveBeenLastCalledWith(true);
        await expect(toggle).toBeChecked();
        await userEvent.click(toggle);
        await expect(args.onChange).toHaveBeenLastCalledWith(undefined);
    },
};

/** A day, typed segment by segment. */
export const SingleDate: Story = {
    name: 'Date',
    args: {
        filter: { id: 'published_on', type: 'date', label: 'Published on' },
        label: 'Published on',
    },
    render: renderControl(DateFilter),
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const [month, day, year] = canvas.getAllByRole('spinbutton');
        await userEvent.click(month as HTMLElement);
        await userEvent.keyboard('10');
        await userEvent.click(day as HTMLElement);
        await userEvent.keyboard('15');
        await userEvent.click(year as HTMLElement);
        await userEvent.keyboard('2026');
        await expect(args.onChange).toHaveBeenLastCalledWith('2026-10-15');
    },
};

/** A range of days: either end can stay open, and is left out of the value. */
export const DateRange: Story = {
    args: {
        filter: { id: 'published_at', type: 'date-range', label: 'Published' },
        label: 'Published',
        value: { to: '2026-01-31' },
    },
    render: renderControl(DateRangeFilter),
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const range = canvas.getByRole('group', { name: 'Published' });
        const to = within(within(range).getByRole('group', { name: 'To' })).getAllByRole(
            'spinbutton',
        );
        await userEvent.click(to[1] as HTMLElement);
        await userEvent.keyboard('{ArrowDown}');
        await expect(args.onChange).toHaveBeenLastCalledWith({ to: '2026-01-30' });
        const from = within(within(range).getByRole('group', { name: 'From' })).getAllByRole(
            'spinbutton',
        );
        await userEvent.click(from[0] as HTMLElement);
        await userEvent.keyboard('1');
        await userEvent.click(from[1] as HTMLElement);
        await userEvent.keyboard('5');
        await userEvent.click(from[2] as HTMLElement);
        await userEvent.keyboard('2026');
        await expect(args.onChange).toHaveBeenLastCalledWith({
            from: '2026-01-05',
            to: '2026-01-30',
        });
    },
};

/**
 * An item of another resource, picked with the relation source of the fields context: the filter
 * keeps its id, and remembers its label for the chip.
 */
export const Relation: Story = {
    args: {
        filter: { id: 'author', type: 'relation', resource: 'authors', label: 'Author' },
        label: 'Author',
    },
    render: (args) => (
        <FieldsProvider relationSource={relationSource}>
            <RelationControl {...args} />
        </FieldsProvider>
    ),
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('combobox', { name: 'Author' }));
        await userEvent.click(await body.findByRole('option', { name: 'Ada Lovelace' }));
        await expect(args.onChange).toHaveBeenLastCalledWith('7');
        await expect(args.onLabel).toHaveBeenCalledWith('7', 'Ada Lovelace');
    },
};

/** An id from the URL: the relation source resolves its label, for the picker and the chip. */
export const RelationFromUrl: Story = {
    args: {
        filter: { id: 'author', type: 'relation', resource: 'authors', label: 'Author' },
        label: 'Author',
        value: '8',
    },
    render: Relation.render,
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        await waitFor(() =>
            expect(canvas.getByRole('combobox', { name: 'Author' })).toHaveValue('Grace Hopper'),
        );
        await expect(args.onLabel).toHaveBeenCalledWith('8', 'Grace Hopper');
        await expect(args.onChange).not.toHaveBeenCalled();
    },
};
