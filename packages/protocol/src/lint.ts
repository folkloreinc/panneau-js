import { parseAggregateGroup, parseAggregateMeasure } from './aggregates';
import { DASHBOARD_COMPONENT, HOME_PAGE } from './dashboards';
import { ITEM_TYPE_KEY } from './resourceTypes';
import type { DefinitionInput, Field, LayoutNode, ResourceInput, Widget } from './schemas';
import type { ValidationIssue } from './validate';
import {
    GROUPED_WIDGET_TYPES,
    RESOURCE_WIDGET_TYPES,
    WIDGET_RESERVED_QUERY_PARAMS,
    isBuiltInWidgetType,
} from './widgets';

function fieldNames(fields: Field[]): Set<string> {
    return new Set(fields.map((field) => field.name));
}

function checkLayout(
    nodes: LayoutNode[],
    names: Set<string>,
    path: string,
    issues: ValidationIssue[],
) {
    nodes.forEach((node, index) => {
        const nodePath = `${path}.${index}`;
        if (node.type === 'field') {
            if (node.name === undefined) {
                issues.push({ path: nodePath, message: 'A `field` node needs a `name`.' });
            } else if (!names.has(node.name)) {
                issues.push({
                    path: `${nodePath}.name`,
                    message: `No field named \`${node.name}\`.`,
                });
            }
        }
        if (node.type === 'component' && node.component === undefined) {
            issues.push({ path: nodePath, message: 'A `component` node needs a `component`.' });
        }
        if (node.type === 'tabs' && node.children?.some((child) => child.type !== 'tab')) {
            issues.push({
                path: `${nodePath}.children`,
                message: 'The children of `tabs` must be `tab` nodes.',
            });
        }
        if (node.children !== undefined) {
            checkLayout(node.children, names, `${nodePath}.children`, issues);
        }
    });
}

/**
 * The types of a resource (decision 0077): unique ids, fields named apart from those of the
 * resource, and no field `type` in the form, which holds the item's type.
 */
function checkTypes(
    resource: ResourceInput,
    names: Set<string>,
    path: string,
    issues: ValidationIssue[],
) {
    const ids = new Set<string>();
    (resource.types ?? []).forEach((type, index) => {
        const typePath = `${path}.types.${index}`;
        if (ids.has(type.id)) {
            issues.push({ path: `${typePath}.id`, message: `Duplicate type id \`${type.id}\`.` });
        }
        ids.add(type.id);
        const own = fieldNames(type.fields);
        if (own.size !== type.fields.length) {
            issues.push({ path: `${typePath}.fields`, message: 'Field names must be unique.' });
        }
        type.fields.forEach((field, fieldIndex) => {
            if (names.has(field.name)) {
                issues.push({
                    path: `${typePath}.fields.${fieldIndex}.name`,
                    message: `The resource already has a field named \`${field.name}\`.`,
                });
            } else if (field.name === ITEM_TYPE_KEY) {
                issues.push({
                    path: `${typePath}.fields.${fieldIndex}.name`,
                    message: `\`${ITEM_TYPE_KEY}\` holds the type of the item.`,
                });
            }
        });
    });
    const typeField = resource.fields.findIndex((field) => field.name === ITEM_TYPE_KEY);
    if (ids.size > 0 && typeField !== -1 && resource.fields[typeField]?.notInForm !== true) {
        issues.push({
            path: `${path}.fields.${typeField}`,
            message: `\`${ITEM_TYPE_KEY}\` holds the type of the item, set when it is created: its field must be \`notInForm\`.`,
        });
    }
}

/** The fields of a resource and of its types, with their paths. */
function allFields(resource: ResourceInput, path: string): { field: Field; path: string }[] {
    return [
        ...resource.fields.map((field, index) => ({ field, path: `${path}.fields.${index}` })),
        ...(resource.types ?? []).flatMap((type, typeIndex) =>
            type.fields.map((field, index) => ({
                field,
                path: `${path}.types.${typeIndex}.fields.${index}`,
            })),
        ),
    ];
}

/** Field types whose values can be summed: numbers, and amounts of `money` of one currency. */
const SUMMABLE_TYPES = ['number', 'range', 'duration', 'money'];
/** Field types whose days can be grouped by. */
const DATE_TYPES = ['date', 'datetime'];
/** Field types whose values are structures that can't be grouped by. */
const UNGROUPABLE_TYPES = [
    'richtext',
    'media',
    'image',
    'file',
    'group',
    'repeater',
    'json',
    'embed',
    'location',
    'address',
    'link',
    'daterange',
    'money',
];

/**
 * The aggregates of a list (decision 0084): each one names a field of the resource that the user
 * can view, `sum` a number or `money` of one currency, `dates` a date, `groupBy` a value.
 */
