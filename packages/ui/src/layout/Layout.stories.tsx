import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { expect, within } from 'storybook/test';

import { Badge } from '../badge/Badge';
import { Button } from '../button/Button';
import { Card } from '../card/Card';
import { Container } from '../container/Container';
import { Divider } from '../divider/Divider';
import { Grid, GridItem } from '../grid/Grid';
import { Heading } from '../heading/Heading';
import { Inline } from '../inline/Inline';
import { Stack } from '../stack/Stack';
import { Text } from '../text/Text';

const meta = {
    title: 'UI/Layout',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Cell({ children }: { children: ReactNode }) {
    return (
        <Card>
            <Text numeric>{children}</Text>
        </Card>
    );
}

function columnCount(element: Element): number {
    return getComputedStyle(element).gridTemplateColumns.split(' ').length;
}

/**
 * The same grid in a narrow and a wide container: breakpoints follow the container, not the
 * viewport.
 */
export const ResponsiveGrid: Story = {
    render: () => (
        <Stack gap={8}>
            {[
                ['narrow', '30rem'],
                ['wide', '70rem'],
            ].map(([name, width]) => (
                <Container key={name} size="full" flush style={{ maxWidth: width }}>
                    <Stack gap={2}>
                        <Heading level={2} size={4}>
                            {`A ${String(name)} container`}
                        </Heading>
                        <Grid data-testid={name} columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
                            <GridItem span={{ base: 1, lg: 'full' }}>
                                <Cell>Full width from lg</Cell>
                            </GridItem>
                            <Cell>2</Cell>
                            <Cell>3</Cell>
                            <Cell>4</Cell>
                        </Grid>
                    </Stack>
                </Container>
            ))}
        </Stack>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(columnCount(canvas.getByTestId('narrow'))).toBe(1);
        const wide = canvas.getByTestId('wide');
        await expect(columnCount(wide)).toBe(3);
        const first = wide.firstElementChild as Element;
        await expect(getComputedStyle(first).gridColumnStart).toBe('1');
        await expect(getComputedStyle(first).gridColumnEnd).toBe('-1');
    },
};

/** As many columns as fit, each at least 12rem wide. */
export const AutoFitGrid: Story = {
    render: () => (
        <Container size="md" flush>
            <Grid data-testid="grid" minItemWidth="12rem">
                {['Pages', 'Articles', 'Authors', 'Media', 'Menus'].map((name) => (
                    <Cell key={name}>{name}</Cell>
                ))}
            </Grid>
        </Container>
    ),
    play: async ({ canvasElement }) => {
        // 48rem fits 3 columns of 12rem with the gap, not 4.
        await expect(columnCount(within(canvasElement).getByTestId('grid'))).toBe(3);
    },
};

/** Stacks and rows nest: a value set on one doesn't reach those inside it. */
export const StacksAndRows: Story = {
    render: () => (
        <Container size="sm">
            <Stack data-testid="outer" gap={8}>
                <Stack data-testid="inner">
                    <Heading level={2} size={3}>
                        Publishing
                    </Heading>
                    <Text muted>Who can publish, and when.</Text>
                </Stack>
                <Divider />
                <Inline justify="between">
                    <Inline gap={2}>
                        <Badge tone="success">Published</Badge>
                        <Divider orientation="vertical" />
                        <Text as="span" size="sm" muted>
                            Today
                        </Text>
                    </Inline>
                    <Inline gap={2}>
                        <Button>Preview</Button>
                        <Button tone="accent">Save</Button>
                    </Inline>
                </Inline>
            </Stack>
        </Container>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(getComputedStyle(canvas.getByTestId('outer')).rowGap).toBe('32px');
        // The default gap of a stack, not the outer one's.
        await expect(getComputedStyle(canvas.getByTestId('inner')).rowGap).toBe('16px');
    },
};
