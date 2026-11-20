import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import type { Field } from '@panneau/protocol';

import { ErrorSummary } from './ErrorSummary';

const FIELDS: Field[] = [
    { name: 'title', type: 'text', label: 'Title', localized: true },
    {
        name: 'address',
        type: 'group',
        label: 'Address',
        fields: [{ name: 'city', type: 'text', label: 'City' }],
    },
    {
        name: 'links',
        type: 'repeater',
        label: 'Links',
        fields: [{ name: 'url', type: 'url', label: 'URL' }],
    },
];

/** The errors of a form after a failed submit, each one a link to its field. */
const meta = {
    title: 'Forms/ErrorSummary',
    component: ErrorSummary,
    args: {
        fields: FIELDS,
        errors: {
            'title.fr': ['The title is required.'],
            'address.city': ['The city is required.'],
            'links.1.url': ['The URL must be a valid URL.'],
        },
        onSelect: fn(),
    },
} satisfies Meta<typeof ErrorSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Paths named by the labels of their fields: a locale, a group, an item of a repeater. */
export const ByPath: Story = {
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const summary = canvas.getByRole('alert');
        await expect(summary).toHaveTextContent('3 errors prevent saving');
        await expect(
            within(summary)
                .getAllByRole('button')
                .map((button) => button.textContent),
        ).toEqual(['Title (fr)', 'Address › City', 'Links › 2 › URL']);
        await expect(summary).toHaveTextContent('Address › City: The city is required.');
        await userEvent.click(canvas.getByRole('button', { name: 'Links › 2 › URL' }));
        await expect(args.onSelect).toHaveBeenCalledWith('links.1.url');
    },
};

/** Without errors, there is nothing to show. */
export const Empty: Story = {
    args: { errors: { title: [] } },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).queryByRole('alert')).toBeNull();
    },
};
