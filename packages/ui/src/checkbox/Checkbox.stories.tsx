import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Checkbox } from './Checkbox';

const meta = {
    title: 'UI/Checkbox',
    component: Checkbox,
    args: { children: 'Show on the home page' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const checkbox = within(canvasElement).getByRole('checkbox');
        await userEvent.click(checkbox);
        await expect(checkbox).toBeChecked();
    },
};

export const States: Story = {
    render: (args) => (
        <div style={{ display: 'grid', gap: '0.5rem' }}>
            <Checkbox {...args} defaultSelected>
                Selected
            </Checkbox>
            <Checkbox {...args} isIndeterminate>
                Indeterminate
            </Checkbox>
            <Checkbox {...args} isDisabled>
                Disabled
            </Checkbox>
            <Checkbox {...args} description="Readers get an email." errors={['Required.']}>
                With description and errors
            </Checkbox>
        </div>
    ),
};
