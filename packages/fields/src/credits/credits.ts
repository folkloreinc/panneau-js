// The `credits` compound field (decision 0065): people, or free names, and their roles.
import { toReferences } from '../shared/relation';

/** A credit, as the sub-fields of a `credits` field give it. */
export interface Credit {
    /** A reference to a person, `{ id, label }`, or `null`. */
    person?: unknown;
    /** The name of a person who isn't in the database. */
    name?: unknown;
    /** References to roles, or a role as text, localized or not. */
    roles?: unknown;
    /** Whether the credit is featured, `true` or left out. */
    featured?: unknown;
}

function localizedText(value: unknown, locale: string): string | null {
    if (typeof value === 'string') {
        return value.trim() !== '' ? value.trim() : null;
    }
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        const texts = value as Record<string, unknown>;
        const text =
            texts[locale] ?? Object.values(texts).find((entry) => typeof entry === 'string');
        return typeof text === 'string' && text.trim() !== '' ? text.trim() : null;
    }
    return null;
}

/** The name of the credited person: the label of the person, or the free name. */
export function getCreditName(credit: Credit, locale: string): string | null {
    return toReferences(credit.person)[0]?.label ?? localizedText(credit.name, locale);
}

/** The roles of a credit: the labels of its references, or its text in the locale. */
export function getCreditRoles(credit: Credit, locale: string): string[] {
    const { roles } = credit;
    if (Array.isArray(roles) || (roles !== null && typeof roles === 'object' && 'id' in roles)) {
        return toReferences(roles).map((reference) => reference.label);
    }
    const text = localizedText(roles, locale);
    return text !== null ? [text] : [];
}

/** A credit as text: `Ada Lovelace (Director, Writer)`, or `null` without a name nor a role. */
export function formatCredit(credit: Credit, locale: string): string | null {
    const name = getCreditName(credit, locale);
    const roles = getCreditRoles(credit, locale);
    if (name === null) {
        return roles.length > 0 ? roles.join(', ') : null;
    }
    return roles.length > 0 ? `${name} (${roles.join(', ')})` : name;
}
