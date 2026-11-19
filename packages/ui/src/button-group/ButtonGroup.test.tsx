import { render, screen } from '@testing-library/react';
import { ChevronDown } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { Button } from '../button/Button';
import { IconButton } from '../icon-button/IconButton';
import { Menu, MenuItem, MenuTrigger } from '../menu/Menu';
import { ButtonGroup } from './ButtonGroup';

describe('ButtonGroup', () => {
    it('is a group named by its label, with its buttons as children', () => {
        render(
            <ButtonGroup label="Publish">
                <Button>Publish</Button>
                <MenuTrigger>
                    <IconButton icon={ChevronDown} label="More ways to publish" />
                    <Menu>
                        <MenuItem id="schedule">Schedule</MenuItem>
                    </Menu>
                </MenuTrigger>
            </ButtonGroup>,
        );
        const group = screen.getByRole('group', { name: 'Publish' });
        expect(group).toHaveClass('panneau-button-group');
        expect(group).toHaveAttribute('data-orientation', 'horizontal');
        expect(Array.from(group.children).map((child) => child.tagName)).toEqual([
            'BUTTON',
            'BUTTON',
        ]);
        expect(screen.getByRole('button', { name: 'More ways to publish' })).toHaveAttribute(
            'aria-haspopup',
            'true',
        );
    });

    it('stacks its buttons with a vertical orientation', () => {
        render(
            <ButtonGroup label="Align" orientation="vertical">
                <Button>Top</Button>
                <Button>Bottom</Button>
            </ButtonGroup>,
        );
        expect(screen.getByRole('group', { name: 'Align' })).toHaveAttribute(
            'data-orientation',
            'vertical',
        );
    });
});
