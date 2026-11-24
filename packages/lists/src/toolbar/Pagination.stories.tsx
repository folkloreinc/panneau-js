import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Pagination } from './Pagination';

/**
 * The pages of a list: the range shown, the first, previous, next and last pages, and the current
 * page, which opens a "Go to page" input to jump far.
 */
const meta = {
    title: 'Lists/Pagination',
    component: Pagination,
    parameters: { layout: 'padded' },
    args: { page: 4, perPage: 20, total: 1000, onPageChange: fn() },
    render: function Render(args) {
        const [page, setPage] = useState(args.page);
        return (
            <Pagination
                {...args}
                page={page}
                onPageChange={(next) => {
                    setPage(next);
                    args.onPageChange(next);
                }}
            />
        );
    },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The first and the last pages are a click away. */
export const FirstAndLast: Story = {
    play: async ({ canvasElement }) => {
        const nav = within(canvasElement).getByRole('navigation', { name: 'Pagination' });
        const pages = within(nav);
        await userEvent.click(pages.getByRole('button', { name: 'Last page' }));
        await expect(nav).toHaveTextContent('Page 50 of 50');
        await expect(pages.getByRole('button', { name: 'Last page' })).toBeDisabled();
        await expect(pages.getByRole('button', { name: 'Next page' })).toBeDisabled();
        await userEvent.click(pages.getByRole('button', { name: 'First page' }));
        await expect(nav).toHaveTextContent('Page 1 of 50');
        await expect(pages.getByRole('button', { name: 'First page' })).toBeDisabled();
        await expect(pages.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    },
};

/**
 * The current page opens "Go to page": Enter goes to the page typed, within the pages, and
 * Escape closes it. The focus comes back to the page.
 */
export const GoToPage: Story = {
    play: async ({ args, canvasElement }) => {
        const nav = within(canvasElement).getByRole('navigation', { name: 'Pagination' });
        const pages = within(nav);
        const current = () => pages.getByRole('button', { name: /^Page \d+ of 50$/ });

        await userEvent.click(current());
        const input = pages.getByRole('textbox', { name: 'Go to page' });
        await expect(input).toHaveFocus();
        await expect(input).toHaveValue('4');
        await userEvent.keyboard('37{Enter}');
        await expect(args.onPageChange).toHaveBeenLastCalledWith(37);
        await expect(current()).toHaveTextContent('Page 37 of 50');
        await waitFor(() => expect(current()).toHaveFocus());

        // From the keyboard, past the last page: the last one
        await userEvent.keyboard('{Enter}');
        await userEvent.keyboard('900{Enter}');
        await expect(args.onPageChange).toHaveBeenLastCalledWith(50);

        // Escape closes without going anywhere
        await userEvent.keyboard('{Enter}');
        await expect(pages.getByRole('textbox', { name: 'Go to page' })).toHaveFocus();
        await userEvent.keyboard('2{Escape}');
        await expect(pages.queryByRole('textbox', { name: 'Go to page' })).toBeNull();
        await expect(current()).toHaveTextContent('Page 50 of 50');
        await waitFor(() => expect(current()).toHaveFocus());
        await expect(args.onPageChange).toHaveBeenCalledTimes(2);
    },
};

/** A single page: nothing to go to. */
export const OnePage: Story = {
    args: { page: 1, total: 12 },
    play: async ({ canvasElement }) => {
        const pages = within(within(canvasElement).getByRole('navigation'));
        await expect(pages.getByText('Page 1 of 1')).toBeVisible();
        await expect(pages.queryByRole('button', { name: /^Page/ })).toBeNull();
        await expect(pages.getByRole('button', { name: 'Last page' })).toBeDisabled();
    },
};
