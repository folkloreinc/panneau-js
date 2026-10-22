import type { DefinitionInput, Field, LayoutNode, ResourceInput } from './schemas';
import type { ValidationIssue } from './validate';

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

function checkResource(resource: ResourceInput, path: string, issues: ValidationIssue[]) {
    const names = fieldNames(resource.fields);
    if (names.size !== resource.fields.length) {
        issues.push({ path: `${path}.fields`, message: 'Field names must be unique.' });
    }
    if (resource.form?.layout !== undefined) {
        checkLayout(resource.form.layout, names, `${path}.form.layout`, issues);
    }
    (resource.list?.columns ?? []).forEach((column, index) => {
        if (column.field !== undefined && !names.has(column.field)) {
            issues.push({
                path: `${path}.list.columns.${index}.field`,
                message: `No field named \`${column.field}\`.`,
            });
        }
    });
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
    resource.fields.forEach((field, index) => {
        if (field.type === 'relation' && field.resource === undefined) {
            issues.push({
                path: `${path}.fields.${index}.resource`,
                message: 'A `relation` field needs a `resource`.',
            });
        } else if (field.type === 'relation' && Array.isArray(field.resource)) {
            issues.push({
                path: `${path}.fields.${index}.resource`,
                message: 'A `relation` field names one resource.',
            });
        }
    });
}

/**
 * Checks what the schema can't: references between parts of a definition (layout nodes and
 * columns that name existing fields, relations and media fields that name a resource, unique
 * names), and the `file` field of `media` resources.
 */
export function lintDefinition(definition: DefinitionInput): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const resourceIds = new Set(definition.resources.map((resource) => resource.id));
    const libraries = definition.resources
        .filter((resource) => resource.kind === 'media')
        .map((resource) => resource.id);
    definition.resources.forEach((resource, index) => {
        checkResource(resource, `resources.${index}`, issues);
        resource.fields.forEach((field, fieldIndex) => {
            if (
                field.type === 'relation' &&
                typeof field.resource === 'string' &&
                !resourceIds.has(field.resource)
            ) {
                issues.push({
                    path: `resources.${index}.fields.${fieldIndex}.resource`,
                    message: `No resource \`${field.resource}\`.`,
                });
            }
            if (field.type === 'media') {
                const fieldPath = `resources.${index}.fields.${fieldIndex}.resource`;
                if (field.resource === undefined) {
                    // Every library of the definition (decision 0027).
                    if (libraries.length === 0) {
                        issues.push({
                            path: fieldPath,
                            message: 'A `media` field needs a resource of kind `media`.',
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
    return issues;
}
