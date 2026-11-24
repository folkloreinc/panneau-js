import type { z } from 'zod';

import { resolveBlockTypeSets } from './blockTypeSets';
import { lintDefinition } from './lint';
import { BootConfig } from './schemas/boot';
import { Definition } from './schemas/definition';
import {
    AddressSettings,
    DateRangeSettings,
    DateSettings,
    DurationSettings,
    type Field,
    LinkSettings,
    MoneySettings,
    RepeaterSettings,
    RichTextSettings,
    SelectSettings,
} from './schemas/field';

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

/** The schemas of the settings of the types that the protocol describes. */
const SETTINGS: Readonly<Record<string, z.ZodType>> = {
    date: DateSettings,
    select: SelectSettings,
    richtext: RichTextSettings,
    duration: DurationSettings,
    daterange: DateRangeSettings,
    money: MoneySettings,
    link: LinkSettings,
    address: AddressSettings,
    repeater: RepeaterSettings,
};

/**
 * Checks the settings of the fields whose type the protocol describes the settings of (`date`,
 * `select`, `richtext`, `duration`, `daterange`, `money`, `link`, `address`, `repeater`), nested
 * ones included.
 */
function checkFieldSettings(fields: readonly Field[], path: string): ValidationIssue[] {
    return fields.flatMap((field, index) => {
        const fieldPath = `${path}.${String(index)}`;
        const schema = SETTINGS[field.type];
        const own =
            schema !== undefined && field.settings !== undefined
                ? (schema.safeParse(field.settings).error?.issues ?? []).map((issue) => ({
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
 * shared block types, which it resolves (see `resolveBlockTypeSets()`), the references between its parts (see `lintDefinition()`), and the settings of field types that
 * the protocol describes (`DateSettings`, `SelectSettings`, `RichTextSettings`,
 * `DurationSettings`, `DateRangeSettings`, `MoneySettings`, `LinkSettings`, `AddressSettings`,
 * `RepeaterSettings`).
 */
export function validateDefinition(input: unknown): ValidationResult<Definition> {
    const result = validate(Definition, input);
    if (!result.success) {
        return result;
    }
    const issues = [
        ...resolveBlockTypeSets(result.data),
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
 * shared block types of its inlined definition, which it resolves, and the references between
 * its parts, if any.
 */
export function validateBootConfig(input: unknown): ValidationResult<BootConfig> {
    const result = validate(BootConfig, input);
    if (!result.success || result.data.definition === undefined) {
        return result;
    }
    const issues = [
        ...resolveBlockTypeSets(result.data.definition, 'definition'),
        ...lintDefinition(result.data.definition).map((issue) => ({
            ...issue,
            path: issue.path === '' ? 'definition' : `definition.${issue.path}`,
        })),
    ];
    return issues.length > 0 ? { success: false, issues } : result;
}
