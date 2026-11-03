import type { Action, ActionPlacement, Column, Field, Filter, Resource } from '@panneau/protocol';
import {
    BUILT_IN_ITEM_ACTIONS,
    type BuiltInItemAction,
    isBuiltInItemAction,
} from '@panneau/protocol/runtime';

import { canRunAction, canUpdateField, canViewField, getActionPlacements } from './abilities';

/** A column ready to render. */
export interface ResolvedColumn {
    /** The column id: its `id`, or the name of its field. */
    id: string;
    /** The field shown, when the column shows one. */
    field: Field | null;
    label: string;
    /** How the value is displayed: the column's display, the field's, or the field type. */
    display: string | null;
    sortable: boolean;
    width?: number | string;
    align?: 'start' | 'center' | 'end';
    /** Not shown until the user shows it (decision 0042). */
    hidden: boolean;
    /** Whether the user can hide it. */
    hideable: boolean;
}

/** A list ready to render. */
export interface ResolvedList {
    columns: ResolvedColumn[];
    filters: Filter[];
    /** Fields the list can be sorted by. */
    sorts: string[];
    /** The default sort, as `sort` query values (`['-published_at', 'title']`). */
    defaultSort: string[];
    /** Whether the list can be searched (`q`). */
    search: boolean;
    /** List layouts, the first one being the default. */
    layouts: string[];
    perPage: number;
    perPageOptions: number[];
    /** `pages` (numbered, with a total), or `cursor`: the list follows the cursors of its pages. */
    pagination: 'pages' | 'cursor';
    /** Fields editable in the list. */
    inlineEdit: string[];
    /** Whether items can be selected: the list allows it and a selection action exists. */
    selectable: boolean;
    /** Actions the user can run, by placement. */
    actions: Record<ActionPlacement, Action[]>;
}

/** Fields shown when the list declares no columns. */
const DEFAULT_COLUMN_COUNT = 4;
const NON_COLUMN_TYPES = new Set(['group', 'repeater', 'richtext']);

export const DEFAULT_PER_PAGE = 20;

function columnsFromFields(resource: Resource): Column[] {
    const title = resource.itemTitle;
    const fields = resource.fields.filter(
        (field) => !NON_COLUMN_TYPES.has(field.type) && canViewField(field),
    );
    const ordered =
        title !== undefined
            ? [
                  ...fields.filter((field) => field.name === title),
                  ...fields.filter((field) => field.name !== title),
              ]
            : fields;
    return ordered.slice(0, DEFAULT_COLUMN_COUNT).map((field) => ({ field: field.name }));
}

/** Groups the actions the user can run by placement. */
export function groupActions(actions: readonly Action[]): Record<ActionPlacement, Action[]> {
    const groups: Record<ActionPlacement, Action[]> = { row: [], toolbar: [], form: [], menu: [] };
    actions.filter(canRunAction).forEach((action) => {
        getActionPlacements(action).forEach((placement) => groups[placement].push(action));
    });
    return groups;
}

/** The built-in item actions, as the client shows them when a resource doesn't replace them. */
const BUILT_IN_ITEM_ACTION_DEFINITIONS: Readonly<Record<BuiltInItemAction, Action>> = {
    show: { id: 'show', kind: 'link', scope: ['item'], placement: ['row', 'form'] },
    edit: { id: 'edit', kind: 'link', scope: ['item'], placement: ['row', 'form'] },
    duplicate: { id: 'duplicate', kind: 'server', scope: ['item'], placement: ['menu', 'form'] },
    delete: {
        id: 'delete',
        kind: 'server',
        scope: ['item', 'selection'],
        placement: ['menu', 'toolbar', 'form'],
        destructive: true,
        confirm: true,
        dryRun: true,
    },
};