function checkAggregates(resource: ResourceInput, path: string, issues: ValidationIssue[]) {
    const aggregates = resource.list?.aggregates;
    if (aggregates === undefined) {
        return;
    }
    const fields = allFields(resource, path).map(({ field }) => field);
    const check = (key: 'sum' | 'groupBy' | 'dates', accepts: (field: Field) => string | null) => {
        (aggregates[key] ?? []).forEach((name, index) => {
            const issuePath = `${path}.list.aggregates.${key}.${index}`;
            const field = fields.find((candidate) => candidate.name === name);
            const message =
                field === undefined
                    ? `No field named \`${name}\`.`
                    : field.abilities?.view === false
                      ? `The user can't view \`${name}\`: it can't be aggregated.`
                      : accepts(field);
            if (message !== null) {
                issues.push({ path: issuePath, message });
            }
        });
    };
    check('sum', (field) => {
        if (!SUMMABLE_TYPES.includes(field.type)) {
            return `\`${field.name}\` can't be summed: only \`number\`, \`range\`, \`duration\` and \`money\` fields can.`;
        }
        const currency = (field.settings as { currency?: unknown } | undefined)?.currency;
        return field.type === 'money' && typeof currency !== 'string'
            ? `\`${field.name}\` can't be summed: amounts add up only in one \`currency\`.`
            : null;
    });
    check('dates', (field) =>
        DATE_TYPES.includes(field.type)
            ? null
            : `\`${field.name}\` must be a \`date\` or a \`datetime\` to be grouped by period.`,
    );
    check('groupBy', (field) =>
        UNGROUPABLE_TYPES.includes(field.type)
            ? `The items can't be grouped by a \`${field.type}\` field.`
            : null,
    );
}

function checkResource(resource: ResourceInput, path: string, issues: ValidationIssue[]) {
    const names = fieldNames(resource.fields);
    if (names.size !== resource.fields.length) {
        issues.push({ path: `${path}.fields`, message: 'Field names must be unique.' });
    }
    checkTypes(resource, names, path, issues);
    if (resource.form?.layout !== undefined) {
        // The layout can name the fields of the types: the forms of the other types leave them out.
        const typeNames = (resource.types ?? []).flatMap((type) => [...fieldNames(type.fields)]);
        checkLayout(
            resource.form.layout,
            new Set([...names, ...typeNames]),
            `${path}.form.layout`,
            issues,
        );
    }
    (resource.list?.columns ?? []).forEach((column, index) => {
        if (column.field !== undefined && !names.has(column.field)) {
            issues.push({
                path: `${path}.list.columns.${index}.field`,
                message: `No field named \`${column.field}\`.`,
            });
        }
    });
    const calendar = resource.list?.calendar;
    if (calendar !== undefined) {
        const field = resource.fields.find((candidate) => candidate.name === calendar.field);
        const filter = calendar.filter ?? calendar.field;
        if (field === undefined) {
            issues.push({
                path: `${path}.list.calendar.field`,
                message: `No field named \`${calendar.field}\`.`,
            });
        } else if (!['date', 'datetime', 'daterange'].includes(field.type)) {
            issues.push({
                path: `${path}.list.calendar.field`,
                message: 'The field of a calendar must be a `date`, a `datetime` or a `daterange`.',
            });
        }
        if (
            !(resource.list?.filters ?? []).some(
                (candidate) => candidate.id === filter && candidate.type === 'date-range',
            )
        ) {
            issues.push({
                path: `${path}.list.calendar`,
                message: `The calendar needs a \`date-range\` filter \`${filter}\` in the list.`,
            });
        }
    }
    checkAggregates(resource, path, issues);
    (resource.actions ?? []).forEach((action, index) => {
        if (action.layout !== undefined) {
            checkLayout(
                action.layout,
                fieldNames(action.fields ?? []),
                `${path}.actions.${index}.layout`,
                issues,
            );
        }
    });
    if (resource.kind === 'media') {
        const file = resource.fields.findIndex((field) => field.name === 'file');
        const field = resource.fields[file];
        if (field === undefined) {
            issues.push({
                path: `${path}.fields`,
                message: 'A resource of kind `media` needs a `file` field.',
            });
        } else if (field.type !== 'file' || field.multiple === true) {
            issues.push({
                path: `${path}.fields.${file}`,
                message: 'The `file` field of a `media` resource must be a single `file`.',
            });
        }
    }
    allFields(resource, path).forEach(({ field, path: fieldPath }) => {
        if (field.type === 'relation' && field.resource === undefined) {
            issues.push({
                path: `${fieldPath}.resource`,
                message: 'A `relation` field needs a `resource`.',
            });
        } else if (field.type === 'relation' && Array.isArray(field.resource)) {
            issues.push({
                path: `${fieldPath}.resource`,
                message: 'A `relation` field names one resource.',
            });
        }
    });
}

