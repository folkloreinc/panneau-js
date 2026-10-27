import { render } from '@testing-library/react';
import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { Alert } from '../alert/Alert';
import { Badge } from '../badge/Badge';
import { Button } from '../button/Button';
import { Card } from '../card/Card';
import { Checkbox } from '../checkbox/Checkbox';
import { ComboBox } from '../combo-box/ComboBox';
import { Container } from '../container/Container';
import { DatePicker } from '../date-picker/DatePicker';
import { Disclosure } from '../disclosure/Disclosure';
import { Divider } from '../divider/Divider';
import { Fieldset } from '../field/Fieldset';
import { Grid, GridItem } from '../grid/Grid';
import { Heading } from '../heading/Heading';
import { IconButton } from '../icon-button/IconButton';
import { Icon } from '../icon/Icon';
import { Inline } from '../inline/Inline';
import { NumberInput } from '../number-input/NumberInput';
import { PillTrigger } from '../pill-trigger/PillTrigger';
import { Prose } from '../prose/Prose';
import { RadioGroup } from '../radio-group/RadioGroup';
import { PanneauRoot } from '../root/PanneauRoot';
import { ThemeScope } from '../root/ThemeScope';
import { Select } from '../select/Select';
import { Spinner } from '../spinner/Spinner';
import { Stack } from '../stack/Stack';
import { Switch } from '../switch/Switch';
import { Tab, TabList, TabPanel, Tabs } from '../tabs/Tabs';
import { TextArea } from '../text-area/TextArea';
import { TextInput } from '../text-input/TextInput';
import { Text } from '../text/Text';
import { TimeInput } from '../time-input/TimeInput';

const options = [
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B' },
];

const cases: [string, ReactNode][] = [
    ['alert', <Alert key="alert">Saved</Alert>],
    ['badge', <Badge key="badge">3</Badge>],
    ['button', <Button key="button">Save</Button>],
    ['card', <Card key="card">Body</Card>],
    ['checkbox', <Checkbox key="checkbox">Published</Checkbox>],
    ['container', <Container key="container" />],
    ['combo-box', <ComboBox key="combo-box" label="Author" items={[]} />],
    ['date-picker', <DatePicker key="date-picker" label="Date" />],
    ['disclosure', <Disclosure key="disclosure" title="More" />],
    ['divider', <Divider key="divider" />],
    ['fieldset', <Fieldset key="fieldset" legend="Group" />],
    ['grid', <Grid key="grid" />],
    ['grid-item', <GridItem key="grid-item" />],
    ['heading', <Heading key="heading">Title</Heading>],
    ['icon', <Icon key="icon" icon={Plus} />],
    ['icon-button', <IconButton key="icon-button" icon={Plus} label="Add" showTooltip={false} />],
    ['inline', <Inline key="inline" />],
    ['number-input', <NumberInput key="number-input" label="Count" />],
    ['pill-trigger', <PillTrigger key="pill-trigger">Draft</PillTrigger>],
    ['prose', <Prose key="prose" />],
    ['radio-group', <RadioGroup key="radio-group" label="Choice" options={options} />],
    ['radio', <RadioGroup key="radio" label="Choice" options={options} />],
    ['select', <Select key="select" label="Choice" options={options} />],
    ['spinner', <Spinner key="spinner" label="Loading" />],
    ['stack', <Stack key="stack" />],
    ['switch', <Switch key="switch">Active</Switch>],
    [
        'tabs',
        <Tabs key="tabs">
            <TabList aria-label="Sections">
                <Tab id="one">One</Tab>
            </TabList>
            <TabPanel id="one">Panel</TabPanel>
        </Tabs>,
    ],
    ['theme-scope', <ThemeScope key="theme-scope" />],
    ['text', <Text key="text">Body</Text>],
    ['text-area', <TextArea key="text-area" label="Notes" />],
    ['text-input', <TextInput key="text-input" label="Title" />],
    ['time-input', <TimeInput key="time-input" label="Time" />],
];

describe('component classes', () => {
    it.each(cases)('gives the root of %s its panneau-* class', (component, element) => {
        const { container } = render(<PanneauRoot>{element}</PanneauRoot>);
        expect(container.querySelector(`.panneau-${component}`)).not.toBeNull();
    });

    it('gives the root and the parts of tabs their classes', () => {
        const { container } = render(
            <PanneauRoot>
                <Tabs>
                    <TabList aria-label="Sections">
                        <Tab id="one">One</Tab>
                    </TabList>
                    <TabPanel id="one">Panel</TabPanel>
                </Tabs>
            </PanneauRoot>,
        );
        for (const component of ['root', 'tab-list', 'tab', 'tab-panel']) {
            expect(container.querySelector(`.panneau-${component}`)).not.toBeNull();
        }
    });

    it('gives IconButton the classes of a button and of an icon button', () => {
        const { container } = render(
            <PanneauRoot>
                <IconButton icon={Plus} label="Add" showTooltip={false} />
            </PanneauRoot>,
        );
        expect(container.querySelector('button')).toHaveClass(
            'panneau-button',
            'panneau-icon-button',
        );
    });
});
