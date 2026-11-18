import { render } from '@testing-library/react';
import { Archive, Pencil } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import type { Action } from '@panneau/protocol';
import { Icon, PanneauRoot, getNamedIcon } from '@panneau/ui';
import { lucideIconLoader } from '@panneau/ui/named-icons';

import { edit, publish } from '../__fixtures__/pages';
import { getActionIcon, getActionTone } from './icons';

describe('getActionIcon', () => {
    it('gives the built-in actions their icon', () => {
        expect(getActionIcon(edit)).toBe(Pencil);
        expect(getActionIcon(publish)).toBeUndefined();
    });

    it('looks up the Lucide icon an action names', async () => {
        const send: Action = { ...publish, icon: 'send' };
        const icon = getActionIcon(send);
        expect(icon).toBe(getNamedIcon('send'));
        const { findByText, container } = render(
            <PanneauRoot iconLoader={lucideIconLoader}>
                <Icon icon={icon as NonNullable<typeof icon>} />
                <span>rendered</span>
            </PanneauRoot>,
        );
        await findByText('rendered');
        await expect.poll(() => container.querySelector('svg.lucide-send')).not.toBeNull();
        // A built-in action that names another icon gets that one.
        expect(getActionIcon({ ...edit, icon: 'square-pen' })).toBe(getNamedIcon('square-pen'));
    });

    it('prefers the icons given by action id', () => {
        expect(getActionIcon({ ...publish, icon: 'send' }, { publish: Archive })).toBe(Archive);
        expect(getActionIcon(edit, { edit: Archive })).toBe(Archive);
        expect(getActionIcon(edit, { other: Archive })).toBe(Pencil);
    });

    it('ignores ids that are properties of every object', () => {
        expect(getActionIcon({ ...publish, id: 'toString' })).toBeUndefined();
        expect(getActionIcon({ ...publish, id: 'constructor' }, {})).toBeUndefined();
    });
});

describe('getActionTone', () => {
    const site: Action = {
        id: 'site',
        kind: 'link',
        label: 'View on the site',
        scope: ['item'],
        url: 'https://example.com/pages/{id}',
    };

    it('colors the built-in actions, and the others neutral', () => {
        expect(getActionTone(edit)).toBe('accent');
        expect(getActionTone({ ...edit, id: 'show' })).toBe('info');
        expect(getActionTone(publish)).toBe('neutral');
    });

    it('gives a link that leaves the admin the info tone', () => {
        expect(getActionTone(site)).toBe('info');
        expect(getActionTone({ ...site, url: '/panneau/pages/{id}/preview' })).toBe('neutral');
    });

    it('takes the tone an action declares, but danger for one that destroys', () => {
        expect(getActionTone({ ...publish, tone: 'success' })).toBe('success');
        expect(getActionTone({ ...site, tone: 'brand' })).toBe('brand');
        expect(getActionTone({ ...publish, tone: 'success', destructive: true })).toBe('danger');
    });
});
