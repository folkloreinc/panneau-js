import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Action } from '@panneau/protocol';

import { renderList } from '../__fixtures__/render';
import { ActionButton } from './ActionButton';

const site: Action = {
    id: 'site',
    label: 'On the site',
    kind: 'link',
    scope: ['item'],
    url: '//example.com/pages/{id}',
};
const remove: Action = {
    id: 'delete',
    label: 'Delete',
    kind: 'server',
    scope: ['item'],
    destructive: true,
};

describe('ActionButton', () => {
    it('outlines an action in its color in the header of an item', () => {
        renderList(
            <>
                <ActionButton
                    action={site}
                    href="//example.com/pages/2"
                    size="md"
                    inHeader
                    onPress={vi.fn()}
                />
                <ActionButton action={remove} href={null} size="md" inHeader onPress={vi.fn()} />
            </>,
        );
        const link = screen.getByRole('link', { name: 'On the site' });
        expect(link).toHaveAttribute('target', '_blank');
        expect(link.className).toMatch(/tone-info/);
        expect(link.className).toMatch(/_outline_/);
        expect(link.querySelector('svg')).toHaveClass('lucide-external-link');
        const button = screen.getByRole('button', { name: 'Delete' });
        expect(button.className).toMatch(/tone-danger/);
        expect(button.className).toMatch(/_outline_/);
    });

    it('outlines a neutral action, and makes one that destroys solid, beside a toolbar', () => {
        renderList(
            <>
                <ActionButton action={site} href="/pages/2" size="md" onPress={vi.fn()} />
                <ActionButton action={remove} href={null} size="md" onPress={vi.fn()} />
            </>,
        );
        expect(screen.getByRole('link', { name: 'On the site' }).className).toMatch(
            /tone-neutral.*_outline_/,
        );
        expect(screen.getByRole('button', { name: 'Delete' }).className).toMatch(
            /tone-danger.*_solid_/,
        );
    });
});
