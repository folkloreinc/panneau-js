import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { TagsInput } from './TagsInput';

function Controlled(props: Parameters<typeof TagsInput>[0]) {
    const [value, setValue] = useState<string[] | null>(props.value ? [...props.value] : null);
    return <TagsInput {...props} value={value} onChange={setValue} />;
}

const meta = {
    title: 'UI/TagsInput',
    component: Controlled,
    args: {
        label: 'Topics',
        placeholder: 'Add a topic',
        value: ['culture'],
        suggestions: [
            { value: 'culture', label: 'Culture' },
            { value: 'food', label: 'Food' },
            { value: 'outdoors', label: 'Outdoors' },
        ],
    },
} satisfies Meta<typeof Controlled>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Enter or a comma adds a tag; Backspace in the empty input removes the last one. */
export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.type(canvas.getByRole('combobox', { name: 'Topics' }), 'Food{Enter}');
        await expect(canvas.getAllByRole('row').map((row) => row.textContent)).toEqual([
            'Culture',
            'Food',
        ]);
    },
};

/** Only the suggestions can be added. */
export const SuggestionsOnly: Story = { args: { allowCustom: false } };

export const WithErrors: Story = { args: { value: null, errors: ['Add at least one topic.'] } };
