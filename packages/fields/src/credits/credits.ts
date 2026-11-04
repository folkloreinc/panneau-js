import { type RelationReference, toReferences } from '../shared/relation';

/** A person who isn't in the resource of people: their name, the same in every locale. */
export interface CreditName {
    name: string;
}

/** A role without a resource of roles: its name in each locale (`{ fr: 'Musique' }`). */
export interface CreditRoleName {
    name: Partial<Record<string, string>>;
}

/** The person of a credit: an item of the resource of people, or a name. */
export type CreditPerson = RelationReference | CreditName;

/** A role of a credit: an item of the resource of roles, or a name in each locale. */
export type CreditRole = RelationReference | CreditRoleName;

/**
 * A credit (decision 0053): a person and their roles, `featured` for the credits to put forward,
 * and the values of the fields of the credit. `person` is `null` while a new credit has none.
 */
export interface Credit {
    person: CreditPerson | null;
    roles: CreditRole[];
    featured?: boolean;
    [field: string]: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Whether a person or a role is a name rather than a reference to an item. */
export function isCreditName(value: CreditPerson): value is CreditName;
export function isCreditName(value: CreditRole): value is CreditRoleName;
export function isCreditName(value: CreditPerson | CreditRole): boolean {
    return !('id' in value) && 'name' in value;
}

/** Reads the person of a credit: a reference (or an id), a name, or `null`. */
export function toCreditPerson(value: unknown): CreditPerson | null {
    if (isRecord(value) && !('id' in value)) {
        return typeof value.name === 'string' ? { name: value.name } : null;
    }
    return toReferences(value)[0] ?? null;
}

function toCreditRole(value: unknown): CreditRole | null {
    if (isRecord(value) && !('id' in value)) {
        if (!isRecord(value.name)) {
            return null;
        }
        const name = Object.fromEntries(
            Object.entries(value.name).filter(
                (entry): entry is [string, string] => typeof entry[1] === 'string',
            ),
        );
        return { name };
    }
    return toReferences(value)[0] ?? null;
}

/** Reads the roles of a credit: references (or ids) and names. Anything else is left out. */
export function toCreditRoles(value: unknown): CreditRole[] {
    return Array.isArray(value)
        ? value.map(toCreditRole).filter((role): role is CreditRole => role !== null)
        : [];
}

/**
 * Reads a credits value: credits whose people and roles are references (or ids, which keep their
 * id as label until it is resolved) or names. Anything else is left out.
 */
export function toCredits(value: unknown): Credit[] {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.filter(isRecord).map((entry) => {
        const credit: Credit = {
            ...entry,
            person: toCreditPerson(entry.person),
            roles: toCreditRoles(entry.roles),
        };
        if (entry.featured !== true) {
            delete credit.featured;
        }
        return credit;
    });
}

/** The name of a role in a locale, or else in the first locale that has one. */
export function getRoleName(role: CreditRole, locale: string): string {
    if (!isCreditName(role)) {
        return role.label;
    }
    const names = role.name;
    const language = locale.split('-')[0] ?? locale;
    return (
        names[locale] ??
        names[language] ??
        Object.values(names).find((name) => name !== undefined && name !== '') ??
        ''
    );
}

/** The name of the person of a credit. */
export function getPersonName(person: CreditPerson | null): string {
    if (person === null) {
        return '';
    }
    return isCreditName(person) ? person.name : person.label;
}

/**
 * Credits as text, for a list: the people in order, each with their roles, where consecutive
 * credits with the same roles share them: `Ada Lovelace (Director), Jane Doe, John Roe (Music)`.
 */
export function formatCredits(value: unknown, locale: string): string {
    const credits = toCredits(value).filter((credit) => getPersonName(credit.person) !== '');
    const groups: { people: string[]; roles: string }[] = [];
    credits.forEach((credit) => {
        const roles = credit.roles
            .map((role) => getRoleName(role, locale))
            .filter((name) => name !== '')
            .join(', ');
        const last = groups.at(-1);
        if (last !== undefined && last.roles === roles) {
            last.people.push(getPersonName(credit.person));
        } else {
            groups.push({ people: [getPersonName(credit.person)], roles });
        }
    });
    return groups
        .map((group) =>
            group.roles !== ''
                ? `${group.people.join(', ')} (${group.roles})`
                : group.people.join(', '),
        )
        .join(', ');
}
