import type { z } from 'zod';

import { lintDefinition } from './lint';
import { BootConfig } from './schemas/boot';
import { Definition } from './schemas/definition';
import { type Field, RichTextSettings } from './schemas/field';

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

/** Checks the settings of the `richtext` fields of a list of fields, nested ones included. */
function checkFieldSettings(fields: readonly Field[], path: string): ValidationIssue[] {
    return fields.flatMap((field, index) => {
        const fieldPath = `${path}.${String(index)}`;
        const own =
            field.type === 'richtext' && field.settings !== undefined
                ? (RichTextSettings.safeParse(field.settings).error?.issues ?? []).map((issue) => ({
                      path: [`${fieldPath}.settings`, ...issue.path.map(String)].join('.'),
                      message: issue.message,
                  }))
                : [];
        return [
            ...own,
            ...checkFieldSettings(field.fields ?? [], `${fieldPath}.fields`),
            ...(field.types ?? []).flatMap((type, typeIndex) =>
                checkFieldSettings(type.fields, `${fieldPath}.types.${String(typeIndex)}.fields`),
            ),
        ];
    });
}

/**
 * Validates a definition, as returned by `GET /definition`: against the schema, then the
 * references between its parts (see `lintDefinition()`), and the settings of field types that
 * the protocol describes (`RichTextSettings`).
 */
export function validateDefinition(input: unknown): ValidationResult<Definition> {
    const result = validate(Definition, input);
    if (!result.success) {
        return result;
    }
    const issues = [
        ...lintDefinition(result.data),
        ...result.data.resources.flatMap((resource, index) => [
            ...checkFieldSettings(resource.fields, `resources.${String(index)}.fields`),
            ...(resource.types ?? []).flatMap((type, typeIndex) =>
                checkFieldSettings(
                    type.fields,
                    `resources.${String(index)}.types.${String(typeIndex)}.fields`,
                ),
            ),
            ...(resource.actions ?? []).flatMap((action, actionIndex) =>
                checkFieldSettings(
                    action.fields ?? [],
                    `resources.${String(index)}.actions.${String(actionIndex)}.fields`,
                ),
            ),
        ]),
    ];
    return issues.length > 0 ? { success: false, issues } : result;
}

/**
 * Validates a boot config, as a server writes it in the page: against the schema, then the
 * references between the parts of its inlined definition, if any.
 */
export function validateBootConfig(input: unknown): ValidationResult<BootConfig> {
    const result = validate(BootConfig, input);
    if (!result.success || result.data.definition === undefined) {
        return result;
    }
    const issues = lintDefinition(result.data.definition).map((issue) => ({
        ...issue,
        path: issue.path === '' ? 'definition' : `definition.${issue.path}`,
    }));
    return issues.length > 0 ? { success: false, issues } : result;
}
