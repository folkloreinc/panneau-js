// What v4 code becomes in Panneau 5: the field components, the modules and their exports. The
// codemods only rewrite what these tables settle, and report the rest.
import { kebabCase } from './names';

/** A v5 field component that replaces a v4 one. */
export interface FieldTarget {
    /** Module of the v5 component. */
    source: string;
    /** Export of the v5 component. */
    name: string;
    /** Props of the v5 component besides those of every field (`FieldProps`). */
    props: readonly string[];
    /** v4 props that have another name in v5. */
    renames?: Readonly<Record<string, string>>;
    /** Props that give the v5 component the behavior of the v4 one (`widget="radios"`). */
    adds?: Readonly<Record<string, string | true | readonly string[]>>;
    /** The type of the value, for the input of a locale of a localized field in TypeScript. */
    valueType?: 'string' | 'number' | 'boolean';
    /** What to check after the rewrite, when the props of the v4 and v5 components differ. */
    note?: string;
}

/** Props of every v5 field (`FieldProps` of `@panneau/fields`), plus React's `key`. */
export const FIELD_PROPS: readonly string[] = [
    'key',
    'value',
    'onChange',
    'onBlur',
    'errors',
    'disabled',
    'readOnly',
    'required',
    'label',
    'description',
    'name',
    'id',
    'autoFocus',
    'aria-label',
    'className',
    'labelClassName',
    'descriptionClassName',
    'errorsClassName',
];

/** v4 props of every field with another name in v5. */
export const FIELD_RENAMES: Readonly<Record<string, string>> = { helpText: 'description' };

const TEXT_PROPS = [
    'placeholder',
    'maxLength',
    'prefix',
    'suffix',
    'type',
    'inputMode',
    'autoComplete',
    'controlClassName',
    'inputClassName',
];
const TEXT_RENAMES = { prepend: 'prefix', append: 'suffix' };
const SELECT_PROPS = ['options', 'placeholder', 'multiple', 'widget', 'controlClassName'];
const MEDIA_PROPS = [
    'accept',
    'adapter',
    'image',
    'itemTitle',
    'maxSize',
    'multiple',
    'refreshInterval',
    'resource',
    'sources',
    'stateKey',
    'uploadSource',
];
const MEDIA_NOTE = 'it needs `resource`, the id of the media library, and the `mediaPlugin`';

const text: FieldTarget = {
    source: '@panneau/fields/text',
    name: 'TextField',
    props: TEXT_PROPS,
    renames: TEXT_RENAMES,
    valueType: 'string',
};
const select: FieldTarget = {
    source: '@panneau/fields/select',
    name: 'SelectField',
    props: SELECT_PROPS,
};
const relation: FieldTarget = {
    source: '@panneau/fields/relation',
    name: 'RelationField',
    props: ['resource', 'multiple', 'onCreate', 'placeholder', 'source', 'controlClassName'],
    note: 'it searches the resource through the relation source of the app: `resource` is its id',
};
const media: FieldTarget = {
    source: '@panneau/media',
    name: 'MediaField',
    props: MEDIA_PROPS,
    note: MEDIA_NOTE,
};
const image: FieldTarget = {
    source: '@panneau/media',
    name: 'ImageField',
    props: [
        ...MEDIA_PROPS,
        'cropRequired',
        'enforceRatios',
        'focalPoint',
        'ratios',
        'rotate',
        'transformBase',
    ],
    note: MEDIA_NOTE,
};

/**
 * The v5 component of each v4 field, by the v4 id in kebab case: `useFieldComponent('date_time')`
 * and `@panneau/field-date-time` both give `date-time`, as v4 looked components up by their name
 * in Pascal case.
 */
