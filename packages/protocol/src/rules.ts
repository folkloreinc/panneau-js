import { getAddressRequiredParts, isPostalCode } from './addresses';
import { evaluateCondition } from './conditions';
import { PORTABLE_RULES } from './constants';
import { isCurrencyCode } from './currencies';
import { getLinkTypes } from './links';
import type { Field, Rule } from './schemas/field';
import { matchesRatio, renderedCropSize } from './transforms';
import { getValue, isFilled, isRecord } from './values';

/** A rule that a value doesn't satisfy. */
export interface RuleFailure {
    rule: string;
    /**
     * The rule's parameter (`max: 120` gives `120`). For `daterange`, what fails: `start` or `end`
     * (a bound missing where the range isn't open), or `order` (the end is before the start).
     */
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
    /**
     * The values of the item being updated. With `partial`, conditions (`visibleWhen`) and rules
     * that read other fields read them for the fields that aren't in the values: a field shown
     * when `status` is `published`, sent alone, is checked on a published item (decision 0043).
     */
    item?: Record<string, unknown>;
}

interface Context extends CheckOptions {
    /** The whole form, for `visibleWhen` and date rules that reference other fields. */
    root: Record<string, unknown>;
    failures: Record<string, RuleFailure[]>;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** An international phone number in E.164: `+`, then 7 to 15 digits, without a leading zero. */
const TEL = /^\+[1-9]\d{6,14}$/;
/** The same number, with an optional extension after `;ext=` (RFC 3966): `+15145550199;ext=123`. */
const TEL_EXTENSION = /^\+[1-9]\d{6,14}(?:;ext=\d{1,10})?$/;

function isKnownRule(rule: Rule): boolean {
    return (PORTABLE_RULES as readonly string[]).includes(rule.rule);
}

/**
 * Whether a rule applies in a mode: a rule with a `mode` applies only in that mode, and not when the
 * mode isn't known.
 */
function appliesIn(rule: Rule, mode: CheckOptions['mode']): boolean {
    return rule.mode === undefined || rule.mode === mode;
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
    // A `money` value: `min` and `max` apply to its amount, in minor units (decision 0053).
    if (isRecord(value) && 'currency' in value && typeof value.amount === 'number') {
        return value.amount;
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

/** The files of a value, with their MIME type and size: stored files, or chosen ones (`File`). */
function mediaList(value: unknown): Record<string, unknown>[] {
    const list = Array.isArray(value) ? value : [value];
    return list
        .filter(isRecord)
        .map((media) =>
            typeof Blob !== 'undefined' && media instanceof Blob
                ? { mime: media.type === '' ? undefined : media.type, size: media.size }
                : media,
        );
}

/**
 * Whether each image of a value has the crop the `crop` rule asks for (decision 0031): a crop when
 * it is required, and one of the ratios once rendered. An id alone has no crop.
 */
function hasCrop(value: unknown, rule: { ratios?: string[]; required?: boolean }): boolean {
    const entries = Array.isArray(value) ? value : [value];
    return entries.every((entry) => {
        const transform = isRecord(entry) && isRecord(entry.transform) ? entry.transform : {};
        const size = renderedCropSize(transform);
        if (size === null) {
            return rule.required !== true;
        }
        const ratios = rule.ratios ?? [];
        return (
            ratios.length === 0 ||
            ratios.some((ratio) => matchesRatio(size.width, size.height, ratio))
        );
    });
}

/**
 * Whether an `embed` value comes from one of the providers, compared without case (decision 0058).
 * A value without a `provider` (an app without `GET /embeds`) is left to the backend.
 */
function hasProvider(value: unknown, providers: readonly string[]): boolean {
    if (!isRecord(value) || typeof value.provider !== 'string') {
        return true;
    }
    const provider = value.provider.toLowerCase();
    return providers.some(
        (allowed) => typeof allowed === 'string' && allowed.toLowerCase() === provider,
    );
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/;

/** A bound of a `daterange`: a day or a date-time, `null` when empty, `undefined` when invalid. */
function rangeBound(value: unknown): string | null | undefined {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    if (typeof value !== 'string' || !(DAY.test(value) || DATE_TIME.test(value))) {
        return undefined;
    }
    return toTime(value) !== null ? value : undefined;
}

/**
 * What a `daterange` value fails (decision 0053): a bound that is missing or invalid where the range
 * isn't open (`start`, `end`), or an end before the start (`order`). `null` when it is valid.
 */
function checkDateRange(value: unknown, open: unknown): 'start' | 'end' | 'order' | null {
    if (!isRecord(value)) {
        return 'start';
    }
    const start = rangeBound(value.start);
    const end = rangeBound(value.end);
    const openStart = open === 'start' || open === 'both';
    const openEnd = open === 'end' || open === 'both';
    if (start === undefined || (start === null && !openStart)) {
        return 'start';
    }
    if (end === undefined || (end === null && !openEnd)) {
        return 'end';
    }
    if (start === null || end === null) {
        return null;
    }
    // Days compare as days; a date-time compares as its instant.
    const before =
        DAY.test(start) && DAY.test(end)
            ? end < start
            : (toTime(end) as number) < (toTime(start) as number);
    return before ? 'order' : null;
}

/** Whether a `money` value has an integer amount, and a currency that the rule allows. */
function isMoney(value: unknown, currencies: unknown): boolean {
    if (!isRecord(value) || !Number.isSafeInteger(value.amount)) {
        return false;
    }
    return Array.isArray(currencies) && currencies.length > 0
        ? currencies.includes(value.currency)
        : isCurrencyCode(value.currency);
}

function toTime(value: unknown): number | null {
    if (typeof value !== 'string' && typeof value !== 'number') {
        return null;
    }
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? null : time;
}

/**
 * Checks one value against a field's rules. Returns the rules that fail. Rules limited to a `mode`
 * only apply when it is given.
 */
export function checkRules(
    rules: Rule[],
    value: unknown,
    root: Record<string, unknown> = {},
    mode?: CheckOptions['mode'],
): RuleFailure[] {
    const failures: RuleFailure[] = [];
    const filled = isFilled(value);
    const applying = rules.filter((rule) => isKnownRule(rule) && appliesIn(rule, mode));
    applying.forEach((rule) => {
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
        // What fails, when the rule says more than its parameter (`daterange`).
        let detail: string | null = null;
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
            case 'json':
                // Text that doesn't parse stays a string in the form: only objects and arrays pass
                valid = isRecord(value) || Array.isArray(value);
                break;
            case 'tel':
                valid =
                    typeof value !== 'string' ||
                    ((rule as { extension?: boolean }).extension === true
                        ? TEL_EXTENSION
                        : TEL
                    ).test(value);
                break;
            case 'postalCode': {
                // The country is a code, or another field of the form (decision 0054)
                const country = isRecord(rule.value)
                    ? getValue(root, String(rule.value.field))
                    : rule.value;
                valid =
                    typeof value !== 'string' ||
                    isPostalCode(value, typeof country === 'string' ? country : null);
                break;
            }
            case 'daterange':
                detail = checkDateRange(value, (rule as { open?: unknown }).open);
                valid = detail === null;
                break;
            case 'money':
                valid = isMoney(value, (rule as { currencies?: unknown }).currencies);
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
            case 'crop':
                valid = !isRecord(rule.value) || hasCrop(value, rule.value);
                break;
            case 'providers':
                valid = hasProvider(value, rule.value as string[]);
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
            failures.push(detail !== null ? { ...failure(rule), value: detail } : failure(rule));
        }
    });
    return failures;
}

function addFailures(context: Context, path: string, failures: RuleFailure[]) {
    if (failures.length > 0) {
        context.failures[path] = [...(context.failures[path] ?? []), ...failures];
    }
}

/** A string setting of a field. */
function stringSetting(field: Field, key: string): string | undefined {
    const value = field.settings?.[key];
    return typeof value === 'string' && value !== '' ? value : undefined;
}

/**
 * The rule each type implies: its values are checked whatever rules the field lists. `tel`,
 * `daterange` and `money` carry settings of their field: the extension, the open bounds, the
 * allowed currencies.
 */
const IMPLIED_RULES: Readonly<Record<string, (field: Field) => Rule>> = {
    json: () => ({ rule: 'json' }),
    tel: (field) =>
        field.settings?.extension === true ? { rule: 'tel', extension: true } : { rule: 'tel' },
    daterange: (field) => {
        const open = stringSetting(field, 'open');
        return { rule: 'daterange', ...(open !== undefined ? { open } : {}) } as Rule;
    },
    money: (field) => {
        const currency = stringSetting(field, 'currency');
        const listed = field.settings?.currencies;
        const currencies =
            currency !== undefined
                ? [currency]
                : Array.isArray(listed)
                  ? listed.filter((code): code is string => typeof code === 'string')
                  : [];
        return { rule: 'money', ...(currencies.length > 0 ? { currencies } : {}) } as Rule;
    },
};

/**
 * The rules of a field that apply in the mode, with the one its type implies: `json` for the
 * `json` type, `tel` for `tel`, `daterange` for `daterange` and `money` for `money`. A rule of
 * the same name on the field wins.
 */
function rulesOf(field: Field, mode: CheckOptions['mode']): Rule[] {
    const rules = (field.rules ?? []).filter((rule) => appliesIn(rule, mode));
    const implied = IMPLIED_RULES[field.type]?.(field);
    return implied !== undefined && !rules.some((rule) => rule.rule === implied.rule)
        ? [...rules, implied]
        : rules;
}

/** The parts that make an address filled: a country or a point alone don't. */
const ADDRESS_TEXT_PARTS = ['street', 'unit', 'city', 'region', 'postalCode'] as const;

/**
 * The checks of the parts of an `address` (decision 0054): a filled address, with a part other
 * than its country, has its required parts, and a postal code of its country.
 */
function checkAddress(field: Field, value: unknown, path: string, context: Context) {
    if (!isRecord(value) || !ADDRESS_TEXT_PARTS.some((part) => isFilled(value[part]))) {
        return;
    }
    getAddressRequiredParts(field).forEach((part) => {
        if (!isFilled(value[part])) {
            addFailures(context, `${path}.${part}`, [{ rule: 'required' }]);
        }
    });
    const { postalCode, country } = value;
    if (
        typeof postalCode === 'string' &&
        isFilled(postalCode) &&
        !isPostalCode(postalCode, typeof country === 'string' ? country : null)
    ) {
        addFailures(context, `${path}.postalCode`, [{ rule: 'postalCode' }]);
    }
}

/** Whether a string is an email address. */
const isEmail = (text: string) => EMAIL.test(text);

/** Whether the `url` of a link of a type is valid: the `rule` it fails, or `null`. */
function checkLinkUrl(type: string, url: string, pattern: string | undefined): string | null {
    switch (type) {
        case 'url':
            return /^https?:\/\//i.test(url) && URL.canParse(url) ? null : 'url';
        case 'email':
            // `mailto:` and an address, with a query (`?subject=`) if any
            return /^mailto:/i.test(url) && isEmail(url.slice(7).split('?')[0] ?? '')
                ? null
                : 'email';
        case 'tel':
            return /^tel:/i.test(url) && TEL.test(url.slice(4)) ? null : 'tel';
        default:
            return pattern === undefined || new RegExp(pattern).test(url) ? null : 'pattern';
    }
}

/**
 * The checks of the parts of a `link` (decision 0055): a type of the field, the URL of its type,
 * its page or its file, and its label when the field requires one.
 */
function checkLink(field: Field, value: unknown, path: string, context: Context) {
    if (!isRecord(value)) {
        return;
    }
    const types = getLinkTypes(field);
    const type = types.find((candidate) => candidate.id === value.type);
    if (type === undefined) {
        addFailures(context, `${path}.type`, [
            { rule: 'in', value: types.map((candidate) => candidate.id) },
        ]);
        return;
    }
    if (type.id === 'page' || type.id === 'file') {
        if (!isFilled(value[type.id])) {
            addFailures(context, `${path}.${type.id}`, [{ rule: 'required' }]);
        }
    } else if (typeof value.url !== 'string' || !isFilled(value.url)) {
        addFailures(context, `${path}.url`, [{ rule: 'required' }]);
    } else {
        const failed = checkLinkUrl(type.id, value.url.trim(), type.pattern);
        if (failed !== null) {
            addFailures(context, `${path}.url`, [
                failed === 'pattern' ? { rule: 'pattern', value: type.pattern } : { rule: failed },
            ]);
        }
    }
    const label = value.label;
    const hasLabel = isRecord(label) ? Object.values(label).some(isFilled) : isFilled(label);
    if (field.settings?.label === 'required' && !hasLabel) {
        addFailures(context, `${path}.label`, [{ rule: 'required' }]);
    }
}

/** The checks of the parts of a value that the field's type implies. */
function checkParts(field: Field, value: unknown, path: string, context: Context) {
    if (field.type === 'address') {
        checkAddress(field, value, path, context);
    } else if (field.type === 'link') {
        checkLink(field, value, path, context);
    }
}

function checkFieldValue(field: Field, value: unknown, path: string, context: Context) {
    const rules = rulesOf(field, context.mode);
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
                        checkRules(required, localized[locale], context.root, context.mode),
                    );
                });
            }
        }
        Object.entries(localized).forEach(([locale, localeValue]) => {
            addFailures(
                context,
                `${path}.${locale}`,
                checkRules(others, localeValue, context.root, context.mode),
            );
            checkParts(field, localeValue, `${path}.${locale}`, context);
        });
        return;
    }

    addFailures(context, path, checkRules(rules, value, context.root, context.mode));
    checkParts(field, value, path, context);

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
        if (
            field.visibleWhen !== undefined &&
            !evaluateCondition(field.visibleWhen, prefix === '' ? context.root : values)
        ) {
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
    const root =
        options.partial === true && options.item !== undefined
            ? { ...options.item, ...values }
            : values;
    const context: Context = { ...options, root, failures: {} };
    checkFields(fields, values, '', context);
    return context.failures;
}
