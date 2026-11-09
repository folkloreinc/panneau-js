import { ITEM_TYPE_KEY } from './resourceTypes';
import type { DefinitionInput, Field, LayoutNode, ResourceInput } from './schemas';
import type { ValidationIssue } from './validate';
import {
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
 * The types of a resource (decision 0075): unique ids, fields named apart from those of the
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
    checkWidgets(definition, issues);
    return issues;
}

const FILTER_PARAM = /^filter\[([^\]]+)\]/;

/**
 * The widgets of the dashboard (decision 0064): unique ids, and the built-in `stat` and `list` on
 * a resource that exists, with filters of its list. A `stat` counts the items of the list, so the
 * list can't be paged with cursors, which give no total.
 */
function checkWidgets(definition: DefinitionInput, issues: ValidationIssue[]) {
    const ids = new Set<string>();
    (definition.dashboard?.widgets ?? []).forEach((widget, index) => {
        const path = `dashboard.widgets.${index}`;
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
            if (settings.query !== undefined) {
                issues.push({
                    path: `${path}.settings.query`,
                    message: '`query` goes with a `resource`.',
                });
            }
            return;
        }
        if (!(RESOURCE_WIDGET_TYPES as readonly string[]).includes(widget.type)) {
            issues.push({
                path: `${path}.settings.resource`,
                message: `A \`${widget.type}\` widget has data of its own: only \`stat\` and \`list\` read a resource.`,
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
        if (widget.type === 'stat' && resource.list?.pagination === 'cursor') {
            issues.push({
                path: `${path}.settings.resource`,
                message: `The list of \`${resource.id}\` is paged with cursors and has no total: it can't feed a \`stat\`.`,
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
