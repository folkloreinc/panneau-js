import type { Action, ActionPlacement, Column, Field, Filter, Resource } from '@panneau/protocol';

import { canRunAction, getActionPlacements } from './abilities';

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
    const fields = resource.fields.filter((field) => !NON_COLUMN_TYPES.has(field.type));
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

/**
 * Resolves the list of a resource. Without columns, it shows the item title and the next fields
 * (up to four, skipping groups, repeaters and rich text).
 */
export function resolveList(resource: Resource): ResolvedList {
    const list = resource.list ?? {};
    const fields = new Map(resource.fields.map((field) => [field.name, field]));
    const sorts = list.sorts ?? [];
    const columns = (list.columns ?? columnsFromFields(resource)).map((column): ResolvedColumn => {
        const field = column.field !== undefined ? (fields.get(column.field) ?? null) : null;
        const id = column.id ?? column.field ?? '';
        const resolved: ResolvedColumn = {
            id,
            field,
            label: column.label ?? field?.label ?? id,
            display: column.display ?? field?.display ?? field?.type ?? null,
            sortable:
                column.sortable ?? (column.field !== undefined && sorts.includes(column.field)),
        };
        if (column.width !== undefined) {
            resolved.width = column.width;
        }
        if (column.align !== undefined) {
            resolved.align = column.align;
        }
        return resolved;
    });
    const actions = groupActions(resource.actions ?? []);
    const hasSelectionAction = (resource.actions ?? []).some(
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
        inlineEdit: list.inlineEdit ?? [],
        selectable: (list.selectable ?? true) && hasSelectionAction,
        actions,
    };
}
