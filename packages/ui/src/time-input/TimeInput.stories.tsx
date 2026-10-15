import { Time } from '@internationalized/date';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { TimeInput } from './TimeInput';

const meta = {
    title: 'UI/TimeInput',
    component: TimeInput,
    args: { label: 'Opens at', defaultValue: new Time(9, 0) },
} satisfies Meta<typeof TimeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
