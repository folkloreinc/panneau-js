// Constants of the protocol. This module doesn't import zod, so that the main entry point stays
// light: see `src/index.ts`.

/** Built-in action ids. */
export const BUILT_IN_ACTIONS = [
    'show',
    'edit',
    'duplicate',
    'delete',
    'restore',
    'export',
    'import',
] as const;
export type BuiltInAction = (typeof BUILT_IN_ACTIONS)[number];

/**
 * Built-in `link` actions (decision 0040). Without a `url` or a `route`, the client resolves them
 * to its own routes, and labels them itself when they have no `label`.
 */
export const BUILT_IN_LINK_ACTIONS = ['show', 'edit'] as const;
export type BuiltInLinkAction = (typeof BUILT_IN_LINK_ACTIONS)[number];

/** Whether an action id is one of the built-in links, `show` and `edit`. */
export function isBuiltInLink(id: string): id is BuiltInLinkAction {
    return (BUILT_IN_LINK_ACTIONS as readonly string[]).includes(id);
}

/**
 * Built-in item actions, in their default order (decision 0040). Every resource has them without
 * declaring them, and clients show each one on the items whose abilities allow it
 * (`ITEM_ACTION_ABILITIES`). A resource's `itemActions` picks some of them, in its order.
 */
export const BUILT_IN_ITEM_ACTIONS = ['show', 'edit', 'duplicate', 'delete'] as const;
export type BuiltInItemAction = (typeof BUILT_IN_ITEM_ACTIONS)[number];

/** The ability of an item that each built-in item action needs: `true`, or the action is hidden. */
export const ITEM_ACTION_ABILITIES: Readonly<Record<BuiltInItemAction, string>> = {
    show: 'view',
    edit: 'update',
    duplicate: 'duplicate',
    delete: 'delete',
};

/** Whether an action id is one of the built-in item actions. */
export function isBuiltInItemAction(id: string): id is BuiltInItemAction {
    return (BUILT_IN_ITEM_ACTIONS as readonly string[]).includes(id);
}

/** Field types every Panneau frontend renders. Plugins add others. */
export const BUILT_IN_FIELD_TYPES = [
    'text',
    'textarea',
    'richtext',
    'number',
    'boolean',
    'date',
    'datetime',
    'time',
    'select',
    'email',
    'url',
    'color',
    'media',
    'image',
    'relation',
    'group',
    'repeater',
    'slug',
    'tel',
    'range',
    'duration',
    'json',
    'tags',
    'embed',
    'location',
] as const;
export type BuiltInFieldType = (typeof BUILT_IN_FIELD_TYPES)[number];

/** Validation rules that both frontends and backends check. */
export const PORTABLE_RULES = [
    'required',
    'min',
    'max',
    'pattern',
    'email',
    'url',
    'json',
    'in',
    'accept',
    'maxSize',
    'before',
    'after',
    'crop',
] as const;
export type PortableRule = (typeof PORTABLE_RULES)[number];

/** Layout node types every Panneau frontend renders. */
export const BUILT_IN_LAYOUT_NODE_TYPES = [
    'row',
    'column',
    'section',
    'tabs',
    'tab',
    'sidebar',
    'field',
    'text',
    'component',
] as const;
export type BuiltInLayoutNodeType = (typeof BUILT_IN_LAYOUT_NODE_TYPES)[number];

/** List layouts every Panneau frontend renders. Plugins add others. */
export const BUILT_IN_LIST_LAYOUTS = ['table', 'cards', 'gallery', 'calendar'] as const;
export type BuiltInListLayout = (typeof BUILT_IN_LIST_LAYOUTS)[number];

/**
 * Id of the element that holds the boot config in the page: a
 * `<script type="application/json" id="panneau-boot">` element whose text is the JSON object.
 */
export const BOOT_CONFIG_ELEMENT_ID = 'panneau-boot';

/** The elements a block style of a `richtext` field can apply to. */
export const RICH_TEXT_STYLE_ELEMENTS = [
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'ul',
    'ol',
    'li',
] as const;

/** An element a block style of a `richtext` field can apply to. */
export type RichTextStyleElement = (typeof RICH_TEXT_STYLE_ELEMENTS)[number];

/**
 * The first segments of the client routes under `basePath` that Panneau keeps for itself
 * (decision 0019). A param of the context can't be named like one: the context is a prefix of
 * the routes, `{basePath}/{name}/{value}/…` (decision 0045).
 */
export const RESERVED_ROUTE_SEGMENTS = [
    'resources',
    'pages',
    'media',
    'search',
    'account',
    'auth',
] as const;

/** The request header that carries the values of the current context (decision 0045). */
export const CONTEXT_HEADER = 'Panneau-Context';

/** The type of the `403` problem of a value of the context that the user can't use. */
export const CONTEXT_PROBLEM_TYPE = 'urn:panneau:problem:context';
