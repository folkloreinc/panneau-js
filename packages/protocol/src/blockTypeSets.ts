import type { BlockType, Definition, Field } from './schemas';
import type { ValidationIssue } from './validate';

type Sets = NonNullable<Definition['blockTypeSets']>;

/**
 * Resolves the shared block types of a definition (decision 0094): gives each `repeater` with a
 * `typeSet` the `types` of that set in `blockTypeSets`. Repeaters that name the same set share
 * the same array, so a definition stays as small in memory as on the wire. Changes the
 * definition in place, and returns what can't be resolved: a set that doesn't exist, a repeater
 * with both `types` and `typeSet`, or a set whose blocks hold the set itself.
 */
export function resolveBlockTypeSets(definition: Definition, path = ''): ValidationIssue[] {
    const sets: Sets = definition.blockTypeSets ?? {};
    const prefix = path === '' ? '' : `${path}.`;
    const issues: ValidationIssue[] = [];
    const resolved = new Map<string, BlockType[] | null>();

    const resolveSet = (key: string, from: string): BlockType[] | undefined => {
        const known = resolved.get(key);
        if (known === null) {
            issues.push({
                path: from,
                message: `The block type set \`${key}\` holds itself: blocks can't nest without end.`,
            });
            return undefined;
        }
        if (known !== undefined) {
            return known;
        }
        const set = sets[key];
        if (set === undefined) {
            issues.push({
                path: from,
                message: `No block type set \`${key}\` in \`blockTypeSets\`.`,
            });
            return undefined;
        }
        // Pending while its own blocks resolve: a set they name again is a loop
        resolved.set(key, null);
        set.forEach((type, index) => {
            visit(type.fields, `${prefix}blockTypeSets.${key}.${String(index)}.fields`);
        });
        resolved.set(key, set);
        return set;
    };

    const visit = (fields: readonly Field[], fieldsPath: string): void => {
        fields.forEach((field, index) => {
            const fieldPath = `${fieldsPath}.${String(index)}`;
            if (field.typeSet !== undefined) {
                if (field.types !== undefined) {
                    issues.push({
                        path: `${fieldPath}.typeSet`,
                        message: 'A field has `types` or a `typeSet`, not both.',
                    });
                } else {
                    const types = resolveSet(field.typeSet, `${fieldPath}.typeSet`);
                    if (types !== undefined) {
                        field.types = types;
                    }
                }
            } else {
                field.types?.forEach((type, typeIndex) => {
                    visit(type.fields, `${fieldPath}.types.${String(typeIndex)}.fields`);
                });
            }
            visit(field.fields ?? [], `${fieldPath}.fields`);
        });
    };

    definition.resources.forEach((resource, index) => {
        const resourcePath = `${prefix}resources.${String(index)}`;
        visit(resource.fields, `${resourcePath}.fields`);
        resource.types?.forEach((type, typeIndex) => {
            visit(type.fields, `${resourcePath}.types.${String(typeIndex)}.fields`);
        });
        resource.actions?.forEach((action, actionIndex) => {
            visit(action.fields ?? [], `${resourcePath}.actions.${String(actionIndex)}.fields`);
        });
    });
    // The sets no repeater names are still checked
    Object.keys(sets).forEach((key) => resolveSet(key, `${prefix}blockTypeSets.${key}`));

    return issues;
}