/**
 * The actions of a resource (decision 0040): its built-in item actions (`show`, `edit`,
 * `duplicate`, `delete`, or those of its `itemActions`, in their order), then the actions it
 * declares. A declared action with the id of a built-in one replaces it, at its place, with the
 * built-in one's placement, confirmation, `destructive` and `dryRun` when it doesn't set them, and
 * is left out with it when `itemActions` doesn't list it. With `"open": "edit"`, `show` is left out: it
 * would go to the edit form too. Abilities of the items then hide what they don't allow.
 */
export function getResourceActions(resource: Resource): Action[] {
    const declared = resource.actions ?? [];
    const ids = (resource.itemActions ?? BUILT_IN_ITEM_ACTIONS).filter(
        (id, index, all): id is BuiltInItemAction =>
            isBuiltInItemAction(id) &&
            all.indexOf(id) === index &&
            !(id === 'show' && getOpenMode(resource) === 'edit'),
    );
    return [
        ...ids.map((id): Action => {
            const replacement = declared.find((action) => action.id === id);
            // What the declared action doesn't set (placement, confirmation, dry runs) is the
            // built-in one's.
            return replacement !== undefined
                ? { ...BUILT_IN_ITEM_ACTION_DEFINITIONS[id], ...replacement }
                : BUILT_IN_ITEM_ACTION_DEFINITIONS[id];
        }),
        ...declared.filter((action) => !isBuiltInItemAction(action.id)),
    ];
}

/**
 * Where the title of an item goes (`open` of the resource, decision 0040): `panel`, the show route
 * with the item's details next to the list, or `edit`, its form. A value it doesn't know is `panel`.
 */
export function getOpenMode(resource: Resource): 'panel' | 'edit' {
    return resource.open === 'edit' ? 'edit' : 'panel';
}

/**
 * Resolves the list of a resource. Without columns, it shows the item title and the next fields
 * (up to four, skipping groups, repeaters and rich text). Fields the current user can't see
 * (`abilities.view: false`) have no column, sort or inline editing, and those they can't edit
 * aren't edited inline (decision 0046).
 */
export function resolveList(resource: Resource): ResolvedList {
    const list = resource.list ?? {};
    const fields = new Map(resource.fields.map((field) => [field.name, field]));
    const hidden = new Set(
        resource.fields.filter((field) => !canViewField(field)).map((field) => field.name),
    );
    const sorts = (list.sorts ?? []).filter((sort) => !hidden.has(sort));
    const declaredColumns = (list.columns ?? columnsFromFields(resource)).filter(
        (column) => column.field === undefined || !hidden.has(column.field),
    );
    const columns = declaredColumns.map((column): ResolvedColumn => {
        const field = column.field !== undefined ? (fields.get(column.field) ?? null) : null;
        const id = column.id ?? column.field ?? '';
        const resolved: ResolvedColumn = {
            id,
            field,
            label: column.label ?? field?.label ?? id,
            display: column.display ?? field?.display ?? field?.type ?? null,
            sortable:
                column.sortable ?? (column.field !== undefined && sorts.includes(column.field)),
            hidden: column.hidden === true && column.hideable !== false,
            hideable: column.hideable !== false,
        };
        if (column.width !== undefined) {
            resolved.width = column.width;
        }
        if (column.align !== undefined) {
            resolved.align = column.align;
        }
        return resolved;
    });
    const actions = groupActions(getResourceActions(resource));
    const hasSelectionAction = getResourceActions(resource).some(
        (action) => action.scope.includes('selection') && canRunAction(action),
    );
    return {
        columns,
        filters: list.filters ?? [],
        sorts,
        defaultSort: (list.defaultSort ?? '').split(',').filter((part) => part !== ''),
        search: list.search ?? false,
        layouts: list.layouts ?? ['table'],
        perPage: list.perPage ?? DEFAULT_PER_PAGE,
        perPageOptions: list.perPageOptions ?? [],
        pagination: list.pagination ?? 'pages',
        inlineEdit: (list.inlineEdit ?? []).filter((name) => {
            const field = fields.get(name);
            return field === undefined || canUpdateField(field);
        }),
        selectable: (list.selectable ?? true) && hasSelectionAction,
        actions,
    };
}
