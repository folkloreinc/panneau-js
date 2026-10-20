import { render } from '@testing-library/react';
import { Archive, Pencil } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import type { Action } from '@panneau/protocol';
import { Icon, PanneauRoot, getNamedIcon } from '@panneau/ui';
import { lucideIconLoader } from '@panneau/ui/named-icons';

import { edit, publish } from '../__fixtures__/pages';
import { getActionIcon } from './icons';

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
