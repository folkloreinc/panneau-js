import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Badge } from '../badge/Badge';
import { TextInput } from '../text-input/TextInput';
import { Tab, TabList, TabPanel, Tabs } from './Tabs';

const meta = { title: 'UI/Tabs', component: Tabs } satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithErrorCount: Story = {
    render: (args) => (
        <Tabs {...args}>
            <TabList aria-label="Sections of the form">
                <Tab id="content">Content</Tab>
                <Tab id="seo">
                    SEO
                    <Badge tone="danger" label="2 errors">
                        2
                    </Badge>
                </Tab>
                <Tab id="sharing">Sharing</Tab>
                <Tab id="advanced">Advanced settings</Tab>
            </TabList>
            <TabPanel id="content">
                <TextInput label="Title" />
            </TabPanel>
            <TabPanel id="seo">
                <TextInput label="Meta title" errors={['This field is required.']} />
            </TabPanel>
            <TabPanel id="sharing">Sharing settings</TabPanel>
            <TabPanel id="advanced">Advanced settings</TabPanel>
        </Tabs>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('tab', { name: /SEO/ }));
        await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Meta title');
    },
};