export const FIELD_TARGETS: Readonly<Record<string, FieldTarget>> = {
    text,
    textarea: {
        source: '@panneau/fields/textarea',
        name: 'TextAreaField',
        valueType: 'string',
        props: ['maxLength', 'placeholder', 'rows', 'textAreaClassName'],
    },
    email: { ...text, source: '@panneau/fields/email', name: 'EmailField' },
    url: {
        source: '@panneau/fields/url',
        name: 'UrlField',
        valueType: 'string',
        props: [...TEXT_PROPS.filter((prop) => prop !== 'suffix'), 'defaultScheme'],
        renames: { prepend: 'prefix' },
    },
    telephone: { ...text, source: '@panneau/fields/tel', name: 'TelField' },
    tel: { ...text, source: '@panneau/fields/tel', name: 'TelField' },
    number: {
        source: '@panneau/fields/number',
        name: 'NumberField',
        valueType: 'number',
        props: [
            'controlClassName',
            'formatOptions',
            'inputClassName',
            'max',
            'min',
            'placeholder',
            'step',
            'suffix',
        ],
        renames: { append: 'suffix' },
    },
    color: {
        source: '@panneau/fields/color',
        name: 'ColorField',
        valueType: 'string',
        props: TEXT_PROPS.filter((prop) => !['type', 'prefix', 'maxLength'].includes(prop)),
    },
    date: {
        source: '@panneau/fields/date',
        name: 'DateField',
        valueType: 'string',
        props: ['controlClassName', 'max', 'min'],
    },
    'date-time': {
        source: '@panneau/fields/datetime',
        name: 'DateTimeField',
        valueType: 'string',
        props: ['controlClassName', 'hourCycle', 'timeZone', 'withSeconds'],
    },
    datetime: {
        source: '@panneau/fields/datetime',
        name: 'DateTimeField',
        valueType: 'string',
        props: ['controlClassName', 'hourCycle', 'timeZone', 'withSeconds'],
    },
    select,
    radios: { ...select, adds: { widget: 'radios' } },
    checkboxes: { ...select, adds: { multiple: true, widget: 'checkboxes' } },
    toggles: { ...select, adds: { multiple: true, widget: 'checkboxes' } },
    toggle: {
        source: '@panneau/fields/boolean',
        name: 'BooleanField',
        valueType: 'boolean',
        props: ['widget', 'controlClassName'],
        adds: { widget: 'switch' },
    },
    checkbox: {
        source: '@panneau/fields/boolean',
        name: 'BooleanField',
        valueType: 'boolean',
        props: ['widget', 'controlClassName'],
    },
    embed: {
        source: '@panneau/fields/embed',
        name: 'EmbedField',
        props: ['embedSource', 'placeholder'],
    },
    localized: {
        source: '@panneau/fields/localized',
        name: 'LocalizedField',
        props: ['children', 'localeClassName', 'locales'],
    },
    fields: {
        source: '@panneau/fields/group',
        name: 'GroupField',
        props: ['fields', 'fieldsClassName', 'path'],
        note: '`fields` are fields of the definition of Panneau 5 (`Field[]` of `@panneau/protocol`)',
    },
    items: {
        source: '@panneau/fields/repeater',
        name: 'RepeaterField',
        props: ['fields', 'itemClassName', 'max', 'min', 'path', 'types'],
        note: 'its items are made of fields of the definition of Panneau 5, or of block `types`',
    },
    item: relation,
    'resource-item': relation,
    upload: media,
    media,
    video: { ...media, adds: { accept: ['video/*'] } },
    audio: { ...media, adds: { accept: ['audio/*'] } },
    document: media,
    image,
    'image-upload': image,
    'video-upload': { ...media, adds: { accept: ['video/*'] } },
    'audio-upload': { ...media, adds: { accept: ['audio/*'] } },
    'document-upload': media,
};

/** v4 fields with no v5 component, and what replaces them. */
export const FIELDS_WITHOUT_TARGET: Readonly<Record<string, string>> = {
    html: 'the `richtext` field of `@panneau/editor` replaces it',
    password: 'Panneau 5 has no password field',
    autocomplete: 'Panneau 5 has no autocomplete field: a `select` or a `relation` replaces it',
    display: 'Panneau 5 has no display field: read-only fields (`readOnly`) replace it',
    'input-group':
        'Panneau 5 has no input group: the `prefix` and `suffix` of text fields replace it',
    import: 'Panneau 5 has no import field: the `import` action replaces it',
};

/** The v5 component of a v4 field id (`date_time`, `DateTime`, `date-time`). */
export function getFieldTarget(id: string): FieldTarget | null {
    return FIELD_TARGETS[kebabCase(id)] ?? null;
}

/** v4 namespaces of the `components` prop of the app, and the kinds of v5 plugins. */
export const NAMESPACES: Readonly<
    Record<string, { kind: string | null; note?: string; constant: string }>
> = {
    fields: { kind: 'fields', constant: 'FIELDS_NAMESPACE' },
    displays: {
        kind: 'displays',
        constant: 'DISPLAYS_NAMESPACE',
        note: 'displays of Panneau 5 get `value`, `item`, `field` and `column` (`DisplayProps` of `@panneau/lists`)',
    },
    actions: {
        kind: 'actions',
        constant: 'ACTIONS_NAMESPACE',
        note: 'actions of Panneau 5 are handlers of `client` actions of the definition, not buttons: see decision 0017',
    },
    pages: {
        kind: 'pages',
        constant: 'PAGES_NAMESPACE',
        note: 'pages of Panneau 5 render inside the shell of the app: drop `MainLayout` and `PageHeader`',
    },
    previews: {
        kind: 'previews',
        constant: 'PREVIEWS_NAMESPACE',
        note: 'previews of Panneau 5 get `PreviewProps` of `@panneau/core`',
    },
    lists: {
        kind: 'listLayouts',
        constant: 'LISTS_NAMESPACE',
        note: 'list layouts of Panneau 5 render the list state of `@panneau/lists`',
    },
    forms: { kind: null, constant: 'FORMS_NAMESPACE' },
    filters: { kind: null, constant: 'FILTERS_NAMESPACE' },
    modals: { kind: null, constant: 'MODALS_NAMESPACE' },
    buttons: { kind: null, constant: 'BUTTONS_NAMESPACE' },
    app: { kind: null, constant: 'APP_NAMESPACE' },
};

