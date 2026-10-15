import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus } from 'lucide-react';

import { Alert } from './alert/Alert';
import { Badge } from './badge/Badge';
import { Button } from './button/Button';
import { Card } from './card/Card';
import { Checkbox } from './checkbox/Checkbox';
import { RadioGroup } from './radio-group/RadioGroup';
import { Select } from './select/Select';
import { Switch } from './switch/Switch';
import { Tab, TabList, TabPanel, Tabs } from './tabs/Tabs';
import { TextInput } from './text-input/TextInput';

/** A sample of every primitive, to check a theme and a color scheme at a glance (and with axe). */
function Sample() {
    return (
        <Card
            title="Edit the episode"
            actions={<Badge tone="success">Published</Badge>}
            footer={
                <>
                    <Button>Cancel</Button>
                    <Button variant="primary" icon={Plus}>
                        Save
                    </Button>
                </>
            }
        >
            <Alert tone="danger" title="1 error">
                Fix it before saving.
            </Alert>
            <Tabs>
                <TabList aria-label="Sections">
                    <Tab id="content">Content</Tab>
                    <Tab id="seo">SEO</Tab>
                </TabList>
                <TabPanel id="content">
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <TextInput label="Title" errors={['This field is required.']} isRequired />
                        <TextInput label="Subtitle" description="Optional." />
                        <Select
                            label="Season"
                            options={[
                                { value: 1, label: 'Season 1' },
                                { value: 2, label: 'Season 2' },
                            ]}
                            value={1}
                        />
                        <RadioGroup
                            label="Format"
                            orientation="horizontal"
                            options={[
                                { value: 'video', label: 'Video' },
                                { value: 'audio', label: 'Audio' },
                            ]}
                            value="video"
                        />
                        <Checkbox defaultSelected>Members only</Checkbox>
                        <Switch>Comments</Switch>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <Button variant="ghost">Preview</Button>
                            <Button variant="danger">Delete</Button>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel id="seo">SEO</TabPanel>
            </Tabs>
        </Card>
    );
}

const meta = {
    title: 'UI/Themes',
    component: Sample,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Sample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = { globals: { colorScheme: 'light', theme: 'default' } };

export const Dark: Story = { globals: { colorScheme: 'dark', theme: 'default' } };

export const Bootstrap: Story = { globals: { colorScheme: 'light', theme: 'bootstrap' } };

export const BootstrapDark: Story = { globals: { colorScheme: 'dark', theme: 'bootstrap' } };

/** At phone width. */
export const Phone: Story = {
    globals: { colorScheme: 'light', theme: 'default', viewport: { value: 'mobile1' } },
};
