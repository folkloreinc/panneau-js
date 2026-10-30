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
