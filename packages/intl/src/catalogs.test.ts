/*
 * The check of the translations, across packages: every message of a Panneau package has a
 * French translation, with the same arguments as its English text.
 */
import { type MessageFormatElement, TYPE, parse } from '@formatjs/icu-messageformat-parser';
import { describe, expect, it } from 'vitest';

import { en, fr, getDescriptors } from './catalogs';
import { fieldsMessages } from './messages/fields';
import { formsMessages } from './messages/forms';
import { listsMessages } from './messages/lists';
import { uiMessages } from './messages/ui';

const GROUPS = {
    ui: uiMessages,
    fields: fieldsMessages,
    forms: formsMessages,
    lists: listsMessages,
};

/** The names of the arguments of an ICU message (`{count, plural, …}` gives `count`). */
function getArguments(elements: MessageFormatElement[]): string[] {
    return elements.flatMap((element) => {
        switch (element.type) {
            case TYPE.argument:
            case TYPE.number:
            case TYPE.date:
            case TYPE.time:
                return [element.value];
            case TYPE.plural:
            case TYPE.select:
                return [
                    element.value,
                    ...Object.values(element.options).flatMap((option) =>
                        getArguments(option.value),
                    ),
                ];
            case TYPE.tag:
                return getArguments(element.children);
            default:
                return [];
        }
    });
}

function argumentsOf(message: string): string[] {
    return [...new Set(getArguments(parse(message)))].sort();
}

describe('the messages of the Panneau packages', () => {
    it.each(Object.entries(GROUPS))('names the ids of %s after their package', (name, group) => {
        const ids = getDescriptors(group).map(({ id }) => id);
        expect(ids.filter((id) => !id.startsWith(`panneau.${name}.`))).toEqual([]);
    });

    it('gives every message its own id', () => {
        const ids = Object.values(GROUPS).flatMap((group) =>
            getDescriptors(group).map(({ id }) => id),
        );
        expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
        expect(Object.keys(en)).toHaveLength(ids.length);
    });

    it('translates every message in French', () => {
        const missing = Object.keys(en).filter((id) => fr[id] === undefined);
        const unknown = Object.keys(fr).filter((id) => en[id] === undefined);
        expect({ missing, unknown }).toEqual({ missing: [], unknown: [] });
    });

    it('keeps the arguments of the English messages in French', () => {
        const mismatches = Object.entries(en).flatMap(([id, message]) => {
            const translation = fr[id];
            if (translation === undefined) {
                return [];
            }
            const expected = argumentsOf(message);
            const actual = argumentsOf(translation);
            return expected.join() === actual.join() ? [] : [{ id, expected, actual }];
        });
        expect(mismatches).toEqual([]);
    });
});
