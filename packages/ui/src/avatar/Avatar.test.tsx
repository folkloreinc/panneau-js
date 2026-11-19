import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Avatar } from './Avatar';
import { AvatarGroup } from './AvatarGroup';
import { getInitials, getNameColorIndex } from './initials';

describe('getInitials', () => {
    it('takes the first letters of the first and last words', () => {
        expect(getInitials('Ada Lovelace')).toBe('AL');
        expect(getInitials('Grace Brewster Murray Hopper')).toBe('GH');
        expect(getInitials('  cher  ')).toBe('C');
        expect(getInitials('')).toBe('');
    });

    it('keeps graphemes whole and skips leading punctuation', () => {
        expect(getInitials('Émile Zola')).toBe('ÉZ');
        expect(getInitials('(Ada) "Byron"')).toBe('AB');
        expect(getInitials('👩🏽‍💻 Team')).toBe('👩🏽‍💻T');
    });

    it('uses the case of the locale', () => {
        expect(getInitials('ilknur inan', 'tr')).toBe('İİ');
    });
});

describe('getNameColorIndex', () => {
    it('gives the same name the same color, whatever its case and spaces', () => {
        const index = getNameColorIndex('Ada Lovelace');
        expect(getNameColorIndex(' ada lovelace ')).toBe(index);
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(8);
    });

    it('spreads names over the colors', () => {
        const names = ['Ada', 'Grace', 'Alan', 'Linus', 'Margaret', 'Barbara', 'Edsger', 'Donald'];
        expect(new Set(names.map(getNameColorIndex)).size).toBeGreaterThan(3);
    });
});

describe('Avatar', () => {
    it('is decorative by default, with the name on hover', () => {
        const { container } = render(<Avatar name="Ada Lovelace" />);
        const avatar = container.querySelector('.panneau-avatar');
        expect(avatar).toHaveAttribute('aria-hidden', 'true');
        expect(avatar).toHaveAttribute('title', 'Ada Lovelace');
        expect(avatar).toHaveTextContent('AL');
        expect(avatar?.getAttribute('style')).toContain('--panneau-chart-categorical-');
    });

    it('is an image with a label, and says its status in words', () => {
        render(
            <Avatar name="Ada Lovelace" label="Ada Lovelace" tone="neutral" status="Disabled" />,
        );
        const avatar = screen.getByRole('img', { name: 'Ada Lovelace (Disabled)' });
        expect(avatar).toHaveAttribute('title', 'Ada Lovelace (Disabled)');
        expect(avatar).toHaveClass('panneau-tone-neutral');
    });

    it('shows the initials when the picture fails to load', () => {
        const { container } = render(<Avatar name="Ada Lovelace" src="/ada.jpg" />);
        const image = container.querySelector('img');
        expect(image).toHaveAttribute('src', '/ada.jpg');
        expect(image).toHaveAttribute('alt', '');
        fireEvent.error(image as HTMLImageElement);
        expect(container.querySelector('img')).toBeNull();
        expect(container).toHaveTextContent('AL');
    });

    it('tries a new picture again', () => {
        const { container, rerender } = render(<Avatar name="Ada" src="/a.jpg" />);
        fireEvent.error(container.querySelector('img') as HTMLImageElement);
        rerender(<Avatar name="Ada" src="/b.jpg" />);
        expect(container.querySelector('img')).toHaveAttribute('src', '/b.jpg');
    });
});

describe('AvatarGroup', () => {
    const people = [
        { name: 'Ada Lovelace' },
        { name: 'Grace Hopper' },
        { name: 'Alan Turing' },
        { name: 'Linus Torvalds' },
        { name: 'Margaret Hamilton' },
    ];

    it('shows at most max avatars and counts the others', () => {
        const { container } = render(<AvatarGroup people={people} max={2} />);
        expect(
            screen.getByRole('img', { name: 'Ada Lovelace, Grace Hopper, and 3 others' }),
        ).toBeInTheDocument();
        expect(container.querySelectorAll('[title]')).toHaveLength(3);
        expect(container).toHaveTextContent('+3');
    });

    it('lists every name when they all fit', () => {
        render(<AvatarGroup people={people.slice(0, 2)} />);
        expect(
            screen.getByRole('img', { name: 'Ada Lovelace and Grace Hopper' }),
        ).toBeInTheDocument();
    });

    it('says the status of a person', () => {
        render(
            <AvatarGroup people={[{ name: 'Ada Lovelace', tone: 'danger', status: 'Blocked' }]} />,
        );
        expect(screen.getByRole('img', { name: 'Ada Lovelace (Blocked)' })).toBeInTheDocument();
    });
});
