// The state of a mock backend: its items, and what reads and writes them.
import type { ListQuery } from '../query';
import { ITEM_TYPE_KEY } from '../resourceTypes';
import { checkValues } from '../rules';
import type { DefinitionInput, ResourceInput } from '../schemas';
import type { Item, Selection } from '../schemas/api';
import { isRecord } from '../values';
import { createMockAuth } from './auth';
import { message, problem } from './http';
import { RESERVED_KEYS, applyQuery, fieldsWithout, withTypeFields } from './items';
import type { MockBackendOptions, Values } from './types';

/** What every part of the mock backend shares: the definition, the items, and their helpers. */
export interface MockState {
    options: MockBackendOptions;
    definition: DefinitionInput;
    auth: ReturnType<typeof createMockAuth> | null;
    /** The items of each resource. */
    store: Map<string, Item[]>;
    /** The deleted items of the resources whose `delete` is undoable: their trash (decision 0063). */
    trash: Map<string, Item[]>;
    /** The path of the API, without its trailing slash. */
    basePath: string;
    freshId: (resource: ResourceInput) => string;
    makeItem: (resource: ResourceInput, values: Values) => Item;
    /** What the user gets of an item: without the values of the fields they can't see. */
    present: (resource: ResourceInput, item: Item) => Item;
    validationProblem: (
        resource: ResourceInput,
        values: Values,
        mode: 'create' | 'update',
        item?: Item,
    ) => Response | null;
    selectItems: (list: Item[], selection: Selection | undefined) => Item[];
}

export function createMockState(options: MockBackendOptions): MockState {
    const { definition, items = {} } = options;
    const auth = options.auth !== undefined ? createMockAuth(options.auth, definition.auth) : null;
    const store = new Map<string, Item[]>();
    // The deleted items of the resources whose `delete` is undoable: their trash (decision 0063).
    const trash = new Map<string, Item[]>();
    let nextId = 1;

    const abilitiesFor = (resource: ResourceInput) =>
        Object.fromEntries([
            ['view', true],
            ['update', true],
            ['duplicate', true],
            ['delete', true],
            ...(resource.actions ?? []).map((action) => [action.id, true]),
        ]);

    // An id that no item of the resource has, also among the items it started with
    const freshId = (resource: ResourceInput): string => {
        const items = store.get(resource.id) ?? [];
        let id = String(nextId++);
        while (items.some((item) => item.id === id)) {
            id = String(nextId++);
        }
        return id;
    };

    const makeItem = (resource: ResourceInput, values: Values): Item => {
        const id =
            typeof values.id === 'string' || typeof values.id === 'number'
                ? String(values.id)
                : freshId(resource);
        const rest = Object.fromEntries(
            Object.entries(values).filter(([key]) => !RESERVED_KEYS.has(key)),
        );
        const own = isRecord(values.abilities) ? (values.abilities as Record<string, boolean>) : {};
        return { ...rest, id, version: '1', abilities: { ...abilitiesFor(resource), ...own } };
    };

    // What the user gets of an item: without the values of the fields they can't see.
    const present = (resource: ResourceInput, item: Item): Item => {
        const hidden = fieldsWithout(withTypeFields(resource, item[ITEM_TYPE_KEY]), 'view');
        return hidden.size === 0
            ? item
            : (Object.fromEntries(
                  Object.entries(item).filter(([key]) => !hidden.has(key)),
              ) as Item);
    };

    definition.resources.forEach((resource) => {
        store.set(
            resource.id,
            (items[resource.id] ?? []).map((values) => makeItem(resource, values)),
        );
    });

    const basePath = new URL(definition.api.baseUrl, 'http://panneau.test').pathname.replace(
        /\/$/,
        '',
    );

    const validationProblem = (
        resource: ResourceInput,
        values: Values,
        mode: 'create' | 'update',
        item?: Item,
    ) => {
        // A partial update reads the conditions with the item's values (decision 0043).
        const failures = checkValues(resource.fields, values, {
            mode,
            partial: mode === 'update',
            locales: definition.locales,
            ...(item !== undefined ? { item } : {}),
        });
        const paths = Object.keys(failures);
        if (paths.length === 0) {
            return null;
        }
        return problem(422, 'The given data was invalid.', {
            type: 'urn:panneau:problem:validation',
            errors: Object.fromEntries(
                paths.map((path) => [path, (failures[path] ?? []).map(message)]),
            ),
        });
    };

    const selectItems = (list: Item[], selection: Selection | undefined): Item[] => {
        if (selection === undefined) {
            return [];
        }
        if ('ids' in selection) {
            const ids = selection.ids as string[];
            return list.filter((item) => ids.includes(item.id));
        }
        const except = selection.except ?? [];
        const { filter, q } = selection.query;
        const query: Pick<ListQuery, 'filter' | 'q'> = {};
        if (filter !== undefined) {
            query.filter = filter as NonNullable<ListQuery['filter']>;
        }
        if (q !== undefined) {
            query.q = q;
        }
        return applyQuery(list, query).filter((item) => !except.includes(item.id));
    };

    return {
        options,
        definition,
        auth,
        store,
        trash,
        basePath,
        freshId,
        makeItem,
        present,
        validationProblem,
        selectItems,
    };
}
