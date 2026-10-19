import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Container } from '../container/Container';
import containerStyles from '../container/Container.module.css';
import { Divider } from '../divider/Divider';
import { Grid, GridItem } from '../grid/Grid';
import gridStyles from '../grid/Grid.module.css';
import { Inline } from '../inline/Inline';
import inlineStyles from '../inline/Inline.module.css';
import { Stack } from '../stack/Stack';

describe('Stack', () => {
    it('sets its responsive props as inline variables', () => {
        render(
            <Stack
                as="ul"
                data-testid="stack"
                gap={{ base: 2, md: 6 }}
                align="center"
                justify="between"
                style={{ color: 'red' }}
            >
                <li>One</li>
            </Stack>,
        );
        const stack = screen.getByTestId('stack');
        expect(stack.nodeName).toBe('UL');
        expect(stack).toHaveClass('panneau-stack');
        expect(stack.style.getPropertyValue('--_panneau-stack-gap-base')).toBe(
            'var(--panneau-space-2)',
        );
        expect(stack.style.getPropertyValue('--_panneau-stack-gap-md')).toBe(
            'var(--panneau-space-6)',
        );
        expect(stack.style.getPropertyValue('--_panneau-stack-align-base')).toBe('center');
        expect(stack.style.getPropertyValue('--_panneau-stack-justify-base')).toBe('space-between');
        expect(stack.style.color).toBe('red');
    });

    it('has no inline style without props', () => {
        render(<Stack data-testid="stack" />);
        expect(screen.getByTestId('stack')).not.toHaveAttribute('style');
    });
});

describe('Inline', () => {
    it('wraps unless told not to', () => {
        render(<Inline data-testid="inline" wrap={false} gap={0} />);
        const inline = screen.getByTestId('inline');
        expect(inline).toHaveClass('panneau-inline', String(inlineStyles.nowrap));
        expect(inline.style.getPropertyValue('--_panneau-inline-gap-base')).toBe('0');
    });
});

describe('Grid', () => {
    it('takes columns per breakpoint, or a minimum cell width', () => {
        render(
            <>
                <Grid data-testid="columns" columns={{ base: 1, lg: 3 }} />
                <Grid data-testid="auto" minItemWidth="16rem" />
            </>,
        );
        const columns = screen.getByTestId('columns');
        expect(columns.style.getPropertyValue('--_panneau-grid-columns-lg')).toBe('3');
        expect(columns).not.toHaveClass(String(gridStyles.auto));
        const auto = screen.getByTestId('auto');
        expect(auto).toHaveClass(String(gridStyles.auto));
        expect(auto.style.getPropertyValue('--_panneau-grid-min-item-width')).toBe('16rem');
    });

    it('has items that span columns', () => {
        render(<GridItem data-testid="item" span={{ base: 'full', md: 2 }} />);
        const item = screen.getByTestId('item');
        expect(item).toHaveClass('panneau-grid-item');
        expect(item.style.getPropertyValue('--_panneau-grid-item-span-base')).toBe('1 / -1');
        expect(item.style.getPropertyValue('--_panneau-grid-item-span-md')).toBe('span 2');
    });
});

describe('Container', () => {
    it('has a size, lg by default', () => {
        render(
            <>
                <Container as="main" data-testid="lg" />
                <Container data-testid="full" size="full" flush />
            </>,
        );
        expect(screen.getByTestId('lg').nodeName).toBe('MAIN');
        expect(screen.getByTestId('lg')).toHaveClass(String(containerStyles.lg));
        expect(screen.getByTestId('full')).not.toHaveClass(String(containerStyles.lg));
        expect(screen.getByTestId('full')).toHaveClass(String(containerStyles.flush));
    });
});

describe('Divider', () => {
    it('is a separator in both orientations', () => {
        render(
            <>
                <Divider />
                <Divider orientation="vertical" />
            </>,
        );
        const [horizontal, vertical] = screen.getAllByRole('separator');
        expect(horizontal?.nodeName).toBe('HR');
        expect(vertical).toHaveAttribute('aria-orientation', 'vertical');
    });
});
