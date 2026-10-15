import type { Field, LayoutNode, Resource } from '@panneau/protocol';

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
     * `create` removes `updateOnly` fields; `update` makes `createOnly` fields read-only. Without a
     * mode, every field is kept as is.
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

/** Resolves fields and a layout into a form. */
export function resolveFields(
    fields: readonly Field[],
    layout: readonly LayoutNode[] = [],
    { mode }: Pick<ResolveFormOptions, 'mode'> = {},
): ResolvedForm {
    const resolved = fields.flatMap((field) => {
        if (mode === 'create' && field.updateOnly === true) {
            return [];
        }
        if (mode === 'update' && field.createOnly === true) {
            return [{ ...field, readOnly: true }];
        }
        return [field];
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
