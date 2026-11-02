import { createIntl } from 'react-intl';
import { describe, expect, it } from 'vitest';

import { fr } from '@panneau/intl';

import { edit, editLink, exportAction, publish, remove, showLink } from '../__fixtures__/pages';
import {
    getActionHref,
    getActionLabel,
    groupListActions,
    hasOwnTarget,
    isAllowedOn,
} from './actions';

describe('groupListActions', () => {
    it('places a list of actions by placement, or by scope', () => {
        const groups = groupListActions([publish, remove, edit, exportAction]);
        expect(groups.row.map((action) => action.id)).toEqual(['publish', 'edit']);
        expect(groups.toolbar.map((action) => action.id)).toEqual(['publish', 'delete', 'export']);
        expect(groups.menu.map((action) => action.id)).toEqual(['delete']);
    });

    it('hides the actions the user can’t run on the resource', () => {
        const forbidden = { ...publish, abilities: { run: false } };
        expect(groupListActions([forbidden]).row).toEqual([]);
        expect(groupListActions({ row: [forbidden, edit] }).row).toEqual([edit]);
    });
});

describe('isAllowedOn', () => {
    it('follows the abilities of the item', () => {
        expect(isAllowedOn(publish, { id: '1', abilities: { publish: true } })).toBe(true);
        expect(isAllowedOn(publish, { id: '1', abilities: { update: true } })).toBe(false);
        expect(isAllowedOn(edit, { id: '1', abilities: {} })).toBe(true);
        expect(isAllowedOn(edit, { id: '1', abilities: { edit: false } })).toBe(false);
    });

    it('hides `edit` on items that can’t be updated, and `show` on those that can’t be viewed', () => {
        expect(isAllowedOn(editLink, { id: '1', abilities: { update: false } })).toBe(false);
        expect(isAllowedOn(editLink, { id: '1', abilities: { update: true } })).toBe(true);
        expect(isAllowedOn(showLink, { id: '1', abilities: { update: false } })).toBe(true);
        expect(isAllowedOn(showLink, { id: '1', abilities: { view: false } })).toBe(false);
    });

    it('allows everything on items without abilities', () => {
        expect(isAllowedOn(publish, { id: '1' })).toBe(true);
        expect(isAllowedOn({ ...publish, abilities: { run: false } }, { id: '1' })).toBe(false);
    });
});

describe('getActionHref', () => {
    it('fills the URL template of a link with the item', () => {
        expect(getActionHref(edit, { id: 'a/b' })).toBe('/pages/a%2Fb/edit');
        expect(getActionHref(publish, { id: '1' })).toBeNull();
        expect(
            getActionHref({ ...edit, url: undefined, route: 'pages.edit' }, { id: '1' }),
        ).toBeNull();
    });
});

describe('getActionLabel', () => {
    it('labels the built-in links in the locale, unless they have a label', () => {
        const en = createIntl({ locale: 'en' });
        const french = createIntl({ locale: 'fr', messages: fr });
        expect(getActionLabel(editLink, en)).toBe('Edit');
        expect(getActionLabel(showLink, en)).toBe('View');
        expect(getActionLabel(editLink, french)).toBe('Modifier');
        expect(getActionLabel(showLink, french)).toBe('Voir');
        expect(getActionLabel({ ...editLink, label: 'Open' }, french)).toBe('Open');
        expect(getActionLabel(publish, french)).toBe('Publish');
    });
});

describe('hasOwnTarget', () => {
    it('is false only for the built-in links without a url or a route', () => {
        expect(hasOwnTarget(editLink)).toBe(false);
        expect(hasOwnTarget(showLink)).toBe(false);
        expect(hasOwnTarget(edit)).toBe(true);
        expect(hasOwnTarget({ ...showLink, route: 'page' })).toBe(true);
    });
});
