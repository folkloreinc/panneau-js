import type { Field, LayoutNode, Resource, Rule } from '@panneau/protocol';

import { canUpdateField, canViewField } from './abilities';

/** Whether a form creates an item or updates one. */
export type FormMode = 'create' | 'update';

/** A form ready to render: its fields and a layout that references every one of them. */
export interface ResolvedForm {
    /** The fields of the form, in definition order. */
    fields: Field[];
    /** The fields, by name. */
    fieldsByName: ReadonlyMap<string, Field>;
    /**
     * The layout tree. Field nodes that name an unknown field are removed, and fields that no
     * node references are appended at the end, as `field` nodes.
     */
    layout: LayoutNode[];
}

export interface ResolveFormOptions {
    /**
     * `create` removes `updateOnly` fields; `update` makes `createOnly` fields read-only. Rules
     * limited to a mode (`{ "rule": "required", "mode": "create" }`) are kept, without their
     * `mode`, in that mode only, in nested fields too. Without a mode, every field is kept as is.
     */
    mode?: FormMode;
    /** The type of the item, among the resource's `types`: its fields are added. */
    type?: string;
}

function referencedNames(nodes: readonly LayoutNode[], names = new Set<string>()): Set<string> {
    nodes.forEach((node) => {
        if (node.type === 'field' && node.name !== undefined) {
            names.add(node.name);
        }
        referencedNames(node.children ?? [], names);
    });
    return names;
}

function pruneLayout(
    nodes: readonly LayoutNode[],
    fields: ReadonlyMap<string, Field>,
): LayoutNode[] {
    return nodes.flatMap((node) => {
        if (node.type === 'field' && (node.name === undefined || !fields.has(node.name))) {
            return [];
        }
        if (node.children === undefined) {
            return [node];
        }
        return [{ ...node, children: pruneLayout(node.children, fields) }];
    });
}

/** The rules that apply in the mode, without their `mode`. */
function resolveRules(rules: readonly Rule[], mode: FormMode): Rule[] {
    return rules.flatMap((rule) => {
        if (rule.mode === undefined) {
            return [rule];
        }
        if (rule.mode !== mode) {
            return [];
        }
        const { mode: _mode, ...resolved } = rule;
        return [resolved as Rule];
    });
}

/** A field with the rules of the mode, and those of its nested fields and block types. */
function resolveFieldRules(field: Field, mode: FormMode): Field {
    const resolved: Field = { ...field };
    if (field.rules !== undefined) {
        resolved.rules = resolveRules(field.rules, mode);
    }
    if (field.fields !== undefined) {
        resolved.fields = field.fields.map((nested) => resolveFieldRules(nested, mode));
    }
    if (field.types !== undefined) {
        resolved.types = field.types.map((type) => ({
            ...type,
            fields: type.fields.map((nested) => resolveFieldRules(nested, mode)),
        }));
    }
    return resolved;
}

/**
 * Resolves fields and a layout into a form. Fields the current user can't see
 * (`abilities.view: false`) are left out, and those they can't edit (`abilities.update: false`)
 * are read-only (decision 0046).
 */
export function resolveFields(
    fields: readonly Field[],
    layout: readonly LayoutNode[] = [],
    { mode }: Pick<ResolveFormOptions, 'mode'> = {},
): ResolvedForm {
    const resolved = fields.flatMap((declared): Field[] => {
        if (!canViewField(declared)) {
            return [];
        }
        const field = canUpdateField(declared) ? declared : { ...declared, readOnly: true };
        if (mode === undefined) {
            return [field];
        }
        if (mode === 'create' && field.updateOnly === true) {
            return [];
        }
        const withRules = resolveFieldRules(field, mode);
        if (mode === 'update' && field.createOnly === true) {
            return [{ ...withRules, readOnly: true }];
        }
        return [withRules];
    });
    const fieldsByName = new Map(resolved.map((field) => [field.name, field]));
    const pruned = pruneLayout(layout, fieldsByName);
    const referenced = referencedNames(pruned);
    const appended: LayoutNode[] = resolved
        .filter((field) => !referenced.has(field.name))
        .map((field) => ({ type: 'field', name: field.name }));
    return { fields: resolved, fieldsByName, layout: [...pruned, ...appended] };
}

/** Resolves the form of a resource: its fields (plus those of the item's type) and its layout. */
export function resolveForm(resource: Resource, options: ResolveFormOptions = {}): ResolvedForm {
    const typeFields =
        options.type !== undefined
            ? (resource.types?.find((type) => type.id === options.type)?.fields ?? [])
            : [];
    return resolveFields([...resource.fields, ...typeFields], resource.form?.layout ?? [], options);
}

/** The field names a layout references, in order. */
export function getLayoutFieldNames(layout: readonly LayoutNode[]): string[] {
    return [...referencedNames(layout)];
}
