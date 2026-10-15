import type { Meta, StoryObj } from '@storybook/react-vite';

import { TextInput } from '../text-input/TextInput';
import { Fieldset } from './Fieldset';

const meta = {
    title: 'UI/Fieldset',
    component: Fieldset,
    args: {
        legend: 'Title',
        description: 'In every language of the site.',
        children: (
            <>
                <TextInput label="French" defaultValue="À propos" />
                <TextInput label="English" errors={['This field is required.']} />
            </>
        ),
    },
} satisfies Meta<typeof Fieldset>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
