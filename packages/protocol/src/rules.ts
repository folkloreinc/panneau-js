import { evaluateCondition } from './conditions';
import type { Field, Rule } from './schemas/field';
import { PORTABLE_RULES } from './schemas/field';
import { getValue, isFilled, isRecord } from './values';

/** A rule that a value doesn't satisfy. */
export interface RuleFailure {
    rule: string;
    /** The rule's parameter (`max: 120` gives `120`). */
    value?: unknown;
    /** The message set on the rule, if any. */
    message?: string;
}

export interface CheckOptions {
    /**
     * Locales a `required` localized field must be filled in. Without it, one filled locale is
     * enough.
     */
    locales?: string[];
    /** `create` skips `updateOnly` fields; `update` skips `createOnly` fields. */
    mode?: 'create' | 'update';
    /** Only check the fields present in the values (partial updates). */
    partial?: boolean;
}

interface Context extends CheckOptions {
    /** The whole form, for `visibleWhen` and date rules that reference other fields. */
    root: Record<string, unknown>;
    failures: Record<string, RuleFailure[]>;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isKnownRule(rule: Rule): boolean {
    return (PORTABLE_RULES as readonly string[]).includes(rule.rule);
}

function failure(rule: Rule): RuleFailure {
    const result: RuleFailure = { rule: rule.rule };
    if ('value' in rule && rule.value !== undefined) {
        result.value = rule.value;
    }
    if (rule.message !== undefined) {
        result.message = rule.message;
    }
    return result;
}

function sizeOf(value: unknown): number | null {
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'string' || Array.isArray(value)) {
        return value.length;
    }
    return null;
}

function matchesMime(mime: string, patterns: string[]): boolean {
    return patterns.some((pattern) => {
        if (pattern.endsWith('/*')) {
            return mime.startsWith(pattern.slice(0, -1));
        }
        return mime === pattern;
    });
}

function mediaList(value: unknown): Record<string, unknown>[] {
    const list = Array.isArray(value) ? value : [value];
    return list.filter(isRecord);
}

function toTime(value: unknown): number | null {
    if (typeof value !== 'string' && typeof value !== 'number') {
        return null;
    }
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? null : time;
}

/** Checks one value against a field's rules. Returns the rules that fail. */
export function checkRules(
    rules: Rule[],
    value: unknown,
    root: Record<string, unknown> = {},
): RuleFailure[] {
    const failures: RuleFailure[] = [];
    const filled = isFilled(value);
    rules.filter(isKnownRule).forEach((rule) => {
        if (rule.rule === 'required') {
            if (!filled) {
                failures.push(failure(rule));
            }
            return;
        }
        if (!filled) {
            return;
        }
        let valid = true;
        switch (rule.rule) {
            case 'min':
            case 'max': {
                const size = sizeOf(value);
                const limit = rule.value as number;
                valid = size === null || (rule.rule === 'min' ? size >= limit : size <= limit);
                break;
            }
            case 'pattern':
                valid =
                    typeof value !== 'string' ||
                    new RegExp(rule.value as string, (rule as { flags?: string }).flags).test(
                        value,
                    );
                break;
            case 'email':
                valid = typeof value !== 'string' || EMAIL.test(value);
                break;
            case 'url':
                valid = typeof value !== 'string' || URL.canParse(value);
                break;
            case 'in': {
                const allowed = rule.value as unknown[];
                const values = Array.isArray(value) ? value : [value];
                valid = values.every((item) => allowed.includes(item));
                break;
            }
            case 'accept':
                valid = mediaList(value).every(
                    (media) =>
                        typeof media.mime !== 'string' ||
                        matchesMime(media.mime, rule.value as string[]),
                );
                break;
            case 'maxSize':
                valid = mediaList(value).every(
                    (media) =>
                        typeof media.size !== 'number' || media.size <= (rule.value as number),
                );
                break;
            case 'before':
            case 'after': {
                const bound = rule.value as string | { field: string };
                const boundTime = toTime(
                    typeof bound === 'string' ? bound : getValue(root, bound.field),
                );
                const time = toTime(value);
                if (boundTime !== null && time !== null) {
                    valid = rule.rule === 'before' ? time < boundTime : time > boundTime;
                }
                break;
            }
        }
        if (!valid) {
            failures.push(failure(rule));
        }
    });
    return failures;
}

function addFailures(context: Context, path: string, failures: RuleFailure[]) {
    if (failures.length > 0) {
        context.failures[path] = [...(context.failures[path] ?? []), ...failures];
    }
}

function checkFieldValue(field: Field, value: unknown, path: string, context: Context) {
    const rules = field.rules ?? [];
    if (field.localized === true) {
        const localized = isRecord(value) ? value : {};
        const required = rules.filter((rule) => rule.rule === 'required');
        const others = rules.filter((rule) => rule.rule !== 'required');
        if (required.length > 0) {
            const locales = context.locales;
            if (locales === undefined || locales.length === 0) {
                if (!Object.values(localized).some(isFilled)) {
                    addFailures(context, path, required.map(failure));
                }
            } else {
                locales.forEach((locale) => {
                    addFailures(
                        context,
                        `${path}.${locale}`,
                        checkRules(required, localized[locale], context.root),
                    );
                });
            }
        }
        Object.entries(localized).forEach(([locale, localeValue]) => {
            addFailures(
                context,
                `${path}.${locale}`,
                checkRules(others, localeValue, context.root),
            );
        });
        return;
    }

    addFailures(context, path, checkRules(rules, value, context.root));

    if (field.type === 'group' && field.fields !== undefined && isRecord(value)) {
        checkFields(field.fields, value, `${path}.`, context);
    }
    if (field.type === 'repeater' && Array.isArray(value)) {
        value.forEach((item, index) => {
            if (!isRecord(item)) {
                return;
            }
            const blockFields =
                field.types !== undefined
                    ? field.types.find((type) => type.id === item.type)?.fields
                    : field.fields;
            if (blockFields !== undefined) {
                checkFields(blockFields, item, `${path}.${index}.`, context);
            }
        });
    }
}

function checkFields(
    fields: Field[],
    values: Record<string, unknown>,
    prefix: string,
    context: Context,
) {
    fields.forEach((field) => {
        if (field.readOnly === true) {
            return;
        }
        if (context.mode === 'create' && field.updateOnly === true) {
            return;
        }
        if (context.mode === 'update' && field.createOnly === true) {
            return;
        }
        if (field.visibleWhen !== undefined && !evaluateCondition(field.visibleWhen, values)) {
            return;
        }
        if (context.partial === true && prefix === '' && !(field.name in values)) {
            return;
        }
        checkFieldValue(field, values[field.name], `${prefix}${field.name}`, context);
    });
}

/**
 * Checks form values against the portable rules of their fields. Returns the failures keyed by
 * the dot path of the value (`title.fr`, `blocks.2.image`), the same keys as validation errors.
 * Hidden and read-only fields are skipped. Rules this version doesn't know are ignored.
 */
export function checkValues(
    fields: Field[],
    values: Record<string, unknown>,
    options: CheckOptions = {},
): Record<string, RuleFailure[]> {
    const context: Context = { ...options, root: values, failures: {} };
    checkFields(fields, values, '', context);
    return context.failures;
}
