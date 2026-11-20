import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { CursorPagination } from './Pagination';
import { SearchField } from './SearchField';

/** The search of a list: it changes the query once the user stops typing, or presses Enter. */
const meta = {
    title: 'Lists/Toolbar',
    component: SearchField,
    parameters: { layout: 'padded' },
    args: { value: '', onChange: fn() },
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Search: Story = {
    render: function Render(args) {
        const [value, setValue] = useState(args.value);
        return (
            <SearchField
                value={value}
                onChange={(q) => {
                    setValue(q);
                    args.onChange(q);
                }}
            />
        );
    },
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByRole('searchbox', { name: 'Search' });
        await userEvent.type(input, 'festival');
        // Once the user stops typing, for the whole text
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith('festival'));
        await expect(args.onChange).toHaveBeenCalledTimes(1);
        // Enter searches at once
        await userEvent.type(input, ' river{Enter}');
        await expect(args.onChange).toHaveBeenLastCalledWith('festival river');
    },
};

/**
 * The pages of a list paged with cursors (decision 0039): no page numbers and no total, only the
 * previous and next pages, off where there is none.
 */
export const Cursors: StoryObj<typeof CursorPagination> = {
    args: {
        perPage: 20,
        hasPrevious: false,
        hasNext: true,
        onPrevious: fn(),
        onNext: fn(),
    },
    render: function Render(args) {
        const [page, setPage] = useState(1);
        return (
            <CursorPagination
                {...args}
                hasPrevious={page > 1}
                hasNext={page < 2}
                onPrevious={() => {
                    setPage(page - 1);
                    args.onPrevious();
                }}
                onNext={() => {
                    setPage(page + 1);
                    args.onNext();
                }}
            />
        );
    },
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const previous = canvas.getByRole('button', { name: 'Previous page' });
        const next = canvas.getByRole('button', { name: 'Next page' });
        await expect(previous).toBeDisabled();
        await expect(next).toBeEnabled();
        await userEvent.click(next);
        await expect(args.onNext).toHaveBeenCalledTimes(1);
        // The last page: no next one
        await expect(next).toBeDisabled();
        await expect(previous).toBeEnabled();
        await userEvent.click(previous);
        await expect(args.onPrevious).toHaveBeenCalledTimes(1);
        await expect(previous).toBeDisabled();
    },
};

/** With page sizes to choose from. */
export const CursorsWithPageSizes: StoryObj<typeof CursorPagination> = {
    args: {
        perPage: 20,
        hasPrevious: true,
        hasNext: false,
        onPrevious: fn(),
        onNext: fn(),
        perPageOptions: [10, 20, 50],
        onPerPageChange: fn(),
    },
    render: (args) => <CursorPagination {...args} />,
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await expect(canvas.getByRole('button', { name: 'Next page' })).toBeDisabled();
        await userEvent.click(canvas.getByRole('button', { name: /Per page/ }));
        await userEvent.click(await body.findByRole('option', { name: '50' }));
        await expect(args.onPerPageChange).toHaveBeenCalledWith(50);
    },
};
