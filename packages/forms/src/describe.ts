import type { Field } from '@panneau/protocol';

import { getPathSteps } from './paths';

/**
 * A readable name for the value at a path, from the labels of its fields: `Blocks › 3 › Body`,
 * `Title (fr)`. Unknown paths are returned as is.
 */
export function describePath(fields: readonly Field[], path: string): string {
    const steps = getPathSteps(fields, path);
    if (steps.length === 0) {
        return path;
    }
    return steps
        .map((step) => {
            const label = step.field.label ?? step.field.name;
            const locale = step.locale !== undefined ? ` (${step.locale})` : '';
            const index = step.index !== undefined ? ` › ${step.index + 1}` : '';
            return `${label}${locale}${index}`;
        })
        .join(' › ');
}
