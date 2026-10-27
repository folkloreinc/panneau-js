import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ACCOUNTS, StoryAvatar } from '../__fixtures__/accounts';
import type { OptionValue } from '../select/Select';
import { RadioGroup, type RadioGroupProps } from './RadioGroup';

const meta = {
    title: 'UI/RadioGroup',
    component: RadioGroup,
    args: {
        label: 'Format',
        options: [
            { value: 'square', label: 'Square', description: '1:1' },
            { value: 'portrait', label: 'Portrait', description: '4:5' },
            { value: 'story', label: 'Story', description: '9:16' },
        ],
    },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
    play: async ({ canvasElement }) => {
        const radio = within(canvasElement).getByRole('radio', { name: /Portrait/ });
        await userEvent.click(radio);
        await expect(radio).toBeChecked();
    },
};

export const Horizontal: Story = { args: { orientation: 'horizontal' } };

export const WithErrors: Story = { args: { errors: ['Pick a format.'], isRequired: true } };

function ControlledRadioGroup(props: RadioGroupProps) {
    const [value, setValue] = useState<OptionValue | null>(props.value ?? null);
    return (
        <RadioGroup
            {...props}
            value={value}
            onChange={(next) => {
                setValue(next);
                props.onChange?.(next);
            }}
        />
    );
}

/** Options as cards in two columns, each with an avatar, a name and a handle. */
export const Cards: Story = {
    args: {
        label: 'Publish on',
        description: 'Only this step changes.',
        appearance: 'cards',
        options: ACCOUNTS.map((account) => ({
            value: account.id,
            label: account.name,
            description: account.handle,
            media: <StoryAvatar account={account} />,
        })),
        value: 'ada',
        onChange: fn(),
    },
    render: (args) => <ControlledRadioGroup {...args} />,
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const ada = canvas.getByRole('radio', { name: /Ada Lovelace/ });
        await expect(ada).toBeChecked();
        await userEvent.click(canvas.getByRole('radio', { name: /Grace Hopper/ }));
        await expect(args.onChange).toHaveBeenLastCalledWith('grace');
        await expect(canvas.getByRole('radio', { name: /Grace Hopper/ })).toBeChecked();

        // Arrow keys move the selection, as in a list of radios.
        await userEvent.keyboard('{ArrowUp}');
        await expect(ada).toBeChecked();
        await expect(ada).toHaveFocus();
    },
};

/** Three columns of plans, without media, which become one in a narrow container. */
export const CardColumns: Story = {
    args: {
        label: 'Plan',
        appearance: 'cards',
        columns: 3,
        options: [
            { value: 'free', label: 'Free', description: 'One site' },
            { value: 'team', label: 'Team', description: 'Five sites and roles' },
            { value: 'custom', label: 'Custom', description: 'Talk to us', disabled: true },
        ],
    },
    render: (args) => (
        <div style={{ display: 'grid', gap: '2rem' }}>
            <ControlledRadioGroup {...args} />
            <div style={{ width: '18rem' }}>
                <ControlledRadioGroup {...args} label="Plan, in a narrow column" />
            </div>
        </div>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const [wide, narrow] = canvas.getAllByRole('radiogroup');
        const columnsOf = (group: HTMLElement | undefined) => {
            const options = group?.querySelector('[style*="--_panneau-radio-group-columns"]');
            return options === null || options === undefined
                ? 0
                : getComputedStyle(options).gridTemplateColumns.split(' ').length;
        };
        await expect(columnsOf(wide)).toBe(3);
        await expect(columnsOf(narrow)).toBe(1);
        await expect(
            within(narrow as HTMLElement).getByRole('radio', { name: /Custom/ }),
        ).toBeDisabled();
    },
};