/**
 * Checks what the schema can't: references between parts of a definition (layout nodes and
 * columns that name existing fields, relations, `media` and `image` fields that name a resource,
 * unique names), the types of resources, and the `file` field of `media` resources.
 */
export function lintDefinition(definition: DefinitionInput): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const resourceIds = new Set(definition.resources.map((resource) => resource.id));
    const libraries = definition.resources
        .filter((resource) => resource.kind === 'media')
        .map((resource) => resource.id);
    definition.resources.forEach((resource, index) => {
        checkResource(resource, `resources.${index}`, issues);
        allFields(resource, `resources.${index}`).forEach(({ field, path }) => {
            if (
                field.type === 'relation' &&
                typeof field.resource === 'string' &&
                !resourceIds.has(field.resource)
            ) {
                issues.push({
                    path: `${path}.resource`,
                    message: `No resource \`${field.resource}\`.`,
                });
            }
            if (field.type === 'media' || field.type === 'image') {
                const fieldPath = `${path}.resource`;
                if (field.resource === undefined) {
                    // Every library of the definition (decision 0027).
                    if (libraries.length === 0) {
                        issues.push({
                            path: fieldPath,
                            message: `${field.type === 'image' ? 'An' : 'A'} \`${field.type}\` field needs a resource of kind \`media\`.`,
                        });
                    }
                } else {
                    const named =
                        typeof field.resource === 'string' ? [field.resource] : field.resource;
                    named.forEach((id, idIndex) => {
                        if (!libraries.includes(id)) {
                            issues.push({
                                path:
                                    typeof field.resource === 'string'
                                        ? fieldPath
                                        : `${fieldPath}.${String(idIndex)}`,
                                message: `No resource of kind \`media\` named \`${id}\`.`,
                            });
                        }
                    });
                }
            }
        });
    });
    checkDashboards(definition, issues);
    return issues;
}

/**
 * The dashboards (decision 0084): the widgets of each page whose component is the built-in
 * `dashboard`, and those of `dashboard`, the shorthand of the home page, unless `pages.home` has
 * its own, which can't come with them. Only a `dashboard` page has widgets.
 */
function checkDashboards(definition: DefinitionInput, issues: ValidationIssue[]) {
    Object.entries(definition.pages ?? {}).forEach(([id, page]) => {
        if (page.widgets === undefined) {
            return;
        }
        if (page.component !== DASHBOARD_COMPONENT) {
            issues.push({
                path: `pages.${id}.widgets`,
                message: `Only a \`${DASHBOARD_COMPONENT}\` page has widgets.`,
            });
            return;
        }
        checkWidgets(definition, page.widgets, `pages.${id}.widgets`, issues);
    });
    if (definition.dashboard === undefined) {
        return;
    }
    const home = definition.pages?.[HOME_PAGE];
    if (home?.component === DASHBOARD_COMPONENT && home.widgets !== undefined) {
        if (definition.dashboard.widgets.length > 0) {
            issues.push({
                path: 'dashboard.widgets',
                message: `\`pages.${HOME_PAGE}.widgets\` replaces them: set only one.`,
            });
        }
        return;
    }
    checkWidgets(definition, definition.dashboard.widgets, 'dashboard.widgets', issues);
}

const FILTER_PARAM = /^filter\[([^\]]+)\]/;

/** The settings of a widget that go with a `resource`. */
const RESOURCE_SETTINGS = ['query', 'measure', 'group', 'target'] as const;

/**
 * The measure and the group of a widget on a resource (decision 0084): a `sum:` and a group name
 * aggregates of its list, a `series` needs a period of a date, a `breakdown` a field of `groupBy`,
 * and a `list` has neither.
 */