/** The namespace of a constant of `@panneau/core/contexts` (`FIELDS_NAMESPACE`). */
export function getNamespaceOfConstant(constant: string): string | null {
    return (
        Object.entries(NAMESPACES).find(([, namespace]) => namespace.constant === constant)?.[0] ??
        null
    );
}

/**
 * Packages of v4 that have a package of the same name in v5. Their main entry point is v5 for
 * every name but those listed here, which only v4 exported (`default` is the default export).
 */
export const SHARED_PACKAGES: Readonly<Record<string, readonly string[]>> = {
    '@panneau/actions': ['default'],
    '@panneau/app': [
        'default',
        'MainLayout',
        'GuestLayout',
        'PageHeader',
        'ResourceFilters',
        'ResourceItemsList',
        'ResourceForm',
    ],
    '@panneau/auth': [
        'default',
        'AuthProvider',
        'useAuth',
        'useUser',
        'useSetUser',
        'useLogout',
        'useLoggedIn',
        'useAuthCheck',
        'useAuthLogin',
        'useAuthLogout',
        'useAuthRegister',
        'useAuthRequestPassword',
        'useAuthResetPassword',
    ],
    '@panneau/core': [
        'default',
        'ComponentsManager',
        'DefinitionsManager',
        'EventsManager',
        'FieldsManager',
        'FontsParser',
        'FormsManager',
        'MediasParser',
        'Tracking',
        // Types of v4. `Form` and `FormStatus` are left out: v5 exports types of the same names.
        'Action',
        'ActionDefinition',
        'ActionValue',
        'AudioMedia',
        'Breadcrumb',
        'BreakpointsSize',
        'Button',
        'ButtonElement',
        'ButtonSize',
        'ButtonTheme',
        'ButtonType',
        'Column',
        'ComponentsMap',
        'ControlSize',
        'Definition',
        'DialogSize',
        'DropdownAlign',
        'Feedback',
        'Field',
        'FieldDefinition',
        'FieldOption',
        'FieldSettings',
        'Filter',
        'Font',
        'FormDefinition',
        'FormError',
        'ImageMedia',
        'Item',
        'Label',
        'Media',
        'MediaFile',
        'MediaType',
        'MenuItem',
        'Message',
        'MessageValue',
        'MessageValues',
        'Modal',
        'PageDefinition',
        'Pagination',
        'PanneauAuth',
        'PanneauComponents',
        'PanneauDefinition',
        'PanneauIntl',
        'PanneauIntlValues',
        'PanneauMenuItem',
        'PanneauMenus',
        'PanneauPages',
        'PanneauTheme',
        'Preview',
        'Resource',
        'ResourceForm',
        'ResourceForms',
        'ResourceIndex',
        'ResourceIntl',
        'ResourceIntlValues',
        'ResourceItem',
        'ResourcePages',
        'ResourceType',
        'RouteDefinition',
        'Routes',
        'SelectOption',
        'StatusCode',
        'TableColumn',
        'Toggle',
        'TrackingVariables',
        'TriggerUpdate',
        'Uppy',
        'User',
        'VideoMedia',
    ],
    '@panneau/data': [
        'default',
        'Api',
        'BaseApi',
        'DataProvider',
        'ApiProvider',
        'useApi',
        'QueryProvider',
        'useQueryContext',
        'useItem',
        'useItems',
        'UseItemsResponse',
        'useResourceDestroy',
        'useResourceItem',
        'useResourceItems',
        'useResourceStore',
        'useResourceUpdate',
        'useResourceClone',
        'useResourceRestore',
    ],
    '@panneau/fields': ['default'],
    '@panneau/forms': ['default'],
    '@panneau/intl': [
        'default',
        'IntlManager',
        'IntlProvider',
        'ResourceMessage',
        'useResourceValues',
    ],
    '@panneau/lists': ['default'],
};

