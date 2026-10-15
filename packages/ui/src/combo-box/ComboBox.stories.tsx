import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { ComboBox, type ComboBoxItem } from './ComboBox';

const AUTHORS: ComboBoxItem[] = [
    { id: '1', label: 'Ada Lovelace', description: 'Analytical engine' },
    { id: '2', label: 'Grace Hopper', description: 'Compilers' },
    { id: '3', label: 'Katherine Johnson' },
    { id: '4', label: 'Margaret Hamilton' },
];

const meta = {
    title: 'UI/ComboBox',
    component: ComboBox,
    args: { label: 'Author', items: AUTHORS, placeholder: 'Search authors' },
} satisfies Meta<typeof ComboBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LocalFilter: Story = {
    render: function Render(args) {
        const [query, setQuery] = useState('');
        const [value, setValue] = useState<string | null>(null);
        const items = AUTHORS.filter((author) =>
            author.label.toLowerCase().includes(query.toLowerCase()),
        );
        return (
            <ComboBox
                {...args}
                items={items}
                inputValue={query}
                onInputChange={setQuery}
                value={value}
                onChange={(id) => {
                    setValue(id);
                    setQuery(AUTHORS.find((author) => author.id === id)?.label ?? '');
                }}
            />
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const input = canvas.getByRole('combobox', { name: 'Author' });
        await userEvent.type(input, 'hop');
        await userEvent.click(await body.findByRole('option', { name: /Grace Hopper/ }));
        await expect(input).toHaveValue('Grace Hopper');
    },
};

export const Loading: Story = { args: { items: [], isLoading: true } };

export const WithErrors: Story = { args: { errors: ['This field is required.'] } };
