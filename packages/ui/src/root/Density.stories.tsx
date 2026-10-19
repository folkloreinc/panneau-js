import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Button } from '../button/Button';
import { Inline } from '../inline/Inline';
import { Select } from '../select/Select';
import { Stack } from '../stack/Stack';
import { TextInput } from '../text-input/TextInput';
import { Text } from '../text/Text';
import type { Density } from '../theme/theme';
import { PanneauRoot } from './PanneauRoot';

const meta = {
    title: 'UI/Density',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const DENSITIES: Exclude<Density, 'auto'>[] = ['compact', 'comfortable', 'touch'];

/** The same controls in each density: heights, control text, paddings and rows change. */
export const Densities: Story = {
    render: () => (
        <Inline align="start" gap={6}>
            {DENSITIES.map((density) => (
                <PanneauRoot key={density} density={density} style={{ width: '16rem' }}>
                    <Stack gap={3}>
                        <Text weight="bold">{density}</Text>
                        <TextInput label={`Title (${density})`} defaultValue="Spring issue" />
                        <Select
                            label={`Status (${density})`}
                            options={[
                                { value: 'draft', label: 'Draft' },
                                { value: 'published', label: 'Published' },
                            ]}
                            value="draft"
                        />
                        <Inline gap={2}>
                            <Button size="sm">{`Preview (${density})`}</Button>
                            <Button tone="accent">{`Save (${density})`}</Button>
                        </Inline>
                    </Stack>
                </PanneauRoot>
            ))}
        </Inline>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const height = (name: string) =>
            canvas.getByRole('button', { name }).getBoundingClientRect().height;
        await expect(height('Save (compact)')).toBe(32);
        await expect(height('Save (comfortable)')).toBe(36);
        await expect(height('Save (touch)')).toBe(44);
        await expect(height('Preview (touch)')).toBe(36);
        const input = canvas.getByRole('textbox', { name: 'Title (touch)' });
        await expect(getComputedStyle(input).fontSize).toBe('16px');
    },
};
