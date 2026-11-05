// The item a create page just created, for the list of its resource: it highlights the item once,
// or says it was created when it doesn't show it (decision 0066). Kept for the next list that
// opens, rather than in the URL or the history, so that a reload or Back doesn't show it again.

export interface CreatedItem {
    resource: string;
    id: string;
    /** Its title, for the toast of a list that doesn't show it. */
    title: string | null;
    /** Where its title goes, for the toast's "Open". */
    href: string;
}

let created: CreatedItem | null = null;

/** Keeps the item just created, for the list that opens next. */
export function setCreatedItem(item: CreatedItem | null): void {
    created = item;
}

/** The item just created in a resource, if the list of that resource hasn't taken it yet. */
export function peekCreatedItem(resource: string): CreatedItem | null {
    return created?.resource === resource ? created : null;
}

/** Forgets the item once its list took it. */
export function clearCreatedItem(item: CreatedItem): void {
    if (created === item) {
        created = null;
    }
}