/** Packages that only exist in v4. Their imports are rewritten or reported. */
export function isV4Package(name: string): boolean {
    return (
        /^@panneau\/(action|display|element|field|filter|form|list|modal)-/.test(name) ||
        [
            '@panneau/ckeditor',
            '@panneau/displays',
            '@panneau/filters',
            '@panneau/form',
            '@panneau/medias',
            '@panneau/modals',
            '@panneau/panneau',
            '@panneau/themes',
            '@panneau/uppy',
        ].includes(name)
    );
}

/** What replaces v4 exports, by module and name, for the messages of the report. */
export const REPLACEMENTS: Readonly<Record<string, Readonly<Record<string, string>>>> = {
    '@panneau/core/contexts': {
        usePanneauResource:
            '`useResource(id)` of `@panneau/core` gives `{ resource, form, list }`: the fields of the resource are `resource.fields`, fields of the protocol',
        usePanneauResources:
            '`useDefinition()` of `@panneau/data/query` gives the definition, with its `resources`',
        useResource:
            'a field of Panneau 5 gets its values from its props: `useResource(id)` of `@panneau/core` resolves a resource of the definition',
        useUrlGenerator:
            'Panneau 5 has no named routes: link to `{basePath}/resources/{resource}/{id}` (decision 0019), or run a resource action',
        usePanneau:
            '`usePanneau()` of `@panneau/core` gives the definition and the plugins: custom keys of the definition move to `settings` of the resources or fields',
        useFormSetValue:
            '`useFormContext().setValue(path, value)` of `@panneau/forms` sets the value of another field',
        useForm:
            'a field of Panneau 5 reads its form through `useFormContext()` of `@panneau/forms`',
        useLocales: '`useFieldsContext().locales` of `@panneau/fields`',
        useListComponent:
            'list layouts come from plugins (`listLayouts`); `ListView` of `@panneau/lists` renders one',
        useModalComponent: '`Dialog` of `@panneau/ui`',
        useDisplayComponent:
            'displays come from plugins (`displays`); `@panneau/lists` exports the built-in ones',
        ResourceProvider: 'Panneau 5 has no resource context: pass the resource id as a prop',
    },
    '@panneau/data': {
        useResourceItems:
            '`useResourceList(resource, query)` of `@panneau/data/query`: its `data.data` are the items, and the query is a list query of the protocol (`page`, `perPage`, `filter`)',
        useResourceItem:
            '`useResourceItem(resource, id)` of `@panneau/data/query`: its `data` is the item',
        useItems: '`useResourceList(resource, query)` of `@panneau/data/query`',
        useItem: '`useResourceItem(resource, id)` of `@panneau/data/query`',
    },
    '@panneau/app': {
        MainLayout: 'pages of Panneau 5 render inside the shell of the app: drop the layout',
        PageHeader:
            'pages of Panneau 5 render inside the shell of the app, which shows their title',
        ResourceItemsList:
            '`ListView` of `@panneau/lists`, with `useResourceList()` of `@panneau/data/query`',
        ResourceForm: '`FormView` of `@panneau/forms`',
    },
    '@panneau/medias': {
        MediasBrowserProvider:
            'the media field and picker of `@panneau/media` (`mediaPlugin`) browse the media libraries through the adapter',
    },
    '@panneau/intl': {
        default: 'messages come with the packages and with plugins (`locales`)',
        useResourceValues: 'labels of resources come from the definition, already translated',
    },
    '@panneau/element-button': {
        default:
            '`Button` of `@panneau/ui` (`variant` and `tone` instead of `theme`, Lucide icons)',
    },
    '@panneau/element-buttons': { default: '`Inline` and `Button` of `@panneau/ui`' },
    '@panneau/element-modal': { default: '`Dialog` of `@panneau/ui`' },
    '@panneau/modal-dialog': { default: '`Dialog` of `@panneau/ui`' },
    '@panneau/element-card': { default: '`Card` of `@panneau/ui`' },
    '@panneau/element-alert': { default: '`Alert` of `@panneau/ui`' },
    '@panneau/element-loading': {
        default:
            '`Skeleton` of `@panneau/ui` while content loads, `Spinner` for an operation in progress',
    },
    '@panneau/element-icon': { default: '`Icon` of `@panneau/ui`, with Lucide icons' },
    '@panneau/element-label': { default: 'labels are given to fields and primitives as `label`' },
    '@panneau/element-select': {
        default: '`Select` of `@panneau/ui`, or `SelectField` of `@panneau/fields/select`',
    },
    '@panneau/element-radios': { default: '`RadioGroup` of `@panneau/ui`' },
    '@panneau/element-range': { default: '`Slider` of `@panneau/ui`' },
    '@panneau/element-table': { default: '`ListView` of `@panneau/lists`' },
    '@panneau/form': { default: '`Form` of `@panneau/forms`, with fields of the protocol' },
};