function checkAggregateSettings(
    widget: { type: string; settings?: Record<string, unknown> | undefined },
    resource: ResourceInput,
    path: string,
    issues: ValidationIssue[],
) {
    const settings = widget.settings ?? {};
    const aggregates = resource.list?.aggregates ?? {};
    const grouped = (GROUPED_WIDGET_TYPES as readonly string[]).includes(widget.type);
    if (widget.type === 'list') {
        ['measure', 'group'].forEach((key) => {
            if (settings[key] !== undefined) {
                issues.push({
                    path: `${path}.settings.${key}`,
                    message: `A \`list\` shows items: it has no \`${key}\`.`,
                });
            }
        });
        return;
    }
    if (settings.measure !== undefined) {
        const measure =
            typeof settings.measure === 'string' ? parseAggregateMeasure(settings.measure) : null;
        if (measure === null) {
            issues.push({
                path: `${path}.settings.measure`,
                message: 'The measure must be `count` or `sum:{field}`.',
            });
        } else if (measure.type === 'sum' && !(aggregates.sum ?? []).includes(measure.field)) {
            issues.push({
                path: `${path}.settings.measure`,
                message: `The list of \`${resource.id}\` can't sum \`${measure.field}\`: it isn't in the \`sum\` of its aggregates.`,
            });
        }
    }
    if (!grouped) {
        if (settings.group !== undefined) {
            issues.push({
                path: `${path}.settings.group`,
                message: `A \`${widget.type}\` isn't grouped: only a \`series\` and a \`breakdown\` are.`,
            });
        }
        return;
    }
    const group = typeof settings.group === 'string' ? parseAggregateGroup(settings.group) : null;
    if (widget.type === 'series') {
        if (group?.type !== 'period') {
            issues.push({
                path: `${path}.settings.group`,
                message:
                    'A `series` on a resource needs a `group` on the period of a date: `day:created_at`.',
            });
        } else if (!(aggregates.dates ?? []).includes(group.field)) {
            issues.push({
                path: `${path}.settings.group`,
                message: `The list of \`${resource.id}\` can't group by \`${group.field}\`: it isn't in the \`dates\` of its aggregates.`,
            });
        }
        return;
    }
    if (group?.type !== 'field') {
        issues.push({
            path: `${path}.settings.group`,
            message: 'A `breakdown` on a resource needs a `group` on a field: `status`.',
        });
    } else if (!(aggregates.groupBy ?? []).includes(group.field)) {
        issues.push({
            path: `${path}.settings.group`,
            message: `The list of \`${resource.id}\` can't group by \`${group.field}\`: it isn't in the \`groupBy\` of its aggregates.`,
        });
    }
}

/**
 * The widgets of a dashboard (decisions 0064 and 0084): unique ids, and the built-in types on a
 * resource that exists, with filters of its list and aggregates it declares. A `stat` that counts
 * reads the total of the list, so the list can't be paged with cursors, which give no total.
 */
function checkWidgets(
    definition: DefinitionInput,
    widgets: Widget[],
    widgetsPath: string,
    issues: ValidationIssue[],
) {
    const ids = new Set<string>();
    widgets.forEach((widget, index) => {
        const path = `${widgetsPath}.${index}`;
        if (ids.has(widget.id)) {
            issues.push({ path: `${path}.id`, message: `Duplicate widget id \`${widget.id}\`.` });
        }
        ids.add(widget.id);
        if (!isBuiltInWidgetType(widget.type)) {
            return;
        }
        const settings = widget.settings ?? {};
        const onResource = typeof settings.resource === 'string';
        if (!onResource) {
            RESOURCE_SETTINGS.forEach((key) => {
                if (settings[key] !== undefined) {
                    issues.push({
                        path: `${path}.settings.${key}`,
                        message: `\`${key}\` goes with a \`resource\`.`,
                    });
                }
            });
            return;
        }
        if (!(RESOURCE_WIDGET_TYPES as readonly string[]).includes(widget.type)) {
            issues.push({
                path: `${path}.settings.resource`,
                message: `A \`${widget.type}\` widget has data of its own: it can't read a resource.`,
            });
            return;
        }
        const resource = definition.resources.find(
            (candidate) => candidate.id === settings.resource,
        );
        if (resource === undefined) {
            issues.push({
                path: `${path}.settings.resource`,
                message: `No resource \`${String(settings.resource)}\`.`,
            });
            return;
        }
        if (settings.target !== undefined && widget.type !== 'stat') {
            issues.push({
                path: `${path}.settings.target`,
                message: 'Only a `stat` has a `target`.',
            });
        }
        checkAggregateSettings(widget, resource, path, issues);
        const sums = typeof settings.measure === 'string' && settings.measure.startsWith('sum:');
        if (widget.type === 'stat' && !sums && resource.list?.pagination === 'cursor') {
            issues.push({
                path: `${path}.settings.resource`,
                message: `The list of \`${resource.id}\` is paged with cursors and has no total: it can't feed a \`stat\` that counts.`,
            });
        }
        const filters = new Set((resource.list?.filters ?? []).map((filter) => filter.id));
        Object.keys(settings.query ?? {}).forEach((key) => {
            const filter = FILTER_PARAM.exec(key)?.[1];
            if ((WIDGET_RESERVED_QUERY_PARAMS as readonly string[]).includes(key)) {
                issues.push({
                    path: `${path}.settings.query.${key}`,
                    message: `The client sets \`${key}\`.`,
                });
            } else if (filter !== undefined && !filters.has(filter)) {
                issues.push({
                    path: `${path}.settings.query.${key}`,
                    message: `The list of \`${resource.id}\` has no filter \`${filter}\`.`,
                });
            }
        });
    });
}
