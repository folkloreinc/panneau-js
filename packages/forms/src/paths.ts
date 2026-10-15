import type { Field } from '@panneau/protocol';

/** A step from a field to the value at a path: the field, and a locale or an item index. */
export interface PathStep {
    field: Field;
    locale?: string;
    index?: number;
}

function nested(field: Field): Field[] {
    return [...(field.fields ?? []), ...(field.types ?? []).flatMap((type) => type.fields)];
}

/**
 * The fields that a dot path goes through (`blocks.2.body.fr`: `blocks`, item 3, `body` in
 * French). Typed blocks are searched in all their types. Returns `[]` for an unknown path.
 */
export function getPathSteps(fields: readonly Field[], path: string): PathStep[] {
    const steps: PathStep[] = [];
    const segments = path.split('.');
    let candidates: readonly Field[] = fields;
    for (let index = 0; index < segments.length; index += 1) {
        const field = candidates.find((candidate) => candidate.name === segments[index]);
        if (field === undefined) {
            return [];
        }
        const step: PathStep = { field };
        steps.push(step);
        const next = segments[index + 1];
        if (field.localized === true && next !== undefined) {
            step.locale = next;
            index += 1;
        }
        if (
            field.type === 'repeater' &&
            next !== undefined &&
            /^\d+$/.test(segments[index + 1] ?? '')
        ) {
            step.index = Number(segments[index + 1]);
            index += 1;
        }
        candidates = nested(field);
    }
    return steps;
}

/** The field a path ends on, if the path is known. */
export function getFieldAtPath(fields: readonly Field[], path: string): Field | undefined {
    return getPathSteps(fields, path).at(-1)?.field;
}
