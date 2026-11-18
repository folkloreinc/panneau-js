import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from '../button/Button';
import { Card } from '../card/Card';
import { Stack } from '../stack/Stack';
import { TextInput } from '../text-input/TextInput';
import { Text } from '../text/Text';
import { Aside, AsideLayout, AsidePanel } from './Aside';

const meta = {
    title: 'UI/Aside',
    component: Aside,
    args: { label: 'Details' },
} satisfies Meta<typeof Aside>;

export default meta;
type Story = StoryObj<typeof meta>;

function Content() {
    return (
        <Stack gap={4}>
            {Array.from({ length: 8 }, (_, index) => (
                <Card key={index}>
                    <Text>{`Row ${String(index + 1)}`}</Text>
                </Card>
            ))}
        </Stack>
    );
}

function Panels() {
    return (
        <>
            <AsidePanel id="publication" title="Publication">
                <Text>Published on November 9, 2026</Text>
            </AsidePanel>
            <AsidePanel id="dates" title="Dates" defaultCollapsed>
                <TextInput label="Starts" />
            </AsidePanel>
            <AsidePanel title="Help" isCollapsible={false}>
                <Text>What goes with the content.</Text>
            </AsidePanel>
        </>
    );
}

/** Beside the content from 56rem of the layout, with its title, its buttons and a toolbar. */
export const Beside: Story = {
    render: (args) => (
        <div style={{ maxWidth: '70rem' }}>
            <AsideLayout
                narrow="overlay"
                aside={
                    <Aside
                        {...args}
                        title="Hello world"
                        toolbar={<Button size="sm">Edit</Button>}
                        isWidenable
                        onClose={() => undefined}
                    >
                        <Panels />
                    </Aside>
                }
            >
                <Content />
            </AsideLayout>
        </div>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const aside = canvas.getByRole('region', { name: 'Details' });
        await expect(getComputedStyle(aside).position).toBe('sticky');
        const before = aside.getBoundingClientRect().width;
        await userEvent.click(canvas.getByRole('button', { name: 'Widen the panel' }));
        await expect(aside).toHaveAttribute('data-wide', 'true');
        await expect(aside.getBoundingClientRect().width).toBeGreaterThan(before);
        await userEvent.click(canvas.getByRole('button', { name: 'Narrow the panel' }));
    },
};

/** In a narrow layout, a form's aside goes below its content. */
export const Below: Story = {
    render: (args) => (
        <div style={{ maxWidth: '30rem' }}>
            <AsideLayout
                aside={
                    <Aside {...args} label="Sidebar">
                        {<Panels />}
                    </Aside>
                }
            >
                <Content />
            </AsideLayout>
        </div>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const aside = canvas.getByRole('region', { name: 'Sidebar' });
        await expect(getComputedStyle(aside).position).toBe('static');
        const trigger = canvas.getByRole('button', { name: 'Dates' });
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
        await userEvent.click(trigger);
        await expect(canvas.getByRole('textbox', { name: 'Starts' })).toBeVisible();
    },
};

/** In a narrow layout, an aside that opens on demand goes over the content, and closes. */
export const Overlay: Story = {
    render: function Render(args) {
        const [open, setOpen] = useState(true);
        return (
            <div style={{ maxWidth: '30rem' }}>
                <AsideLayout
                    narrow="overlay"
                    aside={
                        open ? (
                            <Aside {...args} title="Hello world" onClose={() => setOpen(false)}>
                                <Panels />
                            </Aside>
                        ) : null
                    }
                >
                    <Button onPress={() => setOpen(true)}>Open</Button>
                    <Content />
                </AsideLayout>
            </div>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const aside = canvas.getByRole('region', { name: 'Details' });
        await expect(getComputedStyle(aside).position).toBe('fixed');
        await userEvent.click(canvas.getByRole('button', { name: 'Close' }));
        await expect(canvas.queryByRole('region', { name: 'Details' })).toBeNull();
    },
};

/** Its title while it loads. */
export const Loading: Story = {
    args: { isLoading: true },
    render: (args) => (
        <div style={{ maxWidth: '24rem' }}>
            <Aside {...args} />
        </div>
    ),
};
