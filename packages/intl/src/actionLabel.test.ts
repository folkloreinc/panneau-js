import { createIntl } from 'react-intl';
import { describe, expect, it } from 'vitest';

import { getActionLabel } from './actionLabel';
import { fr } from './catalogs';

describe('getActionLabel', () => {
    it('labels the built-in links in the locale, unless they have a label', () => {
        const en = createIntl({ locale: 'en' });
        const french = createIntl({ locale: 'fr', messages: fr });
        expect(getActionLabel({ id: 'edit' }, en)).toBe('Edit');
        expect(getActionLabel({ id: 'show' }, en)).toBe('View');
        expect(getActionLabel({ id: 'edit' }, french)).toBe('Modifier');
        expect(getActionLabel({ id: 'show' }, french)).toBe('Voir');
        expect(getActionLabel({ id: 'edit', label: 'Open' }, french)).toBe('Open');
        expect(getActionLabel({ id: 'publish', label: 'Publish' }, french)).toBe('Publish');
    });
});
