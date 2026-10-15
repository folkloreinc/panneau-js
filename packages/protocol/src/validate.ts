import type { z } from 'zod';

import { lintDefinition } from './lint';
import { Problem } from './schemas/api';
import { Definition } from './schemas/definition';

export interface ValidationIssue {
    /** Dot path of the invalid value (`resources.0.fields.2.type`), empty for the root. */
    path: string;
    message: string;
}

export type ValidationResult<T> =
    { success: true; data: T } | { success: false; issues: ValidationIssue[] };

/** Validates a value against one of the protocol's schemas. */
export function validate<T extends z.ZodType>(
    schema: T,
    input: unknown,
): ValidationResult<z.infer<T>> {
    const result = schema.safeParse(input);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return {
        success: false,
        issues: result.error.issues.map((issue) => ({
            path: issue.path.map(String).join('.'),
            message: issue.message,
        })),
    };
}

/**
 * Validates a definition, as returned by `GET /definition`: against the schema, then the
 * references between its parts (see `lintDefinition()`).
 */
export function validateDefinition(input: unknown): ValidationResult<Definition> {
    const result = validate(Definition, input);
    if (!result.success) {
        return result;
    }
    const issues = lintDefinition(result.data);
    return issues.length > 0 ? { success: false, issues } : result;
}

/** Whether a value is a problem details object (an API error). */
export function isProblem(value: unknown): value is Problem {
    return Problem.safeParse(value).success;
}
