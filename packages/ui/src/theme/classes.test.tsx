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
import { DatePicker } from '../date-picker/DatePicker';
import { Disclosure } from '../disclosure/Disclosure';
import { Fieldset } from '../field/Fieldset';
import { IconButton } from '../icon-button/IconButton';
import { Icon } from '../icon/Icon';
import { NumberInput } from '../number-input/NumberInput';
import { RadioGroup } from '../radio-group/RadioGroup';
import { PanneauRoot } from '../root/PanneauRoot';
import { Select } from '../select/Select';
import { Spinner } from '../spinner/Spinner';
import { Switch } from '../switch/Switch';
import { Tab, TabList, TabPanel, Tabs } from '../tabs/Tabs';
import { TextArea } from '../text-area/TextArea';
import { TextInput } from '../text-input/TextInput';
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
    ['combo-box', <ComboBox key="combo-box" label="Author" items={[]} />],
    ['date-picker', <DatePicker key="date-picker" label="Date" />],
    ['disclosure', <Disclosure key="disclosure" title="More" />],
    ['fieldset', <Fieldset key="fieldset" legend="Group" />],
    ['icon', <Icon key="icon" icon={Plus} />],
    ['icon-button', <IconButton key="icon-button" icon={Plus} label="Add" showTooltip={false} />],
    ['number-input', <NumberInput key="number-input" label="Count" />],
    ['radio-group', <RadioGroup key="radio-group" label="Choice" options={options} />],
    ['radio', <RadioGroup key="radio" label="Choice" options={options} />],
    ['select', <Select key="select" label="Choice" options={options} />],
    ['spinner', <Spinner key="spinner" label="Loading" />],
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
